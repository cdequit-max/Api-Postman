<script setup>
import { reactive, computed } from 'vue';

// Props: student (null when adding), errors from Laravel validation, saving flag.
const props = defineProps({
    student: { type: Object, default: null },
    errors: { type: Object, default: () => ({}) },
    saving: { type: Boolean, default: false },
});
const emit = defineEmits(['save', 'cancel']);

const isEditing = computed(() => props.student !== null);

const form = reactive({
    student_number: props.student?.student_number ?? '',
    first_name: props.student?.first_name ?? '',
    last_name: props.student?.last_name ?? '',
    email: props.student?.email ?? '',
    course: props.student?.course ?? '',
    year_level: props.student?.year_level ?? 1,
});

const fields = [
    { key: 'student_number', label: 'Student Number', type: 'text' },
    { key: 'first_name', label: 'First Name', type: 'text' },
    { key: 'last_name', label: 'Last Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'course', label: 'Course', type: 'text' },
    { key: 'year_level', label: 'Year Level (1-6)', type: 'number' },
];

function submit() {
    emit('save', { ...form, year_level: Number(form.year_level) });
}
</script>

<template>
    <div class="modal-backdrop" @click.self="$emit('cancel')">
        <div class="modal card">
            <h2>{{ isEditing ? 'Edit Student' : 'Add Student' }}</h2>

            <form @submit.prevent="submit" novalidate>
                <label v-for="field in fields" :key="field.key">
                    {{ field.label }}
                    <input
                        v-model="form[field.key]"
                        :type="field.type"
                        :min="field.type === 'number' ? 1 : undefined"
                        :max="field.type === 'number' ? 6 : undefined"
                        :class="{ invalid: errors[field.key] }"
                    />
                    <span v-if="errors[field.key]" class="field-error">{{ errors[field.key][0] }}</span>
                </label>

                <div class="form-actions">
                    <button type="button" class="btn btn-light" @click="$emit('cancel')">Cancel</button>
                    <button class="btn btn-primary" :disabled="saving">
                        {{ saving ? 'Saving…' : isEditing ? 'Update' : 'Create' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
