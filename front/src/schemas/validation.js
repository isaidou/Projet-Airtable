import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Email invalide').min(1, 'Email requis'),
    password: z.string().min(1, 'Mot de passe requis'),
});

export const registerSchema = z.object({
    email: z.string().email('Email invalide').min(1, 'Email requis'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    first_name: z.string().min(1, 'Prénom requis'),
    last_name: z.string().min(1, 'Nom requis'),
});

export const profileSchema = z.object({
    email: z.string().email('Email invalide').min(1, 'Email requis'),
    first_name: z.string().min(1, 'Prénom requis'),
    last_name: z.string().min(1, 'Nom requis'),
    phone: z.string().optional(),
    address: z.string().optional(),
    formation_interest: z.string().optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
    }
    return true;
}, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
    path: ['password'],
}).refine((data) => {
    if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
});

export const projectSchema = z.object({
    name: z.string().min(1, 'Le nom du projet est requis'),
    created_by: z.string().min(1, 'Le nom du créateur est requis'),
    category: z.string().min(1, 'Une catégorie doit être sélectionnée'),
    description: z.string().min(1, 'La description est requise'),
    project_link: z.union([z.string().url('URL invalide'), z.literal('')]).optional(),
    technologies: z.array(z.string()).min(1, 'Au moins une technologie doit être sélectionnée'),
    image_url: z.union([z.string().url('URL invalide'), z.literal('')]).optional(),
});

export const categorySchema = z.object({
    category_name: z.string().min(1, 'Le nom de la catégorie est requis'),
    description: z.string().min(1, 'La description est requise'),
});

export const updateCategorySchema = categorySchema.extend({
    id: z.string().min(1, 'ID requis'),
});

export const technologySchema = z.object({
    name: z.string().min(1, 'Le nom de la technologie est requis'),
});

export const updateTechnologySchema = technologySchema.extend({
    id: z.string().min(1, 'ID requis'),
});

export const commentSchema = z.object({
    comment: z.string().min(1, 'Le commentaire est requis'),
    project: z.string().min(1, 'Un projet doit être sélectionné'),
});

export const updateCommentSchema = z.object({
    id: z.string().min(1, 'ID requis'),
    comment: z.string().min(1, 'Le commentaire est requis').max(1000, 'Commentaire trop long'),
});

export const contactSchema = z.object({
    first_name: z.string().min(1, 'Prénom requis'),
    last_name: z.string().min(1, 'Nom requis'),
    email: z.string().email('Email invalide').min(1, 'Email requis'),
    phone: z.string().optional(),
    address: z.string().optional(),
    formation_interest: z.string().optional(),
    message: z.string().optional(),
});
