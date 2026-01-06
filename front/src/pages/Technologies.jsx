import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { technologySchema, updateTechnologySchema } from "../schemas/validation";
import { Button } from "../components/Button";
import { postJson, putJson, deleteJson } from "../services/fetch.services";
import { useGetTechnologies } from "../services/useGetTechnologies";
import { useGetProjects } from "../services/useGetProjects";
import Modal from "../components/Modal";
import Input from "../components/Input";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { Edit, Trash2, Loader2 } from "lucide-react";

export const Technologies = () => {
    const { technologies, getTechnologies, loading } = useGetTechnologies();
    const { projects } = useGetProjects();
    const { showNotification } = useNotification();
    const { isAdmin } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTech, setSelectedTech] = useState(null);
    const [showProjectsModal, setShowProjectsModal] = useState(false);
    const [editingTech, setEditingTech] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(technologySchema),
    });

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
        reset: resetEdit,
    } = useForm({
        resolver: zodResolver(updateTechnologySchema),
    });

    const onSubmit = async (data) => {
        try {
            await postJson('technology', data);
            setIsModalOpen(false);
            reset();
            getTechnologies();
            showNotification('Technologie créée avec succès !', 'success');
        } catch (err) {
            const errorMessage = err.message || err.error || 'Erreur lors de la création de la technologie';
            showNotification(errorMessage, 'error');
        }
    };

    const onSubmitEdit = async (data) => {
        try {
            await putJson('technology', data);
            setEditingTech(null);
            resetEdit();
            getTechnologies();
            showNotification('Technologie modifiée avec succès !', 'success');
        } catch (err) {
            const errorMessage = err.message || err.error || 'Erreur lors de la modification de la technologie';
            showNotification(errorMessage, 'error');
        }
    };

    const handleDelete = async () => {
        if (selectedTech) {
            try {
                await deleteJson('technology', { id: selectedTech.id });
                showNotification('Technologie supprimée avec succès', 'success');
                getTechnologies();
                setShowDeleteModal(false);
                setSelectedTech(null);
            } catch (error) {
                const errorMessage = error.message || error.error || 'Erreur lors de la suppression';
                showNotification(errorMessage, 'error');
            }
        }
    };

    const handleEdit = (tech) => {
        setEditingTech(tech);
        resetEdit({
            id: tech.id,
            name: tech.name,
        });
    };

    const filteredProjects = selectedTech
        ? projects.filter(project =>
            Array.isArray(project.technologies)
                ? project.technologies.includes(selectedTech.id)
                : project.technologies === selectedTech.id
        )
        : [];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="animate-spin text-slate-900 mb-4" size={48} />
                    <p className="text-slate-600 text-lg">Chargement des technologies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {isAdmin && (
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-semibold text-slate-900">Technologies</h1>
                    <Button
                        label="Ajouter une technologie"
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
            )}
            {!isAdmin && (
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-slate-900">Technologies</h1>
                </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {technologies.map((technologie, index) => (
                    <div
                        key={index}
                        className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                    >
                        <div className="flex items-center justify-between">
                            <span 
                                className="text-slate-900 font-medium cursor-pointer flex-1"
                                onClick={() => { setSelectedTech(technologie); setShowProjectsModal(true); }}
                            >
                                {technologie.name}
                            </span>
                            {isAdmin && (
                                <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(technologie);
                                        }}
                                        className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                        title="Modifier"
                                    >
                                        <Edit size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTech(technologie);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={14} />
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
                title="Ajouter une technologie"
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
                            form="technology-form"
                            disabled={isSubmitting}
                        />
                    </>
                }
            >
                <form id="technology-form" onSubmit={handleSubmit(onSubmit)}>
                    <Input
                        label="Nom de la technologie"
                        placeholder="Ex: React"
                        {...register('name')}
                        error={errors.name?.message}
                    />
                </form>
            </Modal>

            <Modal
                isOpen={editingTech !== null}
                onClose={() => {
                    setEditingTech(null);
                    resetEdit();
                }}
                title="Modifier la technologie"
                actions={
                    <>
                        <Button
                            label="Annuler"
                            onClick={() => {
                                setEditingTech(null);
                                resetEdit();
                            }}
                            color="outline"
                        />
                        <Button
                            label="Enregistrer"
                            type="submit"
                            form="technology-edit-form"
                            disabled={isSubmittingEdit}
                        />
                    </>
                }
            >
                <form id="technology-edit-form" onSubmit={handleSubmitEdit(onSubmitEdit)}>
                    <Input
                        label="Nom de la technologie"
                        placeholder="Ex: React"
                        {...registerEdit('name')}
                        error={errorsEdit.name?.message}
                    />
                </form>
            </Modal>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedTech(null);
                }}
                title="Supprimer la technologie"
                actions={
                    <>
                        <Button
                            label="Annuler"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedTech(null);
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
                        Êtes-vous sûr de vouloir supprimer la technologie <strong>{selectedTech?.name}</strong> ?
                    </p>
                </div>
            </Modal>

            <Modal
                isOpen={showProjectsModal}
                onClose={() => { setShowProjectsModal(false); setSelectedTech(null); }}
                title={selectedTech ? `Projets - ${selectedTech.name}` : "Projets"}
            >
                {filteredProjects.length === 0 ? (
                    <p className="text-slate-500">Aucun projet n'utilise cette technologie.</p>
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
