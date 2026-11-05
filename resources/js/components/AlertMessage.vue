<script setup>
// Props: type ('success' | 'error') and text. Hidden when text is empty.
defineProps({
    type: { type: String, default: 'success' },
    text: { type: String, default: '' },
});
defineEmits(['close']);
</script>

<template>
    <div v-if="text" :class="['alert', type === 'error' ? 'alert-error' : 'alert-success']" role="alert">
        <span>{{ text }}</span>
        <button class="alert-close" aria-label="Dismiss" @click="$emit('close')">×</button>
    </div>
</template>
