export interface Subject {
  id: string;
  name: string;
  color: string;
  isCustom: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  dueDate?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  tasks: Task[];
  dueDate?: string;
  color: string;
  createdAt: string;
}

export interface StudyQuestion {
  id: string;
  question: string;
  answer: string;
  noteId: string;
}

export type View =
  | 'dashboard'
  | 'notes'
  | 'note-editor'
  | 'projects'
  | 'project-editor'
  | 'calendar'
  | 'study'
  | 'search';

export const SUBJECT_COLORS: string[] = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
];

export const PROJECT_COLORS: string[] = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#ef4444',
];
