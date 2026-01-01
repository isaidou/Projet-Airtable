const BASE_URL = 'http://localhost:3000/'

// Récupérer le token depuis localStorage
const getAuthToken = () => {
    const tokenString = localStorage.getItem('token');
    return tokenString ? `Bearer ${tokenString}` : null;
};

export async function httpRequest(url, options = {}) {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Ajouter le token d'authentification si disponible
    if (token) {
      headers.Authorization = token;
    }

    const response = await fetch(BASE_URL + url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Une erreur est survenue." }));
      const error = new Error(errorData.error || errorData.message || "Une erreur est survenue.");
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export function getJson(url, headers = {}) {
  return httpRequest(url, {
    method: "GET",
    headers,
  });
}

export function postJson(url, body, headers = {}) {
  return httpRequest(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

export function putJson(url, body, headers = {}) {
  return httpRequest(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
}

export function deleteJson(url, body, headers = {}) {
  return httpRequest(url, {
    method: "DELETE",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}
