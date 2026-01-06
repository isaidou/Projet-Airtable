import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "../schemas/validation";
import { useState, useEffect } from "react";
import { Button } from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { getJson, putJson, deleteJson } from "../services/fetch.services";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export const Profile = () => {
    const { userId, logout } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (userId) {
            loadUserData();
        }
    }, [userId]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const users = await getJson('user');
            const currentUser = users.find(u => u.id === userId);
            if (currentUser) {
                setUser(currentUser);
                reset({
                    email: currentUser.email || '',
                    first_name: currentUser.first_name || '',
                    last_name: currentUser.last_name || '',
                    phone: currentUser.phone || '',
                    address: currentUser.address || '',
                    formation_interest: currentUser.formation_interest || '',
                    password: '',
                    confirmPassword: '',
                });
            }
        } catch (error) {
            showNotification('Erreur lors du chargement des données', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const updateData = {
                id: userId,
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                phone: data.phone || '',
                address: data.address || '',
                formation_interest: data.formation_interest || '',
            };

            if (data.password && data.password.length > 0) {
                updateData.password = data.password;
            }

            await putJson('user', updateData);
            showNotification('Profil mis à jour avec succès !', 'success');
            setIsEditing(false);
            reset({
                ...data,
                password: '',
                confirmPassword: '',
            });
            loadUserData();
        } catch (error) {
            const errorMessage = error.message || error.error || 'Erreur lors de la mise à jour';
            showNotification(errorMessage, 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteJson('user', { id: userId });
            showNotification('Compte supprimé avec succès', 'success');
            logout();
            navigate('/login');
        } catch (error) {
            const errorMessage = error.message || error.error || 'Erreur lors de la suppression';
            showNotification(errorMessage, 'error');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="animate-spin text-slate-900 mb-4" size={48} />
                    <p className="text-slate-600 text-lg">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center text-red-600">Utilisateur non trouvé</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-semibold text-slate-900">Mon Profil</h1>
                    {!isEditing && (
                        <div className="flex gap-3">
                            <Button
                                label="Modifier"
                                onClick={() => setIsEditing(true)}
                            />
                            <Button
                                label="Supprimer"
                                onClick={() => setShowDeleteModal(true)}
                                color="danger"
                            />
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="votre@email.com"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                        <Input
                            label="Prénom"
                            placeholder="Votre prénom"
                            {...register('first_name')}
                            error={errors.first_name?.message}
                        />
                        <Input
                            label="Nom"
                            placeholder="Votre nom"
                            {...register('last_name')}
                            error={errors.last_name?.message}
                        />
                        <Input
                            label="Téléphone"
                            placeholder="+33 6 12 34 56 78"
                            {...register('phone')}
                            error={errors.phone?.message}
                        />
                        <Input
                            label="Adresse"
                            placeholder="123 Rue Example, 75001 Paris"
                            {...register('address')}
                            error={errors.address?.message}
                        />
                        <Input
                            label="Formation d'intérêt"
                            placeholder="Formation qui vous intéresse"
                            {...register('formation_interest')}
                            error={errors.formation_interest?.message}
                        />
                        <div className="border-t border-slate-200 pt-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Changer le mot de passe (optionnel)</h3>
                            <Input
                                label="Nouveau mot de passe"
                                type="password"
                                placeholder="Laissez vide pour ne pas changer"
                                {...register('password')}
                                error={errors.password?.message}
                            />
                            <Input
                                label="Confirmer le mot de passe"
                                type="password"
                                placeholder="Confirmez le nouveau mot de passe"
                                {...register('confirmPassword')}
                                error={errors.confirmPassword?.message}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                label="Enregistrer"
                                type="submit"
                                disabled={isSubmitting}
                                color="success"
                            />
                            <Button
                                label="Annuler"
                                onClick={() => {
                                    setIsEditing(false);
                                    loadUserData();
                                }}
                                color="outline"
                                type="button"
                            />
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                                <p className="text-slate-900">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Prénom</label>
                                <p className="text-slate-900">{user.first_name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Nom</label>
                                <p className="text-slate-900">{user.last_name}</p>
                            </div>
                            {user.phone && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Téléphone</label>
                                    <p className="text-slate-900">{user.phone}</p>
                                </div>
                            )}
                            {user.address && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Adresse</label>
                                    <p className="text-slate-900">{user.address}</p>
                                </div>
                            )}
                            {user.formation_interest && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Formation d'intérêt</label>
                                    <p className="text-slate-900">{user.formation_interest}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Statut</label>
                                <p className="text-slate-900">
                                    {user.is_admin ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-slate-900 text-white">
                                            Administrateur
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-slate-100 text-slate-700">
                                            Utilisateur
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Supprimer mon compte"
                actions={
                    <>
                        <Button
                            label="Annuler"
                            onClick={() => setShowDeleteModal(false)}
                            color="outline"
                        />
                        <Button
                            label="Confirmer la suppression"
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
                        Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données seront perdues.
                    </p>
                </div>
            </Modal>
        </div>
    );
};
