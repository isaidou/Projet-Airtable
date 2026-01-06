const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

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
    if (error.status) {
      throw error;
    }
    const newError = new Error(error.message || "Une erreur réseau est survenue");
    newError.status = error.status || 500;
    throw newError;
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
