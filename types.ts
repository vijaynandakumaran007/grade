
export type Role = 'STUDENT' | 'PROCTOR';
export type TaskStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'GRADED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isApproved: boolean;
  registrationDate: string;
}

export interface InviteToken {
  code: string;
  createdBy: string;
  createdAt: string;
  isUsed: boolean;
  usedBy?: string;
}

export interface Question {
  id: string;
  text: string;
  marks: number;
}

export interface AssignmentTask {
  id: string;
  proctorId: string;
  title: string;
  instructions: string;
  questions: Question[];
  createdAt: string;
  status: TaskStatus;
}

export interface Answer {
  questionId: string;
  text: string;
}

export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  studentId: string;
  studentName: string;
  answers: Answer[];
  feedback: string;
  score: number;
  submittedAt: string;
  status: SubmissionStatus;
  draftFileData?: string; // Base64 of the PDF for drafts
  draftFileName?: string;
}

export interface GradingResponse {
  feedback: string;
  score: number;
}
