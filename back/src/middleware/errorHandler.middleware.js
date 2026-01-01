export const errorHandler = (err, req, res, next) => {
    console.error('Erreur:', err);

    if (err.name === 'ValidationError' || err.name === 'ZodError') {
        return res.status(400).json({ 
            error: 'Erreur de validation',
            details: err.errors || err.message 
        });
    }

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
            error: 'Token invalide ou expiré' 
        });
    }

    if (err.airtableError) {
        const airtableMsg = err.airtableError.message || err.airtableError.toString();
        return res.status(500).json({ 
            error: `Erreur Airtable: ${airtableMsg}`,
            details: err.airtableError
        });
    }

    if (err.message) {
        return res.status(err.statusCode || 500).json({ 
            error: err.message 
        });
    }

    res.status(500).json({ 
        error: 'Une erreur interne est survenue'
    });
};

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
