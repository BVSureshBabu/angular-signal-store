import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { STUDENT_SEED } from '../data/student.seed';
import { Student, StudentDraft, StudentStatus } from '../models/student.model';

/** The complete state slice for the student-management feature. */
interface StudentState {
  students: Student[];
  searchTerm: string;
  statusFilter: 'All' | StudentStatus;
  selectedStudentId: number | null;
}

const initialState: StudentState = {
  students: STUDENT_SEED,
  searchTerm: '',
  statusFilter: 'All',
  selectedStudentId: null,
};

/**
 * NgRx Signal Store feature state.
 *
 * withState creates read-only signals such as `store.students()`.
 * withComputed exposes derived selectors; withMethods contains every state change.
 * Components read selectors and invoke methods, never mutate state themselves.
 */
export const StudentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ students, searchTerm, statusFilter, selectedStudentId }) => ({
    /** Filters reactively whenever the search, status, or student list changes. */
    filteredStudents: computed(() => {
      const query = searchTerm().trim().toLowerCase();
      const status = statusFilter();
      return students().filter((student) => {
        const matchesSearch = !query || [student.name, student.email, student.course]
          .some((value) => value.toLowerCase().includes(query));
        return matchesSearch && (status === 'All' || student.status === status);
      });
    }),
    /** Summary selectors are derived, so counts cannot become out of sync. */
    totalStudents: computed(() => students().length),
    activeStudents: computed(() => students().filter((student) => student.status === 'Active').length),
    inactiveStudents: computed(() => students().filter((student) => student.status === 'Inactive').length),
    selectedStudent: computed(() => students().find((student) => student.id === selectedStudentId()) ?? null),
  })),
  withMethods((store) => ({
    /** Updates only the search field. patchState preserves the rest of the state. */
    setSearchTerm(searchTerm: string): void { patchState(store, { searchTerm }); },
    /** Updates the selected status filter. */
    setStatusFilter(statusFilter: 'All' | StudentStatus): void { patchState(store, { statusFilter }); },
    /** Adds an immutable student record and assigns the next local id. */
    addStudent(draft: StudentDraft): void {
      const id = Math.max(0, ...store.students().map((student) => student.id)) + 1;
      const student: Student = { ...draft, id, joinedOn: new Date().toISOString().slice(0, 10) };
      patchState(store, { students: [...store.students(), student] });
    },
    /** Replaces one record while preserving references for unchanged records. */
    updateStudent(id: number, draft: StudentDraft): void {
      patchState(store, { students: store.students().map((student) => student.id === id ? { ...student, ...draft } : student) });
    },
    /** Stores the id of the row currently being edited. */
    selectStudent(id: number): void { patchState(store, { selectedStudentId: id }); },
    /** Clears the current edit selection. */
    clearSelection(): void { patchState(store, { selectedStudentId: null }); },
    /** Toggles status using the current state held by the Signal Store. */
    toggleStudentStatus(id: number): void {
      patchState(store, { students: store.students().map((student) => student.id === id ? { ...student, status: student.status === 'Active' ? 'Inactive' : 'Active' } : student) });
    },
    /** Removes a record and avoids leaving a deleted record selected. */
    deleteStudent(id: number): void {
      patchState(store, {
        students: store.students().filter((student) => student.id !== id),
        selectedStudentId: store.selectedStudentId() === id ? null : store.selectedStudentId(),
      });
    },
  })),
  withHooks({
    /** Lifecycle hooks are ideal for initialization such as loading an API resource. */
    onInit(store) { console.info('[StudentStore] initialized with', store.students().length, 'students'); },
  }),
);
