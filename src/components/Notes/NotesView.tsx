import { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatDateShort } from '../../utils/helpers';

export default function NotesView() {
  const { notes, subjects, navigate, deleteNote } = useApp();
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterTag, setFilterTag] = useState('');
  const [search, setSearch] = useState('');

  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s]));
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).sort();

  const filtered = notes.filter((note) => {
    if (filterSubject !== 'all' && note.subjectId !== filterSubject) return false;
    if (filterTag && !note.tags.includes(filterTag)) return false;
    if (search) {
      const q = search.toLowerCase();
      return note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
        <button
          onClick={() => navigate('note-editor', undefined)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white"
          >
            <option value="">All Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} note{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">No notes found.</p>
          <button
            onClick={() => navigate('note-editor', undefined)}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <Plus size={16} /> Create your first note
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => {
            const subject = subjectMap[note.subjectId];
            return (
              <div
                key={note.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all group cursor-pointer"
                onClick={() => navigate('note-editor', note.id)}
              >
                {/* Subject badge */}
                {subject && (
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full text-white mb-2"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.name}
                  </span>
                )}

                <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{note.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">{note.content}</p>

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDateShort(note.updatedAt)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this note?')) deleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
