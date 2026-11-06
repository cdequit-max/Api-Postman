<script setup>
import { ref, onMounted } from 'vue';
import { api, ApiError } from './services/api';
import { useAuth } from './composables/useAuth';
import LoginForm from './components/LoginForm.vue';
import SessionInfo from './components/SessionInfo.vue';
import StudentTable from './components/StudentTable.vue';
import StudentForm from './components/StudentForm.vue';
import AlertMessage from './components/AlertMessage.vue';

// Shared auth state (user, token, role) from the composable
const { state, isLoggedIn, isAdmin, maskedToken, logout, clearSession } = useAuth();

// Local UI state, all reactive refs
const students = ref([]);
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const testing = ref(false);
const showForm = ref(false);
const editingStudent = ref(null);   // null = adding, object = editing
const formErrors = ref({});
const alert = ref({ type: '', text: '' });

function notify(type, text) {
    alert.value = { type, text };
    if (type === 'success') setTimeout(() => (alert.value = { type: '', text: '' }), 4000);
}

function handleFailure(error) {
    if (error.status === 401) {
        // Token expired or revoked: Laravel rejected it
        clearSession();
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

function onLoggedIn() {
    alert.value = { type: '', text: '' };
    notify('success', 'Logged in successfully.');
    loadStudents();
}

async function onLogout() {
    await logout();
    students.value = [];
    closeForm();
    notify('success', 'You have been logged out. Token revoked.');
}

// Calls an admin-only endpoint to prove Laravel enforces the role, not just Vue.
async function testAccess() {
    testing.value = true;
    try {
        await api.testAdminAccess();
        notify('success', 'Request accepted.');
    } catch (e) {
        if (e.status === 422) {
            notify('success', 'Allowed (HTTP 422): Laravel let this admin through; the empty body just failed validation.');
        } else if (e.status === 403) {
            notify('error', `Blocked by Laravel (HTTP 403): ${e.message}`);
        } else {
            handleFailure(e);
        }
    } finally {
        testing.value = false;
    }
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
    deletingId.value = student.id;
    try {
        const res = await api.deleteStudent(student.id);
        students.value = students.value.filter((s) => s.id !== student.id);
        notify('success', res.message);
    } catch (e) {
        handleFailure(e);
    } finally {
        deletingId.value = null;
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
            <button v-if="isLoggedIn" class="btn btn-light" @click="onLogout">Logout</button>
        </header>

        <AlertMessage :type="alert.type" :text="alert.text" @close="alert = { type: '', text: '' }" />

        <LoginForm v-if="!isLoggedIn" @logged-in="onLoggedIn" />

        <template v-else>
            <SessionInfo
                :name="state.user.name"
                :role="state.user.role"
                :masked-token="maskedToken"
                :is-admin="isAdmin"
                :testing="testing"
                @test-access="testAccess"
            />

            <section class="card">
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
                    :deleting-id="deletingId"
                    @edit="openEdit"
                    @delete="deleteStudent"
                />
            </section>
        </template>

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
