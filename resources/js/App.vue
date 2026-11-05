<script setup>
import { ref, computed, onMounted } from 'vue';
import { api, auth, ApiError } from './services/api';
import LoginForm from './components/LoginForm.vue';
import StudentTable from './components/StudentTable.vue';
import StudentForm from './components/StudentForm.vue';
import AlertMessage from './components/AlertMessage.vue';

const user = ref(auth.user());
const students = ref([]);
const loading = ref(false);
const saving = ref(false);
const showForm = ref(false);
const editingStudent = ref(null);   // null = adding, object = editing
const formErrors = ref({});
const alert = ref({ type: '', text: '' });

const isLoggedIn = computed(() => !!user.value);
const isAdmin = computed(() => user.value?.role === 'admin');

function notify(type, text) {
    alert.value = { type, text };
    if (type === 'success') setTimeout(() => (alert.value = { type: '', text: '' }), 4000);
}

function handleFailure(error) {
    if (error.status === 401) {
        // Token expired or revoked
        auth.clear();
        user.value = null;
        students.value = [];
        notify('error', 'Your session expired. Please log in again.');
        return;
    }
    notify('error', error.message);
}

async function loadStudents() {
    loading.value = true;
    try {
        const res = await api.getStudents();
        students.value = res.data;
    } catch (e) {
        handleFailure(e);
    } finally {
        loading.value = false;
    }
}

function onLoggedIn(loggedInUser) {
    user.value = loggedInUser;
    alert.value = { type: '', text: '' };
    loadStudents();
}

async function logout() {
    try { await api.logout(); } catch { /* token may already be invalid */ }
    auth.clear();
    user.value = null;
    students.value = [];
    closeForm();
    notify('success', 'You have been logged out.');
}

function openAdd() {
    editingStudent.value = null;
    formErrors.value = {};
    showForm.value = true;
}

function openEdit(student) {
    editingStudent.value = student;
    formErrors.value = {};
    showForm.value = true;
}

function closeForm() {
    showForm.value = false;
    editingStudent.value = null;
    formErrors.value = {};
}

async function saveStudent(payload) {
    saving.value = true;
    formErrors.value = {};
    try {
        if (editingStudent.value) {
            const res = await api.updateStudent(editingStudent.value.id, payload);
            const i = students.value.findIndex((s) => s.id === editingStudent.value.id);
            if (i !== -1) students.value[i] = res.data;
            notify('success', res.message);
        } else {
            const res = await api.createStudent(payload);
            students.value.push(res.data);
            notify('success', res.message);
        }
        closeForm();
    } catch (e) {
        if (e instanceof ApiError && e.status === 422) {
            formErrors.value = e.errors;   // shown beside each field
        } else {
            handleFailure(e);
        }
    } finally {
        saving.value = false;
    }
}

async function deleteStudent(student) {
    if (!confirm(`Delete ${student.first_name} ${student.last_name}?`)) return;
    try {
        const res = await api.deleteStudent(student.id);
        students.value = students.value.filter((s) => s.id !== student.id);
        notify('success', res.message);
    } catch (e) {
        handleFailure(e);
    }
}

onMounted(() => {
    if (isLoggedIn.value) loadStudents();
});
</script>

<template>
    <main class="container">
        <header class="topbar">
            <h1>Student Management</h1>
            <div v-if="isLoggedIn" class="userbox">
                <span>{{ user.name }} <span class="badge">{{ user.role }}</span></span>
                <button class="btn btn-light" @click="logout">Logout</button>
            </div>
        </header>

        <AlertMessage :type="alert.type" :text="alert.text" @close="alert = { type: '', text: '' }" />

        <LoginForm v-if="!isLoggedIn" @logged-in="onLoggedIn" />

        <section v-else class="card">
            <div class="card-head">
                <h2>Students <small>({{ students.length }})</small></h2>
                <button v-if="isAdmin" class="btn btn-primary" @click="openAdd">+ Add Student</button>
                <span v-else class="muted">Read-only access</span>
            </div>

            <p v-if="loading" class="muted">Loading students…</p>

            <StudentTable
                v-else
                :students="students"
                :is-admin="isAdmin"
                @edit="openEdit"
                @delete="deleteStudent"
            />
        </section>

        <StudentForm
            v-if="showForm"
            :student="editingStudent"
            :errors="formErrors"
            :saving="saving"
            @save="saveStudent"
            @cancel="closeForm"
        />
    </main>
</template>
