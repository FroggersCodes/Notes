import { Note, StudyQuestion } from '../types';
import { generateId } from './helpers';

export function generateQuestionsFromNote(note: Note): StudyQuestion[] {
  const questions: StudyQuestion[] = [];
  const seen = new Set<string>();

  const sentences = note.content
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && s.length < 300);

  for (const sentence of sentences) {
    // Pattern: "X is/are/was/were Y"
    const isMatch =
      /^([A-Z][^,]{2,50}?)\s+(?:is|are|was|were)\s+(?:a |an |the )?([^,]{3,120})$/i.exec(
        sentence,
      );
    if (isMatch) {
      const q = `What ${/\bare\b|\bwere\b/i.test(sentence) ? 'are' : 'is'} ${isMatch[1]}?`;
      if (!seen.has(q)) {
        seen.add(q);
        questions.push({ id: generateId(), question: q, answer: isMatch[2].trim(), noteId: note.id });
      }
    }

    // Pattern: "X means/is defined as/refers to Y"
    const defMatch =
      /^([A-Z][^,]{2,50}?)\s+(?:means|is defined as|refers to|is called|is known as)\s+(.{3,120})$/i.exec(
        sentence,
      );
    if (defMatch) {
      const q = `What does "${defMatch[1].trim()}" mean?`;
      if (!seen.has(q)) {
        seen.add(q);
        questions.push({ id: generateId(), question: q, answer: defMatch[2].trim(), noteId: note.id });
      }
    }

    // Pattern: starts with "The [noun] of X is Y"
    const ofMatch = /^The (\w+) of ([^,]{2,40}) (?:is|are|was) (.{3,120})$/i.exec(sentence);
    if (ofMatch) {
      const q = `What is the ${ofMatch[1]} of ${ofMatch[2]}?`;
      if (!seen.has(q)) {
        seen.add(q);
        questions.push({ id: generateId(), question: q, answer: ofMatch[3].trim(), noteId: note.id });
      }
    }
  }

  return questions.slice(0, 15);
}
