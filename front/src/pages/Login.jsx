import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../schemas/validation";
import Input from "../components/Input";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showNotification } = useNotification();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            await login(data);
            showNotification('Connexion réussie !', 'success');
        } catch (err) {
            const errorMessage = err.message || err.error || 'Erreur lors de la connexion';
            showNotification(errorMessage, 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2 text-center">Connexion</h2>
                    <p className="text-sm text-slate-600 text-center mb-8">Accédez à votre compte</p>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Input
                                placeholder="votre@email.com"
                                label="Email"
                                type="email"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <Input
                                placeholder="••••••••"
                                type="password"
                                label="Mot de passe"
                                {...register('password')}
                            />
                            {errors.password && (
                                <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="mt-6 space-y-3">
                            <Button
                                label="Se connecter"
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full"
                            />
                            <Button
                                label="Créer un compte"
                                onClick={() => navigate("/register")}
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
