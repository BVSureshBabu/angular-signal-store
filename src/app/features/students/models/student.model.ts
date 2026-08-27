/** The status shown for a student in the roster. */
export type StudentStatus = 'Active' | 'Inactive';

/** A persisted student record owned by the NgRx Signal Store. */
export interface Student {
  id: number;
  name: string;
  email: string;
  course: string;
  status: StudentStatus;
  joinedOn: string;
}

/** The editable fields used by the add/edit form. */
export type StudentDraft = Omit<Student, 'id' | 'joinedOn'>;
