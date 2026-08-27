import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentDraft, StudentStatus } from './features/students/models/student.model';
import { StudentStore } from './features/students/store/student.store';

interface LoginForm { username: string; password: string; }

@Component({ imports: [FormsModule, DatePipe], selector: 'app-root', styleUrl: './app.scss', templateUrl: './app.html' })
export class App {
  // inject() gives the component the app-wide store instance managed by Angular DI.
  readonly store = inject(StudentStore);
  readonly isLoggedIn = signal(false);
  readonly loginError = signal('');
  readonly loginForm: LoginForm = { username: 'admin', password: 'admin' };
  readonly studentForm: StudentDraft = this.emptyStudentDraft();
  readonly isEditing = computed(() => this.store.selectedStudent() !== null);

  /** Demo-only authentication. Real applications authenticate on a server. */
  login(): void {
    if (this.loginForm.username === 'admin' && this.loginForm.password === 'admin') { this.isLoggedIn.set(true); this.loginError.set(''); return; }
    this.loginError.set('Use username "admin" and password "admin".');
  }
  /** Ends the demo session and clears the password field. */
  logout(): void { this.isLoggedIn.set(false); this.loginForm.password = ''; }
  /** Delegates create or update work to the store. */
  saveStudent(): void {
    if (!this.studentForm.name.trim() || !this.studentForm.email.trim()) return;
    const selected = this.store.selectedStudent();
    selected ? this.store.updateStudent(selected.id, this.studentForm) : this.store.addStudent(this.studentForm);
    this.cancelEdit();
  }
  /** Loads a store record into the form for editing. */
  editStudent(id: number): void { this.store.selectStudent(id); const student = this.store.selectedStudent(); if (student) Object.assign(this.studentForm, this.toDraft(student)); }
  /** Restores a clean form and clears selected state. */
  cancelEdit(): void { Object.assign(this.studentForm, this.emptyStudentDraft()); this.store.clearSelection(); }
  private emptyStudentDraft(): StudentDraft { return { name: '', email: '', course: 'Computer Science', status: 'Active' }; }
  private toDraft(student: StudentDraft): StudentDraft { return { name: student.name, email: student.email, course: student.course, status: student.status as StudentStatus }; }
}
