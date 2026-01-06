import { create } from "../bdd/CRUD/create.js"
import { retrieve } from "../bdd/CRUD/retrieve.js"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { escapeAirtableFormula, sanitizeEmail, sanitizeText } from '../utils/sanitize.js';

async function register(fields) {
    try {
        const { password, email, ...remainingFields } = fields

        if (!email) {
            throw new Error("Un email est obligatoire");
        }

        if (!password) {
            throw new Error("Un mot de passe est obligatoire");
        }

        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            throw new Error('Email invalide');
        }

        const escapedEmail = escapeAirtableFormula(sanitizedEmail);
        const records = await retrieve("Users", { filterByFormula: `email = '${escapedEmail}'` });
        
        if (records.length !== 0) {
            throw new Error('Cette adresse email est déjà utilisée');
        }

        const sanitizedFields = {
            first_name: sanitizeText(remainingFields.first_name || ''),
            last_name: sanitizeText(remainingFields.last_name || ''),
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await create("Users", { 
            ...sanitizedFields, 
            email: sanitizedEmail, 
            password: hashedPassword 
        });

        const token = jwt.sign(
            { userId: newUser.id, isAdmin: !!newUser.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { token };
    } catch (e) {
        console.error('Une erreur est survenue lors de l\'inscription:', e);
        throw e;
    }
}

export { register }
