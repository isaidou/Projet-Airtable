import { retrieve } from "../bdd/CRUD/retrieve.js";
import { sanitizeId, escapeAirtableFormula } from './sanitize.js';

export async function checkIdsExistence(table, ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    if (idArray.length === 0) {
        throw new Error('Aucun ID fourni');
    }

    const sanitizedIds = idArray.map(id => sanitizeId(String(id))).filter(id => id.length > 0);
    
    if (sanitizedIds.length === 0) {
        throw new Error('Aucun ID valide fourni');
    }

    const escapedIds = sanitizedIds.map(id => escapeAirtableFormula(id));
    const filter = { filterByFormula: `OR(${escapedIds.map(id => `RECORD_ID()='${id}'`).join(',')})` };
    
    const records = await retrieve(table, filter);
    
    if (records.length !== sanitizedIds.length) {
        const foundIds = records.map(r => r.id);
        const missingIds = sanitizedIds.filter(id => !foundIds.includes(id));
        throw new Error(`Les IDs suivants n'existent pas dans ${table}: ${missingIds.join(', ')}`);
    }
    
    return true;
}

export function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (value === null || value === undefined || value === '') {
        return [];
    }
    return [value];
}

export async function retrieveLinkedDetails(table, ids) {
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
        return [];
    }

    const idArray = toArray(ids);
    
    if (idArray.length === 0) {
        return [];
    }

    const sanitizedIds = idArray.map(id => sanitizeId(String(id))).filter(id => id.length > 0);
    
    if (sanitizedIds.length === 0) {
        return [];
    }

    const escapedIds = sanitizedIds.map(id => escapeAirtableFormula(id));
    const filter = { filterByFormula: `OR(${escapedIds.map(id => `RECORD_ID()='${id}'`).join(',')})` };
    
    return await retrieve(table, filter);
}
