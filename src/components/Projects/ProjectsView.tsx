import { Plus, Trash2, CheckSquare, Square, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatDateShort, isOverdue, isDueToday, priorityColor } from '../../utils/helpers';

export default function ProjectsView() {
  const { projects, subjects, navigate, deleteProject, toggleTask } = useApp();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [filterSubject, setFilterSubject] = useState('all');

  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const filtered = projects.filter(
    (p) => filterSubject === 'all' || p.subjectId === filterSubject,
  );

  function toggleExpand(id: string) {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => navigate('project-editor', undefined)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-white"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">No projects yet.</p>
          <button
            onClick={() => navigate('project-editor', undefined)}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            <Plus size={16} /> Create your first project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((project) => {
            const subject = subjectMap[project.subjectId];
            const done = project.tasks.filter((t) => t.completed).length;
            const total = project.tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isExpanded = expandedProjects.has(project.id);
            const overdue = project.dueDate && isOverdue(project.dueDate);
            const dueToday = project.dueDate && isDueToday(project.dueDate);

            return (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Project header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => navigate('project-editor', project.id)}
                            className="text-xs text-gray-500 hover:text-green-600 px-2 py-1 rounded hover:bg-green-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this project?')) deleteProject(project.id);
                            }}
                            className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {subject && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.name}
                          </span>
                        )}
                        {project.dueDate && (
                          <span
                            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                              overdue
                                ? 'bg-red-100 text-red-700'
                                : dueToday
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Calendar size={10} />
                            {overdue ? 'Overdue · ' : dueToday ? 'Due today · ' : ''}
                            {formatDateShort(project.dueDate)}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {done}/{total} tasks
                        </span>
                      </div>

                      {/* Progress bar */}
                      {total > 0 && (
                        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: project.color }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expand toggle */}
                  {total > 0 && (
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 mt-3"
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {isExpanded ? 'Hide' : 'Show'} tasks
                    </button>
                  )}
                </div>

                {/* Task list */}
                {isExpanded && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {project.tasks.map((task) => {
                      const taskOverdue = task.dueDate && !task.completed && isOverdue(task.dueDate);
                      return (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50"
                        >
                          <button
                            onClick={() => toggleTask(project.id, task.id)}
                            className={`mt-0.5 flex-shrink-0 ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-green-400'}`}
                          >
                            {task.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {task.priority && (
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded capitalize font-medium ${priorityColor(task.priority)}`}
                                >
                                  {task.priority}
                                </span>
                              )}
                              {task.dueDate && (
                                <span
                                  className={`text-xs ${taskOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}
                                >
                                  {taskOverdue ? 'Overdue · ' : ''}{formatDateShort(task.dueDate)}
                                </span>
                              )}
                              {task.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
