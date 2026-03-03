import { useState } from 'react';
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Zap,
  X,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { generateQuestionsFromNote } from '../../utils/studyQuestions';
import { StudyQuestion } from '../../types';

type Mode = 'select' | 'quiz';

export default function StudyView() {
  const {
    notes,
    subjects,
    studyQuestions,
    addStudyQuestion,
    addStudyQuestions,
    deleteStudyQuestion,
    deleteStudyQuestionsForNote,
  } = useApp();

  const [mode, setMode] = useState<Mode>('select');
  const [selectedNoteId, setSelectedNoteId] = useState<string>('all');
  const [showAnswer, setShowAnswer] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, 'got' | 'missed'>>({});

  // Manual Q&A form
  const [showAddForm, setShowAddForm] = useState(false);
  const [formQ, setFormQ] = useState('');
  const [formA, setFormA] = useState('');
  const [formNoteId, setFormNoteId] = useState('');

  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s]));

  const filteredQuestions =
    selectedNoteId === 'all'
      ? studyQuestions
      : studyQuestions.filter((q) => q.noteId === selectedNoteId);

  const card = filteredQuestions[cardIndex] ?? null;
  const gotCount = Object.values(scores).filter((v) => v === 'got').length;
  const missedCount = Object.values(scores).filter((v) => v === 'missed').length;

  function handleGenerate(noteId: string) {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    deleteStudyQuestionsForNote(noteId);
    const qs = generateQuestionsFromNote(note);
    addStudyQuestions(qs);
  }

  function handleAddManual() {
    if (!formQ.trim() || !formA.trim()) return;
    addStudyQuestion({ question: formQ.trim(), answer: formA.trim(), noteId: formNoteId || '' });
    setFormQ('');
    setFormA('');
    setShowAddForm(false);
  }

  function handleGot() {
    if (!card) return;
    setScores((prev) => ({ ...prev, [card.id]: 'got' }));
    advance();
  }

  function handleMissed() {
    if (!card) return;
    setScores((prev) => ({ ...prev, [card.id]: 'missed' }));
    advance();
  }

  function advance() {
    setShowAnswer(false);
    setCardIndex((i) => Math.min(i + 1, filteredQuestions.length - 1));
  }

  function startQuiz() {
    setCardIndex(0);
    setShowAnswer(false);
    setScores({});
    setMode('quiz');
  }

  if (mode === 'quiz') {
    const progress = filteredQuestions.length > 0
      ? Math.round(((cardIndex) / filteredQuestions.length) * 100)
      : 0;
    const done = cardIndex >= filteredQuestions.length || filteredQuestions.length === 0;

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setMode('select')}
            className="text-gray-400 hover:text-gray-700 p-1 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex-1">Study Session</h1>
          <span className="text-sm text-gray-500">
            {Math.min(cardIndex + 1, filteredQuestions.length)}/{filteredQuestions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-orange-400 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {done ? (
          // Results
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <GraduationCap size={48} className="mx-auto text-orange-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
            <p className="text-gray-500 mb-6">
              You reviewed {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}.
            </p>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{gotCount}</div>
                <div className="text-sm text-gray-500">Got It</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{missedCount}</div>
                <div className="text-sm text-gray-500">Missed</div>
              </div>
            </div>
            <button
              onClick={startQuiz}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
            >
              Study Again
            </button>
          </div>
        ) : card ? (
          // Flashcard
          <div
            className="bg-white border-2 border-gray-200 rounded-2xl p-8 min-h-64 flex flex-col cursor-pointer hover:border-orange-300 transition-colors"
            onClick={() => setShowAnswer((v) => !v)}
          >
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Question</p>
              <p className="text-xl font-semibold text-gray-900">{card.question}</p>

              {showAnswer && (
                <>
                  <div className="w-12 h-0.5 bg-gray-200 my-6" />
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Answer</p>
                  <p className="text-lg text-gray-700">{card.answer}</p>
                </>
              )}
            </div>

            {!showAnswer && (
              <p className="text-center text-sm text-gray-400 mt-4">Click to reveal answer</p>
            )}
          </div>
        ) : null}

        {/* Actions */}
        {!done && card && showAnswer && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleMissed}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 font-medium"
            >
              <XCircle size={18} /> Missed It
            </button>
            <button
              onClick={handleGot}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 border border-green-200 rounded-xl hover:bg-green-100 font-medium"
            >
              <CheckCircle size={18} /> Got It!
            </button>
          </div>
        )}
      </div>
    );
  }

  // Select mode
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Study Mode</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <Plus size={14} /> Add Question
          </button>
          {filteredQuestions.length > 0 && (
            <button
              onClick={startQuiz}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
            >
              <GraduationCap size={16} /> Start Session
            </button>
          )}
        </div>
      </div>

      {/* Filter by note */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={selectedNoteId}
          onChange={(e) => { setSelectedNoteId(e.target.value); setCardIndex(0); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white"
        >
          <option value="all">All Questions ({studyQuestions.length})</option>
          {notes
            .filter((n) => studyQuestions.some((q) => q.noteId === n.id))
            .map((n) => (
              <option key={n.id} value={n.id}>
                {n.title} ({studyQuestions.filter((q) => q.noteId === n.id).length})
              </option>
            ))}
        </select>
      </div>

      {/* Auto-generate from notes */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
          <Zap size={16} /> Auto-Generate Study Questions
        </h3>
        <p className="text-sm text-orange-700 mb-3">
          Select a note to automatically generate Q&A from its content.
        </p>
        <div className="flex gap-2 flex-wrap">
          {notes.map((note) => {
            const subj = subjectMap[note.subjectId];
            return (
              <button
                key={note.id}
                onClick={() => handleGenerate(note.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-300 rounded-lg text-sm text-orange-700 hover:bg-orange-100"
              >
                {subj && (
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subj.color }} />
                )}
                {note.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual add form */}
      {showAddForm && (
        <div className="bg-white border-2 border-orange-300 rounded-xl p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">New Question</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-700">
              <X size={16} />
            </button>
          </div>
          <textarea
            autoFocus
            value={formQ}
            onChange={(e) => setFormQ(e.target.value)}
            placeholder="Question…"
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
          />
          <textarea
            value={formA}
            onChange={(e) => setFormA(e.target.value)}
            placeholder="Answer…"
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 resize-none"
          />
          <select
            value={formNoteId}
            onChange={(e) => setFormNoteId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="">No linked note</option>
            {notes.map((n) => (
              <option key={n.id} value={n.id}>{n.title}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAddManual}
              disabled={!formQ.trim() || !formA.trim()}
              className="flex-1 bg-orange-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 bg-gray-100 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Question list */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <GraduationCap size={40} className="mx-auto mb-3 opacity-30" />
          <p>No study questions yet.</p>
          <p className="text-sm mt-1">Auto-generate from a note or add manually.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => {
            const note = notes.find((n) => n.id === q.noteId);
            return (
              <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4 group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-medium text-sm text-gray-900">{q.question}</p>
                  <button
                    onClick={() => deleteStudyQuestion(q.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 border-t border-gray-100 pt-2 mt-2">{q.answer}</p>
                {note && (
                  <p className="text-xs text-gray-400 mt-2">From: {note.title}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
