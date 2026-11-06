<script setup>
import { ref } from 'vue';
import { ApiError } from '../services/api';
import { useAuth } from '../composables/useAuth';

const emit = defineEmits(['logged-in']);
const { login } = useAuth();

// Controlled inputs: v-model keeps these refs and the fields in sync.
const email = ref('');
const password = ref('');
const loading = ref(false);
const errors = ref({});
const message = ref('');

async function submit() {
    loading.value = true;
    errors.value = {};
    message.value = '';
    try {
        const user = await login(email.value, password.value);
        password.value = '';
        emit('logged-in', user);
    } catch (e) {
        if (e instanceof ApiError && e.status === 422) errors.value = e.errors;
        else message.value = e.message;
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <section class="card login">
        <h2>Log in</h2>
        <p class="muted">Log in as an Administrator (full access) or a Regular User (view only).</p>

        <p v-if="message" class="field-error">{{ message }}</p>

        <form @submit.prevent="submit" novalidate>
            <label>
                Email
                <input v-model="email" type="email" autocomplete="username" />
                <span v-if="errors.email" class="field-error">{{ errors.email[0] }}</span>
            </label>
            <label>
                Password
                <input v-model="password" type="password" autocomplete="current-password" />
                <span v-if="errors.password" class="field-error">{{ errors.password[0] }}</span>
            </label>
            <button class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Logging in…' : 'Log in' }}
            </button>
        </form>
    </section>
</template>
