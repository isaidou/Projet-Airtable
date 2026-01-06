import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../schemas/validation';
import { Button } from '../components/Button';
import Modal from './Modal';
import { postJson, putJson, deleteJson } from '../services/fetch.services';
import Input from './Input';
import { useGetCategories } from '../services/useGetCategories';
import { useGetTechnologies } from '../services/useGetTechnologies';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { z } from 'zod';
import { Trash2, MessageCircle, User } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, onSuccess, project = null }) => {
    const { isAdmin, userId, isAuthenticated } = useAuth();
    const { showNotification } = useNotification();
    const { categories } = useGetCategories();
    const { technologies } = useGetTechnologies();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        reset,
    } = useForm({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: '',
            created_by: '',
            category: '',
            description: '',
            project_link: '',
            technologies: [],
            image_url: '',
        },
    });

    const {
        register: registerComment,
        handleSubmit: handleSubmitComment,
        formState: { errors: errorsComment, isSubmitting: isSubmittingComment },
        reset: resetComment,
    } = useForm({
        resolver: zodResolver(z.object({
            comment: z.string().min(1, 'Le commentaire est requis'),
        })),
    });

    const selectedTechnologies = watch('technologies') || [];

    useEffect(() => {
        if (isOpen) {
            if (project) {
                const projectTechnologies = Array.isArray(project.technologies)
                    ? project.technologies
                    : project.technologies
                        ? [project.technologies]
                        : [];

                reset({
                    name: project.name || '',
                    created_by: project.created_by || '',
                    category: Array.isArray(project.category) ? project.category[0] : project.category || '',
                    description: project.description || '',
                    project_link: project.project_link || '',
                    technologies: projectTechnologies,
                    image_url: project?.image?.[0]?.url || project?.image || '',
                });
            } else {
                reset({
                    name: '',
                    created_by: '',
                    category: '',
                    description: '',
                    project_link: '',
                    technologies: [],
                    image_url: '',
                });
            }
            resetComment();
        }
    }, [project, isOpen, reset, resetComment]);

    const onSubmit = async (data) => {
        try {
            const method = project ? putJson : postJson;
            const payload = {
                name: data.name,
                created_by: data.created_by,
                category: data.category,
                description: data.description,
                project_link: data.project_link || '',
                technologies: data.technologies,
            };

            if (project?.id) {
                payload.id = project.id;
            }

            if (data.image_url !== undefined) {
                payload.image_url = data.image_url || '';
            }

            await method('project', payload);
            showNotification(project ? 'Projet modifié avec succès !' : 'Projet créé avec succès !', 'success');
            reset();
            onClose();
            onSuccess();
        } catch (err) {
            const errorMessage = err.message || err.error || 'Erreur lors de la sauvegarde du projet';
            showNotification(errorMessage, 'error');
        }
    };

    const handleTagClick = (technologyId) => {
        if (!selectedTechnologies.includes(technologyId)) {
            setValue('technologies', [...selectedTechnologies, technologyId], { shouldValidate: true });
        }
    };

    const handleRemoveTag = (technologyId) => {
        setValue('technologies', selectedTechnologies.filter(id => id !== technologyId), { shouldValidate: true });
    };

    const onSubmitComment = async (data) => {
        if (!project?.id || !userId) {
            showNotification('Données manquantes pour créer le commentaire', 'error');
            return;
        }
        try {
            await postJson('comment', {
                comment: data.comment,
                project: project.id,
                user: userId,
            });
            showNotification('Commentaire ajouté avec succès !', 'success');
            resetComment();
            onSuccess();
        } catch (err) {
            const errorMessage = err.message || err.data?.error || err.error || 'Erreur lors de l\'ajout du commentaire';
            showNotification(errorMessage, 'error');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
            return;
        }
        try {
            await deleteJson('comment', { id: commentId });
            showNotification('Commentaire supprimé avec succès', 'success');
            onSuccess();
        } catch (err) {
            const errorMessage = err.message || err.error || 'Erreur lors de la suppression';
            showNotification(errorMessage, 'error');
        }
    };

    const imageUrl = watch('image_url');

    return (
            <Modal
            isOpen={isOpen}
            onClose={() => {
                reset();
                resetComment();
                onClose();
            }}
            title={isAdmin && project ? "Modifier un Projet" : isAdmin ? "Créer un Projet" : project?.name || "Détails du projet"}
            actions={
                isAdmin ? (
                    <>
                        {project && (
                            <Button
                                label="Supprimer"
                                onClick={async () => {
                                    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
                                        try {
                                            await deleteJson('project', { id: project.id });
                                            showNotification('Projet supprimé avec succès', 'success');
                                            onSuccess();
                                            onClose();
                                        } catch (err) {
                                            const errorMessage = err.message || err.error || 'Erreur lors de la suppression';
                                            showNotification(errorMessage, 'error');
                                        }
                                    }
                                }}
                                color="danger"
                            />
                        )}
                        <Button
                            label="Annuler"
                            onClick={() => {
                                reset();
                                onClose();
                            }}
                            color="outline"
                        />
                        <Button
                            label={project ? "Modifier" : "Créer"}
                            type="submit"
                            form="project-form"
                            disabled={isSubmitting}
                        />
                    </>
                ) : null
            }
            headerImage={isAdmin && imageUrl ? (
                <div className="flex justify-center p-4 bg-slate-50">
                    <img
                        src={imageUrl}
                        alt="Aperçu du projet"
                        className="rounded-lg max-h-64 object-cover w-full max-w-md"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            ) : null}
        >
            {isAdmin ? (
                <form id="project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Nom du projet"
                        placeholder="Nom du projet"
                        {...register('name')}
                        error={errors.name?.message}
                    />
                    <Input
                        label="Lien du projet"
                        type="url"
                        placeholder="https://..."
                        {...register('project_link')}
                        error={errors.project_link?.message}
                    />
                    <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">Description</label>
                        <textarea
                            {...register('description')}
                            placeholder="Description du projet"
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors resize-none ${
                                errors.description ? 'border-red-500' : 'border-slate-300'
                            }`}
                            rows={4}
                        />
                        {errors.description && (
                            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                        )}
                    </div>
                    <div>
                        <Input
                            label="Image du projet (URL)"
                            type="url"
                            placeholder="https://exemple.com/image.jpg"
                            {...register('image_url')}
                            error={errors.image_url?.message}
                        />
                        {imageUrl && (
                            <div className="mt-3">
                                <img
                                    src={imageUrl}
                                    alt="Aperçu"
                                    className="max-h-48 rounded-lg border border-slate-300 w-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <Input
                            label="Créateur du projet"
                            placeholder="Nom de l'étudiant qui a créé le projet"
                            {...register('created_by')}
                            error={errors.created_by?.message}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">Catégorie</label>
                        <select
                            {...register('category')}
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors bg-white ${
                                errors.category ? 'border-red-500' : 'border-slate-300'
                            }`}
                        >
                            <option value="" disabled>Sélectionner une catégorie</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">Technologies</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {technologies.map((technology) => (
                                <button
                                    key={technology.id}
                                    type="button"
                                    onClick={() => handleTagClick(technology.id)}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        selectedTechnologies.includes(technology.id)
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {technology.name}
                                </button>
                            ))}
                        </div>
                        {selectedTechnologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedTechnologies.map((techId) => {
                                    const techName = technologies.find(tech => tech.id === techId)?.name || techId;
                                    return (
                                        <span
                                            key={techId}
                                            className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm"
                                        >
                                            {techName}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(techId)}
                                                className="text-slate-500 hover:text-slate-900 ml-1"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        {errors.technologies && (
                            <p className="text-red-600 text-sm mt-1">{errors.technologies.message}</p>
                        )}
                    </div>
                </form>
            ) : null}
            
            {!isAdmin && project && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center">
                                <User size={12} className="text-slate-500" />
                            </div>
                            <span className=" text-slate-900">
                                {project?.created_by || 'Auteur inconnu'}
                            </span>
                        </div>
                        {project?.project_link && (
                            <>
                                <span>·</span>
                                <a 
                                    href={project.project_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-slate-600 hover:text-slate-900 hover:underline"
                                >
                                    {project.project_link}
                                </a>
                            </>
                        )}
                        {project?.categoryDetails?.[0] && (
                            <>
                                <span>·</span>
                                <span>{project.categoryDetails[0].category_name}</span>
                            </>
                        )}
                    </div>

                    {project?.image?.[0]?.url && (
                        <div className="mb-4">
                            <img
                                src={project.image[0].url}
                                alt={project.name}
                                className="w-full rounded-lg object-cover max-h-96"
                            />
                        </div>
                    )}

                    {project?.description && (
                        <div>
                            <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">{project.description}</p>
                        </div>
                    )}
                </div>
            )}
            
            {project && (
                <div className="border-t border-slate-200 pt-6 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircle size={18} className="text-indigo-600" />
                        <span className="text-sm font-semibold text-slate-900">
                            {project?.commentsDetails?.length || 0} commentaire{project?.commentsDetails?.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    
                    {project?.commentsDetails && project.commentsDetails.length > 0 ? (
                        <ul className="space-y-3 mb-4">
                            {project.commentsDetails.map((comment, idx) => (
                                <li key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-7 h-7 rounded-full bg-indigo-200 flex-shrink-0 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                                                    {comment.userDetails && comment.userDetails.first_name
                                                        ? comment.userDetails.first_name[0].toUpperCase()
                                                        : 'A'}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-900">
                                                    {comment.userDetails && comment.userDetails.first_name && comment.userDetails.last_name
                                                        ? `${comment.userDetails.first_name} ${comment.userDetails.last_name}`
                                                        : 'Anonyme'}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 text-sm ml-9 leading-relaxed">{comment.comment}</p>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                                                title="Supprimer le commentaire"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 text-sm mb-4 text-center py-4 bg-slate-50 rounded-lg border border-slate-100">Aucun commentaire pour le moment.</p>
                    )}

                    {isAuthenticated && project?.id && (
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                            <form onSubmit={handleSubmitComment(onSubmitComment)}>
                                <div>
                                    <textarea
                                        {...registerComment('comment')}
                                        placeholder="Ajouter un commentaire..."
                                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none bg-white ${
                                            errorsComment.comment ? 'border-red-500' : 'border-indigo-200'
                                        }`}
                                        rows={3}
                                    />
                                    {errorsComment.comment && (
                                        <p className="text-red-600 text-sm mt-1">{errorsComment.comment.message}</p>
                                    )}
                                </div>
                                <div className="mt-3">
                                    <Button
                                        label={isSubmittingComment ? "Publication..." : "Publier"}
                                        type="submit"
                                        disabled={isSubmittingComment}
                                        className="text-sm"
                                    />
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default ProjectModal;
