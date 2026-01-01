import base from "../credentials.js";

function create(table, fields) {
    return new Promise((resolve, reject) => {
        base(table).create([
            { "fields": fields },
        ], function (err, records) {
            if (err) {
                const errorMessage = err.message || err.toString() || 'Erreur lors de la création dans Airtable';
                const error = new Error(errorMessage);
                error.airtableError = err;
                reject(error);
            } else {
                const record = records[0];
                resolve({ id: record.id, ...record.fields });
            }
        });
    })
}
export { create }

