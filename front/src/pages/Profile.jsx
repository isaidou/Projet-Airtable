import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "../schemas/validation";
import { useState, useEffect, useRef } from "react";
import { Button } from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { getJson, putJson, deleteJson } from "../services/fetch.services";
import { useNavigate } from "react-router-dom";
import { Loader2, Edit, Trash2 } from "lucide-react";

export const Profile = () => {
    const { userId, logout } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const formRef = useRef(null);

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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile</h1>
                <p className="text-slate-600">View all your profile details here.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    <div className="lg:col-span-1 flex">
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col w-full">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                                    <span className="text-3xl font-bold text-slate-700">
                                        {user.first_name?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    {user.first_name} {user.last_name}
                                </h2>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    user.is_admin 
                                        ? 'bg-slate-900 text-white' 
                                        : 'bg-slate-100 text-slate-700'
                                }`}>
                                    {user.is_admin ? 'Administrateur' : 'Utilisateur'}
                                </span>
                            </div>
                            <div className="flex gap-2 mt-auto">
                                <Button
                                    label="Modifier"
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1"
                                />
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-4 py-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors border border-red-200"
                                    title="Supprimer"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 flex">
                        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col w-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-slate-900">Informations personnelles</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-600">Nom</label>
                                        <p className="text-slate-900 mt-1">{user.last_name || '-'}</p>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-600">Prénom</label>
                                        <p className="text-slate-900 mt-1">{user.first_name || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-600">Email</label>
                                        <p className="text-slate-900 mt-1">{user.email}</p>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-600">Téléphone</label>
                                        <p className="text-slate-900 mt-1">{user.phone || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium text-slate-600">Adresse</label>
                                        <p className="text-slate-900 mt-1">{user.address || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            <Modal
                isOpen={isEditing}
                onClose={() => {
                    setIsEditing(false);
                    loadUserData();
                }}
                title="Modifier mon profil"
                actions={
                    <>
                        <Button
                            label="Annuler"
                            onClick={() => {
                                setIsEditing(false);
                                loadUserData();
                            }}
                            color="outline"
                            type="button"
                        />
                        <Button
                            label="Enregistrer"
                            onClick={() => formRef.current?.requestSubmit()}
                            disabled={isSubmitting}
                            color="success"
                            type="button"
                        />
                    </>
                }
            >
                <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>
                    <div className="border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Changer le mot de passe (optionnel)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>
                </form>
            </Modal>

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
