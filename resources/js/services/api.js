// Small fetch wrapper for the Laravel API (same origin, so no CORS needed).
// The Sanctum token returned by /api/login is kept in localStorage.

const TOKEN_KEY = 'sms_token';
const USER_KEY = 'sms_user';

export const auth = {
    token: () => localStorage.getItem(TOKEN_KEY),
    user: () => {
        try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
    },
    save(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};

export class ApiError extends Error {
    constructor(message, status, errors = {}) {
        super(message);
        this.status = status;
        this.errors = errors; // Laravel validation errors: { field: [messages] }
    }
}

async function request(method, url, body) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = auth.token();
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
        response = await fetch(`/api${url}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError('Cannot reach the server. Is Laravel running?', 0);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ApiError(data.message || 'Something went wrong.', response.status, data.errors || {});
    }
    return data;
}

export const api = {
    login: (email, password) => request('POST', '/login', { email, password }),
    logout: () => request('POST', '/logout'),
    getStudents: () => request('GET', '/students'),
    createStudent: (student) => request('POST', '/students', student),
    updateStudent: (id, student) => request('PUT', `/students/${id}`, student),
    deleteStudent: (id) => request('DELETE', `/students/${id}`),
};
