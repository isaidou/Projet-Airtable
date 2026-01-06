import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { retrieve } from './src/bdd/CRUD/retrieve.js';
import { register } from './src/authentification/register.js';
import { login } from './src/authentification/login.js';
import { create } from './src/bdd/CRUD/create.js';
import { update } from './src/bdd/CRUD/update.js';
import { destroy } from './src/bdd/CRUD/destroy.js';
import { checkIdsExistence, toArray, retrieveLinkedDetails } from './src/utils/utils.bdd.js';
import { sanitizeId, sanitizeUrl, sanitizeText, sanitizeEmail } from './src/utils/sanitize.js';
import { authenticate, requireAdmin } from './src/middleware/auth.middleware.js';
import { validate } from './src/middleware/validate.middleware.js';
import { errorHandler, asyncHandler } from './src/middleware/errorHandler.middleware.js';
import {
    loginSchema,
    registerSchema,
    updateUserSchema,
    promoteUserSchema,
    projectSchema,
    updateProjectSchema,
    categorySchema,
    updateCategorySchema,
    technologySchema,
    updateTechnologySchema,
    commentSchema,
    updateCommentSchema,
    likeProjectSchema,
    publishProjectSchema,
    contactSchema,
} from './src/schemas/validation.js';

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:2000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

app.post('/contact', validate(contactSchema), asyncHandler(async (req, res) => {
    const { first_name, last_name, email, phone, address, formation_interest, message } = req.body;
    
    const contactData = {
        first_name: sanitizeText(first_name),
        last_name: sanitizeText(last_name),
        email: sanitizeEmail(email),
        phone: phone ? sanitizeText(phone) : '',
        address: address ? sanitizeText(address) : '',
        formation_interest: formation_interest ? sanitizeText(formation_interest) : '',
        message: message ? sanitizeText(message) : '',
        status: 'nouveau'
    };

    const data = await create('Contacts', contactData);
    res.send({ success: true, message: 'Votre demande a été envoyée avec succès !', data });
}));

app.get('/contact', authenticate, requireAdmin, asyncHandler(async (req, res) => {
    const data = await retrieve('Contacts');
    res.send(data);
}));

app.put('/contact', authenticate, requireAdmin, asyncHandler(async (req, res) => {
    const { id, status } = req.body;

    if (!id) {
        throw new Error("Un ID est obligatoire pour mettre à jour le contact");
    }

    await checkIdsExistence('Contacts', id);

    const data = await update('Contacts', [{
        id: sanitizeId(id),
        fields: {
            status: status || 'nouveau'
        }
    }]);
    res.send(data);
}));

app.post('/user', validate(registerSchema), asyncHandler(async (req, res) => {
    const data = await register(req.body);
    res.send(data);
}));

app.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
    const data = await login(req.body.email, req.body.password);
    res.send(data);
}));

app.get('/user', authenticate, asyncHandler(async (req, res) => {
        const data = await retrieve('Users');
        res.send(data);
}));

app.put('/user', authenticate, validate(updateUserSchema), asyncHandler(async (req, res) => {
    const { id, email, password, first_name, last_name, phone, address } = req.body;

    if (req.user.userId !== id && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Vous ne pouvez modifier que votre propre compte' });
    }

    await checkIdsExistence('Users', id);

    const updateData = {};
    if (email) updateData.email = email;
    if (first_name) updateData.first_name = sanitizeText(first_name);
    if (last_name) updateData.last_name = sanitizeText(last_name);
    if (phone !== undefined) updateData.phone = phone ? sanitizeText(phone) : '';
    if (address !== undefined) updateData.address = address ? sanitizeText(address) : '';
    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const data = await update('Users', [{
        id,
        fields: updateData
    }]);
    res.send(data);
}));

app.put('/user/promote', authenticate, requireAdmin, validate(promoteUserSchema), asyncHandler(async (req, res) => {
    const { id, is_admin } = req.body;

    await checkIdsExistence('Users', id);

    const data = await update('Users', [{
        id: sanitizeId(id),
        fields: { is_admin: !!is_admin }
    }]);
        res.send(data);
}));

app.delete('/user', authenticate, asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        throw new Error("Un ID est obligatoire pour supprimer l'utilisateur");
    }

    if (req.user.userId !== id && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Vous ne pouvez supprimer que votre propre compte' });
    }

    await checkIdsExistence('Users', id);
    const data = await destroy('Users', [id]);
    res.send(data);
}));

app.get('/project', asyncHandler(async (req, res) => {
        const projects = await retrieve('Projets');

        const enrichedProjects = await Promise.all(
            projects.map(async (project) => {
                const [categoryDetails, technologyDetails] = await Promise.all([
                    retrieveLinkedDetails('Categories', project.category),
                    retrieveLinkedDetails('Technologies', project.technologies),
                ]);

                const commentsDetails = project.comments ? await retrieveLinkedDetails('Commentaires', project.comments) : [];

                const commentUserIds = commentsDetails.flatMap(comment => comment.user);
                const commentUserDetails = await retrieveLinkedDetails('Users', commentUserIds);

                const enrichedCommentsDetails = commentsDetails.map(comment => {
                    const userId = Array.isArray(comment.user) ? comment.user[0] : comment.user;
                    const userDetail = userId ? commentUserDetails.find(user => user.id === userId) : null;

                    return {
                        ...comment,
                        userDetails: userDetail || null
                    };
                });

                const sortedComments = enrichedCommentsDetails.sort((a, b) => {
                    const dateA = new Date(a.creation_date || 0);
                    const dateB = new Date(b.creation_date || 0);
                    return dateA - dateB;
                });

                return {
                    ...project,
                    category: project.category || [],
                    technologies: project.technologies || [],
                    categoryDetails,
                    technologyDetails,
                    commentsDetails: sortedComments,
                };
            })
        );

        res.send(enrichedProjects);
}));

app.post('/project', authenticate, requireAdmin, validate(projectSchema), asyncHandler(async (req, res) => {
    const { name, created_by, description, project_link, category, technologies, image_url } = req.body;

        const data = {
        name: sanitizeText(name),
            created_by: sanitizeText(created_by),
            category: toArray(category),
        likes: [],
            publishing_status: "caché",
        description: sanitizeText(description),
        project_link: project_link ? sanitizeUrl(project_link) : '',
            technologies: toArray(technologies),
        image: image_url ? [{ url: sanitizeUrl(image_url) }] : []
    };

        await checkIdsExistence('Categories', category);
        await checkIdsExistence('Technologies', technologies);

        const query = await create("Projets", data);
        res.send(query);
}));

app.put('/project', authenticate, requireAdmin, validate(updateProjectSchema), asyncHandler(async (req, res) => {
    const { id, name, created_by, description, project_link, category, technologies, image_url } = req.body;

        await checkIdsExistence('Projets', id);
        await checkIdsExistence('Categories', category);
        await checkIdsExistence('Technologies', technologies);

        const data = {
        name: sanitizeText(name),
            created_by: sanitizeText(created_by),
            category: toArray(category),
        description: sanitizeText(description),
        project_link: project_link ? sanitizeUrl(project_link) : '',
            technologies: toArray(technologies),
    };

        if (image_url !== undefined) {
            if (image_url && image_url !== '') {
                data.image = [{ url: sanitizeUrl(image_url) }];
            } else {
                data.image = [];
            }
        }

        const query = await update("Projets", [{
        id: sanitizeId(id),
            fields: data
        }]);
        res.send(query);
}));

app.delete('/project', authenticate, requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        throw new Error("Un ID est obligatoire pour supprimer le projet");
    }

    await checkIdsExistence('Projets', id);
    const data = await destroy('Projets', [id]);
    res.send(data);
}));

app.put('/project/like', authenticate, validate(likeProjectSchema), asyncHandler(async (req, res) => {
        const { id, user } = req.body;

    if (req.user.userId !== user) {
        return res.status(403).json({ error: 'Vous ne pouvez liker qu\'avec votre propre compte' });
        }

    const sanitizedId = sanitizeId(id);
    const records = await retrieve('Projets', { filterByFormula: `RECORD_ID()='${sanitizedId}'` });

        if (records.length === 0) {
        throw new Error(`Le projet avec l'ID ${sanitizedId} n'existe pas`);
        }

        await checkIdsExistence('Users', user);
        const oldProject = records[0];
        const likes = toArray(oldProject.likes);

        if (likes.includes(user)) {
            const updatedLikes = likes.filter(like => like !== user);
            const data = await update('Projets', [{
            id: sanitizedId,
                fields: {
                    "likes": updatedLikes
                }
            }]);
            res.send({ data, message: 'Like retiré' });
        } else {
            const data = await update('Projets', [{
            id: sanitizedId,
                fields: {
                    "likes": [...likes, user]
                }
            }]);
            res.send({ data, message: 'Like ajouté' });
        }
}));

app.put('/project/publishing_status', authenticate, requireAdmin, validate(publishProjectSchema), asyncHandler(async (req, res) => {
    const { id, publishing_status } = req.body;

    await checkIdsExistence('Projets', id);

        const data = await update('Projets', [{
        id: sanitizeId(id),
            fields: {
                "publishing_status": publishing_status
            }
        }]);
        res.send({ data });
}));

app.get('/category', asyncHandler(async (req, res) => {
        const data = await retrieve('Categories');
        res.send(data);
}));

app.post('/category', authenticate, requireAdmin, validate(categorySchema), asyncHandler(async (req, res) => {
    const { category_name, description } = req.body;
    const data = await create('Categories', {
        category_name: sanitizeText(category_name),
        description: sanitizeText(description)
    });
    res.send(data);
}));

app.put('/category', authenticate, requireAdmin, validate(updateCategorySchema), asyncHandler(async (req, res) => {
    const { id, category_name, description } = req.body;

    await checkIdsExistence('Categories', id);

    const data = await update('Categories', [{
        id: sanitizeId(id),
        fields: {
            category_name: sanitizeText(category_name),
            description: sanitizeText(description)
        }
    }]);
        res.send(data);
}));

app.delete('/category', authenticate, requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        throw new Error("Un ID est obligatoire pour supprimer la catégorie");
    }

    await checkIdsExistence('Categories', id);
    const data = await destroy('Categories', [id]);
    res.send(data);
}));

app.get('/technology', asyncHandler(async (req, res) => {
        const data = await retrieve('Technologies');
        res.send(data);
}));

app.post('/technology', authenticate, requireAdmin, validate(technologySchema), asyncHandler(async (req, res) => {
    const { name } = req.body;
    const data = await create('Technologies', {
        name: sanitizeText(name)
    });
    res.send(data);
}));

app.put('/technology', authenticate, requireAdmin, validate(updateTechnologySchema), asyncHandler(async (req, res) => {
    const { id, name } = req.body;

    await checkIdsExistence('Technologies', id);

    const data = await update('Technologies', [{
        id: sanitizeId(id),
        fields: {
            name: sanitizeText(name)
        }
    }]);
        res.send(data);
}));

app.delete('/technology', authenticate, requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        throw new Error("Un ID est obligatoire pour supprimer la technologie");
    }

    await checkIdsExistence('Technologies', id);
    const data = await destroy('Technologies', [id]);
    res.send(data);
}));

app.get('/comment', authenticate, asyncHandler(async (req, res) => {
        const data = await retrieve('Commentaires');
        res.send(data);
}));

app.post('/comment', authenticate, validate(commentSchema), asyncHandler(async (req, res) => {
    const { comment, project, user } = req.body;

    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (req.user.userId !== user) {
        return res.status(403).json({ error: 'Vous ne pouvez commenter qu\'avec votre propre compte' });
    }

    await checkIdsExistence('Projets', project);

    const fieldsToCreate = {
        comment: sanitizeText(comment),
        project: [project],
        user: [user],
    };

    const data = await create('Commentaires', fieldsToCreate);
    res.send(data);
}));

app.put('/comment', authenticate, requireAdmin, validate(updateCommentSchema), asyncHandler(async (req, res) => {
    const { id, comment } = req.body;

    await checkIdsExistence('Commentaires', id);

    const data = await update('Commentaires', [{
        id: sanitizeId(id),
        fields: {
            comment: sanitizeText(comment)
        }
    }]);
        res.send(data);
}));

app.delete('/comment', authenticate, requireAdmin, asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        throw new Error("Un ID est obligatoire pour supprimer le commentaire");
    }

    await checkIdsExistence('Commentaires', id);
    const data = await destroy('Commentaires', [id]);
    res.send(data);
}));

app.use(errorHandler);

app.listen(port, () => {
});
