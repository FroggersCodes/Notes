import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Subject, Note, Project, Task, StudyQuestion, View, SUBJECT_COLORS } from '../types';
import { generateId } from '../utils/helpers';
import { load, save } from '../utils/storage';

// ── Default seed data ────────────────────────────────────────────────────────

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'subj-math', name: 'Mathematics', color: '#6366f1', isCustom: false },
  { id: 'subj-sci', name: 'Science', color: '#22c55e', isCustom: false },
  { id: 'subj-eng', name: 'English', color: '#ec4899', isCustom: false },
  { id: 'subj-hist', name: 'History', color: '#f97316', isCustom: false },
  { id: 'subj-cs', name: 'Computer Science', color: '#06b6d4', isCustom: false },
];

const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-demo-1',
    title: 'Introduction to Derivatives',
    content:
      'A derivative is a measure of how a function changes as its input changes.\nThe derivative of f(x) is defined as the limit of the difference quotient.\nDerivatives are used in physics, engineering, and economics.\nThe power rule states that d/dx(x^n) = n*x^(n-1).',
    subjectId: 'subj-math',
    tags: ['calculus', 'derivatives'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-demo-2',
    title: 'Photosynthesis Overview',
    content:
      'Photosynthesis is the process by which plants convert sunlight into food.\nChlorophyll is the pigment that absorbs light energy.\nThe equation is: 6CO2 + 6H2O + light → C6H12O6 + 6O2.\nPhotosynthesis occurs in the chloroplasts of plant cells.',
    subjectId: 'subj-sci',
    tags: ['biology', 'plants'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-demo-1',
    name: 'History Essay – WWII',
    description: 'Research and write a 5-page essay on the causes of World War II.',
    subjectId: 'subj-hist',
    color: '#f97316',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    tasks: [
      {
        id: 'task-demo-1',
        title: 'Research primary sources',
        description: 'Find at least 5 primary sources from the library.',
        tags: ['research'],
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
        completed: false,
        priority: 'high',
      },
      {
        id: 'task-demo-2',
        title: 'Write outline',
        description: 'Create a detailed outline before drafting.',
        tags: ['writing'],
        dueDate: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
        completed: false,
        priority: 'medium',
      },
    ],
  },
];

// ── Context types ─────────────────────────────────────────────────────────────

interface AppContextValue {
  // State
  subjects: Subject[];
  notes: Note[];
  projects: Project[];
  studyQuestions: StudyQuestion[];
  currentView: View;
  searchQuery: string;
  editingNoteId: string | null;
  editingProjectId: string | null;

  // Navigation
  navigate: (view: View, id?: string) => void;
  setSearchQuery: (q: string) => void;

  // Subjects
  addSubject: (name: string, color: string) => void;
  deleteSubject: (id: string) => void;

  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, patch: Partial<Omit<Note, 'id' | 'createdAt'>>) => void;
  deleteNote: (id: string) => void;

  // Projects & Tasks
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>) => string;
  updateProject: (id: string, patch: Partial<Omit<Project, 'id' | 'createdAt' | 'tasks'>>) => void;
  deleteProject: (id: string) => void;
  addTask: (projectId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (projectId: string, taskId: string, patch: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;

  // Study questions
  addStudyQuestion: (q: Omit<StudyQuestion, 'id'>) => void;
  addStudyQuestions: (qs: Omit<StudyQuestion, 'id'>[]) => void;
  deleteStudyQuestion: (id: string) => void;
  deleteStudyQuestionsForNote: (noteId: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    load('nt-subjects', DEFAULT_SUBJECTS),
  );
  const [notes, setNotes] = useState<Note[]>(() => load('nt-notes', DEFAULT_NOTES));
  const [projects, setProjects] = useState<Project[]>(() =>
    load('nt-projects', DEFAULT_PROJECTS),
  );
  const [studyQuestions, setStudyQuestions] = useState<StudyQuestion[]>(() =>
    load('nt-study', []),
  );
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Persist on change
  useEffect(() => { save('nt-subjects', subjects); }, [subjects]);
  useEffect(() => { save('nt-notes', notes); }, [notes]);
  useEffect(() => { save('nt-projects', projects); }, [projects]);
  useEffect(() => { save('nt-study', studyQuestions); }, [studyQuestions]);

  const navigate = useCallback((view: View, id?: string) => {
    setCurrentView(view);
    if (view === 'note-editor') setEditingNoteId(id ?? null);
    if (view === 'project-editor') setEditingProjectId(id ?? null);
  }, []);

  // ── Subjects ────────────────────────────────────────────────────────────────
  const addSubject = useCallback((name: string, color: string) => {
    const sub: Subject = { id: generateId(), name, color, isCustom: true };
    setSubjects((prev) => [...prev, sub]);
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Notes ────────────────────────────────────────────────────────────────────
  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = generateId();
    const now = new Date().toISOString();
    setNotes((prev) => [{ ...note, id, createdAt: now, updatedAt: now }, ...prev]);
    return id;
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n)),
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setStudyQuestions((prev) => prev.filter((q) => q.noteId !== id));
  }, []);

  // ── Projects & Tasks ─────────────────────────────────────────────────────────
  const addProject = useCallback(
    (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>): string => {
      const id = generateId();
      setProjects((prev) => [
        { ...project, id, tasks: [], createdAt: new Date().toISOString() },
        ...prev,
      ]);
      return id;
    },
    [],
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<Omit<Project, 'id' | 'createdAt' | 'tasks'>>) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    [],
  );

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addTask = useCallback((projectId: string, task: Omit<Task, 'id'>) => {
    const id = generateId();
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, tasks: [...p.tasks, { ...task, id }] } : p,
      ),
    );
  }, []);

  const updateTask = useCallback(
    (projectId: string, taskId: string, patch: Partial<Omit<Task, 'id'>>) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) }
            : p,
        ),
      );
    },
    [],
  );

  const deleteTask = useCallback((projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p,
      ),
    );
  }, []);

  const toggleTask = useCallback((projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t,
              ),
            }
          : p,
      ),
    );
  }, []);

  // ── Study Questions ───────────────────────────────────────────────────────────
  const addStudyQuestion = useCallback((q: Omit<StudyQuestion, 'id'>) => {
    setStudyQuestions((prev) => [...prev, { ...q, id: generateId() }]);
  }, []);

  const addStudyQuestions = useCallback((qs: Omit<StudyQuestion, 'id'>[]) => {
    setStudyQuestions((prev) => [
      ...prev,
      ...qs.map((q) => ({ ...q, id: generateId() })),
    ]);
  }, []);

  const deleteStudyQuestion = useCallback((id: string) => {
    setStudyQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const deleteStudyQuestionsForNote = useCallback((noteId: string) => {
    setStudyQuestions((prev) => prev.filter((q) => q.noteId !== noteId));
  }, []);

  const value: AppContextValue = {
    subjects,
    notes,
    projects,
    studyQuestions,
    currentView,
    searchQuery,
    editingNoteId,
    editingProjectId,
    navigate,
    setSearchQuery,
    addSubject,
    deleteSubject,
    addNote,
    updateNote,
    deleteNote,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addStudyQuestion,
    addStudyQuestions,
    deleteStudyQuestion,
    deleteStudyQuestionsForNote,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { SUBJECT_COLORS };
