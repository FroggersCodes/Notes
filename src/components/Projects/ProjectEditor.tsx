import { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  X,
  Tag,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Task, PROJECT_COLORS } from '../../types';
import { generateId } from '../../utils/helpers';

export default function ProjectEditor() {
  const {
    editingProjectId,
    projects,
    subjects,
    navigate,
    addProject,
    updateProject,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  } = useApp();

  const existing = editingProjectId
    ? projects.find((p) => p.id === editingProjectId) ?? null
    : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [subjectId, setSubjectId] = useState(existing?.subjectId ?? subjects[0]?.id ?? '');
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? '');
  const [color, setColor] = useState(existing?.color ?? PROJECT_COLORS[0]);
  const [saved, setSaved] = useState(false);

  // New task state
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskTagInput, setNewTaskTagInput] = useState('');
  const [newTaskTags, setNewTaskTags] = useState<string[]>([]);

  const tasks = existing?.tasks ?? [];

  function handleSave() {
    if (!name.trim()) return;
    if (existing) {
      updateProject(existing.id, { name: name.trim(), description, subjectId, dueDate: dueDate || undefined, color });
    } else {
      addProject({ name: name.trim(), description, subjectId, dueDate: dueDate || undefined, color });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleAddTask() {
    if (!newTaskTitle.trim() || !existing) return;
    addTask(existing.id, {
      title: newTaskTitle.trim(),
      description: newTaskDesc,
      dueDate: newTaskDue || undefined,
      priority: newTaskPriority,
      tags: newTaskTags,
      completed: false,
    });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskDue('');
    setNewTaskPriority('medium');
    setNewTaskTags([]);
    setShowNewTask(false);
  }

  function addNewTaskTag() {
    const t = newTaskTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !newTaskTags.includes(t)) setNewTaskTags((prev) => [...prev, t]);
    setNewTaskTagInput('');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('projects')}
          className="text-gray-400 hover:text-gray-700 p-1 rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">
          {existing ? 'Edit Project' : 'New Project'}
        </h1>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-green-600">Saved!</span>}
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      {/* Project details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name…"
          className="w-full text-xl font-bold text-gray-900 border-none outline-none placeholder:text-gray-300"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)…"
          rows={2}
          className="w-full text-sm text-gray-600 outline-none resize-none placeholder:text-gray-300"
        />

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-400"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-medium">Color</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {existing && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">
              Tasks{' '}
              <span className="text-gray-400 font-normal text-sm">
                ({tasks.filter((t) => t.completed).length}/{tasks.length})
              </span>
            </h2>
            <button
              onClick={() => setShowNewTask(true)}
              className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              <Plus size={16} /> Add Task
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3"
              >
                <button
                  onClick={() => toggleTask(existing.id, task.id)}
                  className={`mt-0.5 flex-shrink-0 ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-green-400'}`}
                >
                  {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`text-xs capitalize px-1.5 py-0.5 rounded font-medium ${
                      task.priority === 'high' ? 'bg-red-50 text-red-600' :
                      task.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-500">{task.dueDate}</span>
                    )}
                    {task.tags.map((t) => (
                      <span key={t} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(existing.id, task.id)}
                  className="text-gray-300 hover:text-red-400 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* New task form */}
          {showNewTask && (
            <div className="mt-3 bg-white border-2 border-green-300 rounded-xl p-4 space-y-3">
              <input
                autoFocus
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title…"
                className="w-full font-medium text-gray-900 outline-none placeholder:text-gray-300"
              />
              <input
                type="text"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Description (optional)…"
                className="w-full text-sm text-gray-600 outline-none placeholder:text-gray-300"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag size={12} className="text-gray-400" />
                {newTaskTags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full"
                  >
                    #{t}
                    <button onClick={() => setNewTaskTags((prev) => prev.filter((x) => x !== t))}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTaskTagInput}
                  onChange={(e) => setNewTaskTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addNewTaskTag(); }
                  }}
                  placeholder="Add tag"
                  className="text-xs outline-none min-w-24 placeholder:text-gray-300"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowNewTask(false)}
                  className="px-4 bg-gray-100 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {tasks.length === 0 && !showNewTask && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No tasks yet.{' '}
              <button
                onClick={() => setShowNewTask(true)}
                className="text-green-600 hover:underline"
              >
                Add one!
              </button>
            </div>
          )}
        </div>
      )}

      {!existing && (
        <p className="text-sm text-gray-400 italic text-center">
          Save the project first, then add tasks.
        </p>
      )}
    </div>
  );
}
