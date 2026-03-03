import { BookOpen, FolderOpen, CheckSquare, Clock, Plus, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { formatDateShort, isDueSoon, isOverdue } from '../utils/helpers';

export default function Dashboard() {
  const { notes, projects, subjects, navigate } = useApp();

  const allTasks = projects.flatMap((p) => p.tasks.map((t) => ({ ...t, projectName: p.name, projectId: p.id })));
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const upcomingTasks = allTasks.filter((t) => !t.completed && t.dueDate && isDueSoon(t.dueDate));
  const overdueTasks = allTasks.filter((t) => !t.completed && t.dueDate && isOverdue(t.dueDate));

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const upcomingDeadlines = [
    ...projects
      .filter((p) => p.dueDate && !isOverdue(p.dueDate))
      .map((p) => ({ label: p.name, date: p.dueDate!, type: 'project' as const, color: p.color })),
    ...allTasks
      .filter((t) => t.dueDate && !t.completed && !isOverdue(t.dueDate))
      .map((t) => ({ label: t.title, date: t.dueDate!, type: 'task' as const, color: '#6366f1' })),
  ]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<BookOpen size={20} className="text-indigo-600" />}
          label="Notes"
          value={notes.length}
          bg="bg-indigo-50"
          onClick={() => navigate('notes')}
        />
        <StatCard
          icon={<FolderOpen size={20} className="text-green-600" />}
          label="Projects"
          value={projects.length}
          bg="bg-green-50"
          onClick={() => navigate('projects')}
        />
        <StatCard
          icon={<CheckSquare size={20} className="text-blue-600" />}
          label="Tasks Done"
          value={`${completedTasks}/${allTasks.length}`}
          bg="bg-blue-50"
          onClick={() => navigate('projects')}
        />
        <StatCard
          icon={<Clock size={20} className="text-orange-600" />}
          label="Due Soon"
          value={upcomingTasks.length + overdueTasks.length}
          bg="bg-orange-50"
          onClick={() => navigate('calendar')}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Notes</h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('note-editor', undefined)}
                className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-indigo-700"
              >
                <Plus size={12} /> New
              </button>
              <button
                onClick={() => navigate('notes')}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                All <ArrowRight size={12} />
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {recentNotes.length === 0 && (
              <p className="text-sm text-gray-400">No notes yet. Create your first note!</p>
            )}
            {recentNotes.map((note) => {
              const subject = subjectMap[note.subjectId];
              return (
                <button
                  key={note.id}
                  onClick={() => navigate('note-editor', note.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-sm text-gray-900 line-clamp-1">{note.title}</span>
                    {subject && (
                      <span
                        className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: subject.color }}
                      >
                        {subject.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{note.content}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateShort(note.updatedAt)}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Upcoming Deadlines */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Deadlines</h2>
            <button
              onClick={() => navigate('calendar')}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              Calendar <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.length === 0 && (
              <p className="text-sm text-gray-400">No upcoming deadlines.</p>
            )}
            {overdueTasks.length > 0 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-700">
                  {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
            {upcomingDeadlines.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                  <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                </div>
                <span className="text-xs text-gray-600 font-medium flex-shrink-0">
                  {formatDateShort(item.date)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => navigate('note-editor', undefined)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus size={16} /> New Note
        </button>
        <button
          onClick={() => navigate('project-editor', undefined)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          <Plus size={16} /> New Project
        </button>
        <button
          onClick={() => navigate('study')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
        >
          Start Studying
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all text-left"
    >
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
    </button>
  );
}
