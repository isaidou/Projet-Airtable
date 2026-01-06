import { useEffect, useState } from "react";
import { getJson, putJson } from "../services/fetch.services";
import { useNotification } from "../contexts/NotificationContext";
import { useAuth } from "../contexts/AuthContext";
import { useGlobal } from "../contexts/GlobalContext";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

export const Contacts = () => {
    const { isAdmin } = useAuth();
    const { showNotification } = useNotification();
    const { setGlobalLoading } = useGlobal();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAdmin) {
            loadContacts();
        }
    }, [isAdmin]);

    const loadContacts = async () => {
        try {
            setLoading(true);
            setGlobalLoading(true);
            const data = await getJson('contact');
            setContacts(data);
        } catch (error) {
            const errorMessage = error.message || error.error || 'Erreur lors du chargement';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
            setGlobalLoading(false);
        }
    };

    const handleStatusChange = async (contactId, newStatus) => {
        try {
            await putJson('contact', { id: contactId, status: newStatus });
            showNotification('Statut mis à jour avec succès', 'success');
            loadContacts();
        } catch (error) {
            const errorMessage = error.message || error.error || 'Erreur lors de la mise à jour';
            showNotification(errorMessage, 'error');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'nouveau':
                return <Clock className="text-blue-500" size={20} />;
            case 'contacté':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'traité':
                return <XCircle className="text-slate-500" size={20} />;
            default:
                return <Clock className="text-blue-500" size={20} />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'nouveau':
                return 'Nouveau';
            case 'contacté':
                return 'Contacté';
            case 'traité':
                return 'Traité';
            default:
                return status || 'Nouveau';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="animate-spin text-slate-900 mb-4" size={48} />
                    <p className="text-slate-600 text-lg">Chargement des demandes de contact...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-slate-900">Demandes de contact</h1>
                <p className="text-slate-600 mt-2">{contacts.length} demande{contacts.length > 1 ? 's' : ''}</p>
            </div>
            <div className="space-y-4">
                {contacts.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-500 text-lg">Aucune demande de contact</p>
                    </div>
                ) : (
                    contacts.map((contact) => (
                        <div
                            key={contact.id}
                            className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900">
                                        {contact.first_name} {contact.last_name}
                                    </h3>
                                    <p className="text-slate-600 text-sm mt-1">{contact.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(contact.status)}
                                    <span className="text-sm font-medium text-slate-700">
                                        {getStatusLabel(contact.status)}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {contact.phone && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Téléphone</label>
                                        <p className="text-slate-900">{contact.phone}</p>
                                    </div>
                                )}
                                {contact.address && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Adresse</label>
                                        <p className="text-slate-900">{contact.address}</p>
                                    </div>
                                )}
                                {contact.formation_interest && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Formation d'intérêt</label>
                                        <p className="text-slate-900">{contact.formation_interest}</p>
                                    </div>
                                )}
                                {contact.creation_date && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1">Date de demande</label>
                                        <p className="text-slate-900">
                                            {new Date(contact.creation_date).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {contact.message && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Message</label>
                                    <p className="text-slate-900 bg-slate-50 p-3 rounded-md">{contact.message}</p>
                                </div>
                            )}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                                <button
                                    onClick={() => handleStatusChange(contact.id, 'nouveau')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        contact.status === 'nouveau'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    Nouveau
                                </button>
                                <button
                                    onClick={() => handleStatusChange(contact.id, 'contacté')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        contact.status === 'contacté'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    Contacté
                                </button>
                                <button
                                    onClick={() => handleStatusChange(contact.id, 'traité')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        contact.status === 'traité'
                                            ? 'bg-slate-200 text-slate-800'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    Traité
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

