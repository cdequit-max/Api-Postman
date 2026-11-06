import { reactive, computed } from 'vue';
import { api, auth } from '../services/api';

// Module-level state: every component that calls useAuth() shares the SAME
// reactive object, so login/logout updates the whole app at once.
const state = reactive({
    user: auth.user(),
    token: auth.token(),
});

export function useAuth() {
    const isLoggedIn = computed(() => !!state.token && !!state.user);
    const isAdmin = computed(() => state.user?.role === 'admin');
    // Show only a masked token on screen; never print the full secret.
    const maskedToken = computed(() =>
        state.token ? `${state.token.slice(0, 6)}…${state.token.slice(-4)}` : ''
    );

    async function login(email, password) {
        const res = await api.login(email, password);
        auth.save(res.token, res.user);
        state.token = res.token;
        state.user = res.user;
        return res.user;
    }

    function clearSession() {
        auth.clear();
        state.token = null;
        state.user = null;
    }

    async function logout() {
        try { await api.logout(); } catch { /* token may already be invalid */ }
        clearSession();
    }

    return { state, isLoggedIn, isAdmin, maskedToken, login, logout, clearSession };
}
