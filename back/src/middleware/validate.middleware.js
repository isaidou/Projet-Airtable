export const validate = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        } catch (error) {
            if (error.errors) {
                return res.status(400).json({
                    error: 'Erreur de validation',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message,
                    })),
                });
            }
            return res.status(400).json({ 
                error: 'Erreur de validation',
                details: error.message || 'Données invalides'
            });
        }
    };
};
