import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email invalide').min(1, 'Email requis'),
    password: z.string().min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
    email: z.string().email('Email invalide').min(1, 'Email requis'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    first_name: z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long'),
    last_name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
});

export const updateUserSchema = z.object({
    id: z.string().min(1, 'ID requis'),
    email: z.string().email('Email invalide').optional(),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    formation_interest: z.string().optional(),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').optional(),
});

export const promoteUserSchema = z.object({
    id: z.string().min(1, 'ID requis'),
    is_admin: z.boolean(),
});

export const projectSchema = z.object({
    name: z.string().min(1, 'Le nom du projet est requis').max(200, 'Nom trop long'),
    created_by: z.string().min(1, 'Le nom du créateur est requis'),
    category: z.string().min(1, 'Une catégorie doit être sélectionnée'),
    description: z.string().min(1, 'La description est requise').max(5000, 'Description trop longue'),
    project_link: z.string().url('URL invalide').optional().or(z.literal('')),
    technologies: z.array(z.string()).min(1, 'Au moins une technologie doit être sélectionnée'),
    image_url: z.union([z.string().url('URL invalide'), z.literal('')]).optional(),
});

export const updateProjectSchema = projectSchema.extend({
    id: z.string().min(1, 'ID requis'),
});

export const categorySchema = z.object({
    category_name: z.string().min(1, 'Le nom de la catégorie est requis').max(100, 'Nom trop long'),
    description: z.string().min(1, 'La description est requise').max(1000, 'Description trop longue'),
});

export const updateCategorySchema = categorySchema.extend({
    id: z.string().min(1, 'ID requis'),
});

export const technologySchema = z.object({
    name: z.string().min(1, 'Le nom de la technologie est requis').max(100, 'Nom trop long'),
});

export const updateTechnologySchema = technologySchema.extend({
    id: z.string().min(1, 'ID requis'),
});

export const commentSchema = z.object({
    comment: z.string().min(1, 'Le commentaire est requis').max(1000, 'Commentaire trop long'),
    project: z.string().min(1, 'Un projet doit être sélectionné'),
    user: z.string().min(1, 'Un utilisateur doit être sélectionné'),
});

export const updateCommentSchema = z.object({
    id: z.string().min(1, 'ID requis'),
    comment: z.string().min(1, 'Le commentaire est requis').max(1000, 'Commentaire trop long'),
});

export const likeProjectSchema = z.object({
    id: z.string().min(1, 'ID du projet requis'),
    user: z.string().min(1, 'ID utilisateur requis'),
});

export const publishProjectSchema = z.object({
    id: z.string().min(1, 'ID du projet requis'),
    publishing_status: z.enum(['publié', 'caché'], {
        errorMap: () => ({ message: 'Le statut doit être "publié" ou "caché"' }),
    }),
});

export const contactSchema = z.object({
    first_name: z.string().min(1, 'Prénom requis').max(100, 'Prénom trop long'),
    last_name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
    email: z.string().email('Email invalide').min(1, 'Email requis'),
    phone: z.string().optional(),
    address: z.string().optional(),
    formation_interest: z.string().optional(),
    message: z.string().optional(),
});
