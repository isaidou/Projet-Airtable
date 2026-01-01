import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../schemas/validation";
import Input from "../components/Input";
import { Button } from "../components/Button";
import { postJson } from "../services/fetch.services";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

export const Register = () => {
    const navigate = useNavigate();
    const { setAuthFromToken } = useAuth();
    const { showNotification } = useNotification();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        try {
            const res = await postJson('user', {
                email: data.email,
                password: data.password,
                first_name: data.first_name,
                last_name: data.last_name,
                phone: data.phone || '',
                address: data.address || '',
                formation_interest: data.formation_interest || '',
            });
            setAuthFromToken(res.token);
            showNotification('Compte créé avec succès !', 'success');
            navigate('/');
        } catch (err) {
            const errorMessage = err.message || err.error || 'Une erreur est survenue lors de l\'inscription';
            showNotification(errorMessage, 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2 text-center">Créer un compte</h2>
                    <p className="text-sm text-slate-600 text-center mb-8">Rejoignez notre communauté</p>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Input
                                placeholder="Jean"
                                label="Prénom"
                                {...register('first_name')}
                                error={errors.first_name?.message}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="Dupont"
                                label="Nom"
                                {...register('last_name')}
                                error={errors.last_name?.message}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="votre@email.com"
                                label="Email"
                                type="email"
                                {...register('email')}
                                error={errors.email?.message}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="••••••••"
                                type="password"
                                label="Mot de passe"
                                {...register('password')}
                                error={errors.password?.message}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="+33 6 12 34 56 78"
                                label="Téléphone (optionnel)"
                                {...register('phone')}
                                error={errors.phone?.message}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="123 Rue Example, 75001 Paris"
                                label="Adresse (optionnel)"
                                {...register('address')}
                                error={errors.address?.message}
                            />
                        </div>
                        <div>
                            <Input
                                placeholder="Formation qui vous intéresse"
                                label="Formation d'intérêt (optionnel)"
                                {...register('formation_interest')}
                                error={errors.formation_interest?.message}
                            />
                        </div>
                        <div className="mt-6 space-y-3">
                            <Button
                                label="S'inscrire"
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full"
                            />
                            <Button
                                label="J'ai déjà un compte"
                                onClick={() => navigate('/login')}
                                color="outline"
                                className="w-full"
                                type="button"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
