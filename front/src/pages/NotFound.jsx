import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Page non trouvée</h2>
                <p className="text-slate-600 mb-8">
                    La page que vous recherchez n'existe pas ou a été déplacée.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button
                        label="Retour à l'accueil"
                        onClick={() => navigate('/')}
                    />
                    <Button
                        label="Retour en arrière"
                        onClick={() => navigate(-1)}
                        color="outline"
                    />
                </div>
            </div>
        </div>
    );
};

