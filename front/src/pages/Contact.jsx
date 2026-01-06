import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "../schemas/validation";
import Input from "../components/Input";
import { Button } from "../components/Button";
import { postJson } from "../services/fetch.services";
import { useNotification } from "../contexts/NotificationContext";
import { useState } from "react";

export const Contact = () => {
    const { showNotification } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(contactSchema),
    });

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            await postJson('contact', data);
            showNotification('Votre demande a été envoyée avec succès ! Nous vous contacterons bientôt.', 'success');
            reset();
        } catch (err) {
            const errorMessage = err.message || err.error || 'Une erreur est survenue lors de l\'envoi';
            showNotification(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                    <h1 className="text-3xl font-semibold text-slate-900 mb-2 text-center">
                        Être contacté
                    </h1>
                    <p className="text-sm text-slate-600 text-center mb-8">
                        Laissez vos coordonnées et nous vous contacterons pour plus d'informations
                    </p>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="Jean"
                                label="Prénom *"
                                {...register('first_name')}
                                error={errors.first_name?.message}
                            />
                            <Input
                                placeholder="Dupont"
                                label="Nom *"
                                {...register('last_name')}
                                error={errors.last_name?.message}
                            />
                        </div>
                        <Input
                            placeholder="votre@email.com"
                            label="Email *"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                        <Input
                            placeholder="+33 6 12 34 56 78"
                            label="Téléphone"
                            {...register('phone')}
                            error={errors.phone?.message}
                        />
                        <Input
                            placeholder="123 Rue Example, 75001 Paris"
                            label="Adresse"
                            {...register('address')}
                            error={errors.address?.message}
                        />
                        <Input
                            placeholder="Formation qui vous intéresse"
                            label="Formation d'intérêt"
                            {...register('formation_interest')}
                            error={errors.formation_interest?.message}
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Message
                            </label>
                            <textarea
                                {...register('message')}
                                rows={4}
                                placeholder="Votre message (optionnel)"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                            )}
                        </div>
                        <div className="mt-6">
                            <Button
                                label="Envoyer ma demande"
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full"
                                color="success"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

