<script setup>
// Props: the list of students to show and whether the user may edit/delete.
// Emits: 'edit' / 'delete' with the chosen student back to the parent.
defineProps({
    students: { type: Array, required: true },
    isAdmin: { type: Boolean, default: false },
    deletingId: { type: Number, default: null },
});
defineEmits(['edit', 'delete']);
</script>

<template>
    <p v-if="students.length === 0" class="empty">No students yet.</p>

    <div v-else class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Student No.</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th v-if="isAdmin">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="student in students" :key="student.id">
                    <td>{{ student.student_number }}</td>
                    <td>{{ student.first_name }} {{ student.last_name }}</td>
                    <td>{{ student.email }}</td>
                    <td>{{ student.course }}</td>
                    <td>{{ student.year_level }}</td>
                    <td v-if="isAdmin" class="actions">
                        <button class="btn btn-small" @click="$emit('edit', student)">Edit</button>
                        <button
                            class="btn btn-small btn-danger"
                            :disabled="deletingId === student.id"
                            @click="$emit('delete', student)"
                        >
                            {{ deletingId === student.id ? 'Deleting…' : 'Delete' }}
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
