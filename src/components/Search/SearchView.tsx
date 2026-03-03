import { useState, useMemo } from 'react';
import { Search, BookOpen, FolderOpen, Tag } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatDateShort } from '../../utils/helpers';

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-gray-900 rounded">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchView() {
  const { notes, projects, subjects, navigate } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'projects'>('all');

  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { notes: [], projects: [], tasks: [] };

    const matchedNotes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.includes(q)),
    );

    const matchedProjects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );

    const matchedTasks = projects.flatMap((p) =>
      p.tasks
        .filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.includes(q)),
        )
        .map((t) => ({ ...t, projectName: p.name, projectId: p.id, projectColor: p.color })),
    );

    return { notes: matchedNotes, projects: matchedProjects, tasks: matchedTasks };
  }, [query, notes, projects]);

  const totalResults =
    (filterType === 'all' || filterType === 'notes' ? results.notes.length : 0) +
    (filterType === 'all' || filterType === 'projects'
      ? results.projects.length + results.tasks.length
      : 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search</h1>

      {/* Search input */}
      <div className="relative mb-4">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, projects, tasks, tags…"
          className="w-full pl-12 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 shadow-sm"
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-6">
        {(['all', 'notes', 'projects'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filterType === t
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {query.trim() === '' ? (
        <div className="text-center py-16 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>Start typing to search across all your notes and projects.</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No results for "{query}"</p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">{totalResults} result{totalResults !== 1 ? 's' : ''}</p>

          {/* Notes */}
          {(filterType === 'all' || filterType === 'notes') && results.notes.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <BookOpen size={14} /> Notes ({results.notes.length})
              </h2>
              <div className="space-y-2">
                {results.notes.map((note) => {
                  const subj = subjectMap[note.subjectId];
                  return (
                    <button
                      key={note.id}
                      onClick={() => navigate('note-editor', note.id)}
                      className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {highlight(note.title, query)}
                        </span>
                        {subj && (
                          <span
                            className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: subj.color }}
                          >
                            {subj.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {highlight(note.content, query)}
                      </p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-xs px-1.5 py-0.5 rounded-full ${
                                tag.includes(query.toLowerCase())
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{formatDateShort(note.updatedAt)}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Projects */}
          {(filterType === 'all' || filterType === 'projects') && results.projects.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <FolderOpen size={14} /> Projects ({results.projects.length})
              </h2>
              <div className="space-y-2">
                {results.projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigate('project-editor', project.id)}
                    className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {highlight(project.name, query)}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {highlight(project.description, query)}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Tasks */}
          {(filterType === 'all' || filterType === 'projects') && results.tasks.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <Tag size={14} /> Tasks ({results.tasks.length})
              </h2>
              <div className="space-y-2">
                {results.tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => navigate('project-editor', task.projectId)}
                    className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: task.projectColor }}
                      />
                      <span className="font-medium text-gray-900">
                        {highlight(task.title, query)}
                      </span>
                      <span className="text-xs text-gray-400">in {task.projectName}</span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {highlight(task.description, query)}
                      </p>
                    )}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
                              tag.includes(query.toLowerCase())
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
