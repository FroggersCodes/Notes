import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  Calendar,
  GraduationCap,
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useApp, SUBJECT_COLORS } from '../contexts/AppContext';
import { View } from '../types';

interface NavItem {
  view: View;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { view: 'notes', label: 'Notes', icon: <BookOpen size={18} /> },
  { view: 'projects', label: 'Projects', icon: <FolderOpen size={18} /> },
  { view: 'calendar', label: 'Calendar', icon: <Calendar size={18} /> },
  { view: 'study', label: 'Study', icon: <GraduationCap size={18} /> },
  { view: 'search', label: 'Search', icon: <Search size={18} /> },
];

export default function Sidebar() {
  const { currentView, navigate, subjects, addSubject, deleteSubject } = useApp();
  const [subjectsOpen, setSubjectsOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(SUBJECT_COLORS[0]);

  function handleAddSubject() {
    if (!newName.trim()) return;
    addSubject(newName.trim(), newColor);
    setNewName('');
    setNewColor(SUBJECT_COLORS[0]);
    setAdding(false);
  }

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-sm">
            NT
          </div>
          <span className="font-semibold text-lg tracking-tight">NoteTask</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Notes & Projects for School</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            onClick={() => navigate(item.view)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === item.view || (currentView === 'note-editor' && item.view === 'notes') || (currentView === 'project-editor' && item.view === 'projects')
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        {/* Subjects section */}
        <div className="pt-4">
          <button
            onClick={() => setSubjectsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-200"
          >
            <span>Subjects</span>
            {subjectsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {subjectsOpen && (
            <div className="mt-1 space-y-0.5">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="text-sm text-gray-300 flex-1 truncate">{subject.name}</span>
                  {subject.isCustom && (
                    <button
                      onClick={() => deleteSubject(subject.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}

              {/* Add subject */}
              {adding ? (
                <div className="px-3 py-2 space-y-2">
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubject();
                      if (e.key === 'Escape') setAdding(false);
                    }}
                    placeholder="Subject name"
                    className="w-full bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex flex-wrap gap-1">
                    {SUBJECT_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewColor(c)}
                        className={`w-5 h-5 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleAddSubject}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1 rounded"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setAdding(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg w-full"
                >
                  <Plus size={14} />
                  Add subject
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-700 text-xs text-gray-500">
        Data saved locally in your browser
      </div>
    </aside>
  );
}
