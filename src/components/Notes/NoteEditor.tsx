import { useState } from 'react';
import { ArrowLeft, Save, Tag, Zap, Trash2, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { generateQuestionsFromNote } from '../../utils/studyQuestions';
import { Note } from '../../types';

export default function NoteEditor() {
  const {
    editingNoteId,
    notes,
    subjects,
    navigate,
    addNote,
    updateNote,
    deleteNote,
    addStudyQuestions,
    deleteStudyQuestionsForNote,
    studyQuestions,
  } = useApp();

  const existing = editingNoteId ? notes.find((n) => n.id === editingNoteId) ?? null : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [subjectId, setSubjectId] = useState(existing?.subjectId ?? subjects[0]?.id ?? '');
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);

  const noteQCount = studyQuestions.filter((q) => q.noteId === (editingNoteId ?? '')).length;

  function handleSave() {
    if (!title.trim()) return;
    if (existing) {
      updateNote(existing.id, { title: title.trim(), content, subjectId, tags });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      const id = addNote({ title: title.trim(), content, subjectId, tags });
      navigate('note-editor', id);
    }
  }

  function handleDelete() {
    if (!existing) return;
    if (confirm('Delete this note and its study questions?')) {
      deleteNote(existing.id);
      navigate('notes');
    }
  }

  function handleAddTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput('');
  }

  function handleGenerateQuestions() {
    const noteData: Note = {
      id: editingNoteId ?? 'temp',
      title,
      content,
      subjectId,
      tags,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const generated = generateQuestionsFromNote(noteData);
    if (editingNoteId) {
      deleteStudyQuestionsForNote(editingNoteId);
      addStudyQuestions(generated.map((q) => ({ ...q, noteId: editingNoteId })));
    } else {
      const id = addNote({ title: title.trim(), content, subjectId, tags });
      addStudyQuestions(generated.map((q) => ({ ...q, noteId: id })));
      navigate('note-editor', id);
    }
    setGeneratedCount(generated.length);
    setTimeout(() => setGeneratedCount(null), 3000);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('notes')}
          className="text-gray-400 hover:text-gray-700 p-1 rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">
          {existing ? 'Edit Note' : 'New Note'}
        </h1>
        <div className="flex items-center gap-2">
          {generatedCount !== null && (
            <span className="text-sm text-green-600 font-medium">
              {generatedCount} questions generated!
            </span>
          )}
          {saved && <span className="text-sm text-green-600">Saved!</span>}
          <button
            onClick={handleGenerateQuestions}
            title="Auto-generate study questions from this note"
            className="flex items-center gap-1.5 px-3 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 text-sm"
          >
            <Zap size={14} /> Generate Questions
            {noteQCount > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">
                {noteQCount}
              </span>
            )}
          </button>
          {existing && (
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title…"
          className="w-full text-xl font-bold text-gray-900 border-none outline-none placeholder:text-gray-300"
        />

        {/* Subject */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500 font-medium w-16">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Tag size={14} className="text-gray-400" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
                <button onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag, press Enter"
              className="text-sm outline-none text-gray-600 min-w-32 placeholder:text-gray-300"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={'Start writing your note here…\n\nTip: Write sentences like "X is Y" to auto-generate study questions!'}
          className="w-full min-h-80 text-gray-700 text-sm leading-relaxed outline-none resize-none placeholder:text-gray-300"
        />
      </div>

      {/* Study questions hint */}
      {noteQCount > 0 && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between">
          <p className="text-sm text-orange-700">
            <span className="font-semibold">{noteQCount} study questions</span> linked to this note.
          </p>
          <button
            onClick={() => navigate('study')}
            className="text-sm text-orange-600 font-medium hover:underline"
          >
            Study now →
          </button>
        </div>
      )}
    </div>
  );
}
