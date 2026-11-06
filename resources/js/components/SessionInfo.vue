<script setup>
// Props: who is logged in, their role, and a masked Bearer token.
// Emits 'test-access' so the parent can call an admin-only endpoint.
defineProps({
    name: { type: String, required: true },
    role: { type: String, required: true },
    maskedToken: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    testing: { type: Boolean, default: false },
});
defineEmits(['test-access']);
</script>

<template>
    <section class="card session">
        <div>
            <strong>{{ name }}</strong>
            <span class="badge">{{ role }}</span>
        </div>
        <div class="muted">
            Bearer token: <code>{{ maskedToken }}</code>
        </div>
        <div class="muted">
            Allowed actions:
            <span v-if="isAdmin">view, add, update, delete</span>
            <span v-else>view only</span>
        </div>
        <button class="btn btn-light" :disabled="testing" @click="$emit('test-access')">
            {{ testing ? 'Testing…' : 'Test admin-only API (POST /api/students)' }}
        </button>
    </section>
</template>
