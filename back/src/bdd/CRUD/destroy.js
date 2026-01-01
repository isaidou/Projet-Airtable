import base from "../credentials.js";

function destroy(table, idList) {
    return new Promise((resolve, reject) => {
        base(table).destroy(idList, function (err) {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve({ message: 'Delete done' });
        });
    });
}

export { destroy }