export const escapeAirtableFormula = (value) => {
    if (typeof value !== 'string') {
        return value;
    }
    return value.replace(/'/g, "\\'").replace(/"/g, '\\"');
};

export const sanitizeEmail = (email) => {
    if (typeof email !== 'string') {
        return '';
    }
    return email.trim().toLowerCase();
};

export const sanitizeId = (id) => {
    if (typeof id !== 'string') {
        return '';
    }
    return id.trim().replace(/[^a-zA-Z0-9]/g, '');
};

export const sanitizeText = (text) => {
    if (typeof text !== 'string') {
        return '';
    }
    return text.trim().replace(/[\x00-\x1F\x7F]/g, '').substring(0, 10000);
};

export const sanitizeUrl = (url) => {
    if (!url || typeof url !== 'string') {
        return '';
    }
    try {
        const parsed = new URL(url.trim());
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return '';
        }
        return parsed.toString();
    } catch {
        return '';
    }
};
