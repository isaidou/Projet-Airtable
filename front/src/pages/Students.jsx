import { Button } from "../components/Button";
import { useGetStudents } from "../services/useGetStudents";
import { useAuth } from "../contexts/AuthContext";
import { deleteJson, putJson } from "../services/fetch.services";
import { useNotification } from "../contexts/NotificationContext";
import { Trash2, Shield, ShieldOff, Loader2 } from "lucide-react";
import Modal from "../components/Modal";
import { useState } from "react";

export const Students = () => {
    const { students, getStudents, loading } = useGetStudents();
    const { isAdmin } = useAuth();
    const { showNotification } = useNotification();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleDelete = async () => {
        if (selectedUser) {
            try {
                await deleteJson('user', { id: selectedUser.id });
                showNotification('Utilisateur supprimé avec succès', 'success');
                getStudents();
                setShowDeleteModal(false);
                setSelectedUser(null);
            } catch (error) {
                const errorMessage = error.message || error.error || 'Erreur lors de la suppression';
                showNotification(errorMessage, 'error');
            }
        }
    };

    const handlePromote = async (user, promote) => {
        try {
            await putJson('user/promote', { id: user.id, is_admin: promote });
            showNotification(`Utilisateur ${promote ? 'promu' : 'rétrogradé'} avec succès`, 'success');
            getStudents();
        } catch (error) {
            const errorMessage = error.message || error.error || 'Erreur lors de la modification';
            showNotification(errorMessage, 'error');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="animate-spin text-slate-900 mb-4" size={48} />
                    <p className="text-slate-600 text-lg">Chargement des utilisateurs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-slate-900">Utilisateurs</h1>
                <p className="text-slate-600 mt-2">{students.length} utilisateur{students.length > 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student, index) => (
                    <div 
                        key={index} 
                        className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="text-lg font-semibold text-slate-900">
                                        {student.first_name} {student.last_name}
                                    </div>
                                    {student.is_admin && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-900 text-white">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5 mt-2">
                                    <div className="text-sm text-slate-600">
                                        <span className="font-medium">Email:</span> {student.email}
                                    </div>
                                    {student.phone ? (
                                        <div className="text-sm text-slate-600">
                                            <span className="font-medium">Téléphone:</span> {student.phone}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 italic">
                                            Téléphone: Non renseigné
                                        </div>
                                    )}
                                    {student.address ? (
                                        <div className="text-sm text-slate-600">
                                            <span className="font-medium">Adresse:</span> {student.address}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 italic">
                                            Adresse: Non renseignée
                                        </div>
                                    )}
                                    {student.formation_interest ? (
                                        <div className="text-sm text-slate-600">
                                            <span className="font-medium">Formation d'intérêt:</span> {student.formation_interest}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-400 italic">
                                            Formation d'intérêt: Non renseignée
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handlePromote(student, !student.is_admin)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                    title={student.is_admin ? "Rétrograder" : "Promouvoir admin"}
                                >
                                    {student.is_admin ? <ShieldOff size={16} /> : <Shield size={16} />}
                                    {student.is_admin ? 'Rétrograder' : 'Promouvoir'}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedUser(student);
                                        setShowDeleteModal(true);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Supprimer
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {students.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-500">Aucun étudiant trouvé</p>
                </div>
            )}

            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                }}
                title="Supprimer l'utilisateur"
                actions={
                    <>
                        <Button
                            label="Annuler"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedUser(null);
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
                        Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong> ? Toutes ses données seront perdues.
                    </p>
                </div>
            </Modal>
        </div>
    );
};
