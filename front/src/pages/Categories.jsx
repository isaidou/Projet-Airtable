import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, updateCategorySchema } from "../schemas/validation";
import { Button } from "../components/Button";
import { useGetCategories } from "../services/useGetCategories";
import { useGetProjects } from "../services/useGetProjects";
import { postJson, putJson, deleteJson } from "../services/fetch.services";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { Edit, Trash2, Loader2 } from "lucide-react";

export const Categories = () => {
    const { categories, getCategories, loading } = useGetCategories();
    const { projects } = useGetProjects();
    const { showNotification } = useNotification();
    const { isAdmin } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showProjectsModal, setShowProjectsModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(categorySchema),
    });

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
        reset: resetEdit,
    } = useForm({
        resolver: zodResolver(updateCategorySchema),
    });

    const onSubmit = async (data) => {
        try {
            await postJson('category', data);
            setIsModalOpen(false);
            reset();
            getCategories();
            showNotification('Catégorie créée avec succès !', 'success');
        } catch (err) {
            const errorMessage = err.message || err.error || 'Erreur lors de la création de la catégorie';
            showNotification(errorMessage, 'error');
        }
    };

    const onSubmitEdit = async (data) => {
        try {
            await putJson('category', data);
            setEditingCategory(null);
            resetEdit();
            getCategories();
            showNotification('Catégorie modifiée avec succès !', 'success');
        } catch (err) {
            const errorMessage = err.message || err.error || 'Erreur lors de la modification de la catégorie';
            showNotification(errorMessage, 'error');
        }
    };

    const handleDelete = async () => {
        if (selectedCategory) {
            try {
                await deleteJson('category', { id: selectedCategory.id });
                showNotification('Catégorie supprimée avec succès', 'success');
                getCategories();
                setShowDeleteModal(false);
                setSelectedCategory(null);
            } catch (error) {
                const errorMessage = error.message || error.error || 'Erreur lors de la suppression';
                showNotification(errorMessage, 'error');
            }
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        resetEdit({
            id: category.id,
            category_name: category.category_name,
            description: category.description,
        });
    };

    const filteredProjects = selectedCategory
        ? projects.filter(project =>
            Array.isArray(project.category)
                ? project.category.includes(selectedCategory.id)
                : project.category === selectedCategory.id
        )
        : [];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="animate-spin text-slate-900 mb-4" size={48} />
                    <p className="text-slate-600 text-lg">Chargement des catégories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {isAdmin && (
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-semibold text-slate-900">Catégories</h1>
                    <Button
                        label="Ajouter une catégorie"
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
            )}
            {!isAdmin && (
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-slate-900">Catégories</h1>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((categorie, index) => (
                    <div
                        key={index}
                        className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 cursor-pointer" onClick={() => { setSelectedCategory(categorie); setShowProjectsModal(true); }}>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">{categorie.category_name}</h3>
                                <p className="text-sm text-slate-600">{categorie.description}</p>
                            </div>
                            {isAdmin && (
                                <div className="flex gap-2 ml-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(categorie);
                                        }}
                                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                        title="Modifier"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedCategory(categorie);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    reset();
                }}
                title="Ajouter une catégorie"
                actions={
                    <>
                        <Button
                            label="Annuler"
                            onClick={() => {
                                setIsModalOpen(false);
                                reset();
                            }}
                            color="outline"
                        />
                        <Button
                            label="Ajouter"
                            type="submit"
                            form="category-form"
                            disabled={isSubmitting}
                        />
                    </>
                }
            >
                <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Nom de la catégorie"
                        placeholder="Ex: Application Web"
                        {...register('category_name')}
                        error={errors.category_name?.message}
                    />
                    <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">Description</label>
                        <textarea
                            {...register('description')}
                            placeholder="Description de la catégorie"
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors resize-none ${
                                errors.description ? 'border-red-500' : 'border-slate-300'
                            }`}
                            rows={4}
                        />
                        {errors.description && (
                            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                        )}
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={editingCategory !== null}
                onClose={() => {
                    setEditingCategory(null);
                    resetEdit();
                }}
                title="Modifier la catégorie"
                actions={
                    <>
                        <Button
                            label="Annuler"
                            onClick={() => {
                                setEditingCategory(null);
                                resetEdit();
                            }}
                            color="outline"
                        />
                        <Button
                            label="Enregistrer"
                            type="submit"
                            form="category-edit-form"
                            disabled={isSubmittingEdit}
                        />
                    </>
                }
            >
                <form id="category-edit-form" onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-4">
                    <Input
                        label="Nom de la catégorie"
                        placeholder="Ex: Application Web"
                        {...registerEdit('category_name')}
                        error={errorsEdit.category_name?.message}
                    />
                    <div>
                        <label className="block text-slate-700 text-sm font-medium mb-2">Description</label>
                        <textarea
                            {...registerEdit('description')}
                            placeholder="Description de la catégorie"
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors resize-none ${
                                errorsEdit.description ? 'border-red-500' : 'border-slate-300'
                            }`}
                            rows={4}
                        />
                        {errorsEdit.description && (
                            <p className="text-red-600 text-sm mt-1">{errorsEdit.description.message}</p>
                        )}
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedCategory(null);
                }}
                title="Supprimer la catégorie"
                actions={
                    <>
                        <Button
                            label="Annuler"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedCategory(null);
                            }}
                            color="outline"
                        />
                        <Button
                            label="Supprimer"
                            onClick={handleDelete}
                            color="danger"
                        />
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-red-600 font-semibold">
                        ⚠️ Attention : Cette action est irréversible !
                    </p>
                    <p className="text-slate-600">
                        Êtes-vous sûr de vouloir supprimer la catégorie <strong>{selectedCategory?.category_name}</strong> ?
                    </p>
                </div>
            </Modal>

            <Modal
                isOpen={showProjectsModal}
                onClose={() => { setShowProjectsModal(false); setSelectedCategory(null); }}
                title={selectedCategory ? `Projets - ${selectedCategory.category_name}` : "Projets"}
            >
                {filteredProjects.length === 0 ? (
                    <p className="text-slate-500">Aucun projet dans cette catégorie.</p>
                ) : (
                    <ul className="space-y-3">
                        {filteredProjects.map((project, idx) => (
                            <li key={idx} className="border-b border-slate-200 pb-3 last:border-0">
                                <span className="font-semibold text-slate-900 block mb-1">{project.name}</span>
                                <div className="text-sm text-slate-600">{project.description}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </Modal>
        </div>
    );
};
