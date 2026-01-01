import { retrieve } from "../bdd/CRUD/retrieve.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { escapeAirtableFormula, sanitizeEmail } from '../utils/sanitize.js';

async function login(email, password) {
    try {
        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            throw new Error('Email invalide');
        }

        const escapedEmail = escapeAirtableFormula(sanitizedEmail);
        let records = await retrieve('Users', { filterByFormula: `email = '${escapedEmail}'` });

        if (records.length === 0) {
            throw new Error('Utilisateur non trouvé');
        }

        const user = records[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Mot de passe incorrect');
        }

        const token = jwt.sign({ userId: user.id, isAdmin: !!user.is_admin }, process.env.JWT_SECRET, { expiresIn: '24h' });
        return { token };
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        throw error;
    }
}

export { login }
