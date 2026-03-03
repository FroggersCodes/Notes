import { Project, Task } from '../types';

interface CalendarEvent {
  uid: string;
  summary: string;
  description: string;
  date: string; // YYYY-MM-DD
}

function toICSDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

function escapeICS(str: string): string {
  return str.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
}

export function exportProjectsToICS(projects: Project[]): void {
  const events: CalendarEvent[] = [];

  for (const project of projects) {
    if (project.dueDate) {
      events.push({
        uid: `project-${project.id}`,
        summary: `[Project] ${project.name}`,
        description: project.description || '',
        date: project.dueDate,
      });
    }
    for (const task of project.tasks) {
      if (task.dueDate) {
        events.push({
          uid: `task-${task.id}`,
          summary: `[Task] ${task.title}`,
          description: task.description || '',
          date: task.dueDate,
        });
      }
    }
  }

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NoteTask//NoteTask Web App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const ev of events) {
    const d = toICSDate(ev.date);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${ev.uid}@notetask`,
      `SUMMARY:${escapeICS(ev.summary)}`,
      `DESCRIPTION:${escapeICS(ev.description)}`,
      `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${d}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  const ics = lines.join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'notetask-calendar.ics';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTaskToGoogleCalendar(task: Task, projectName: string): void {
  if (!task.dueDate) return;
  const date = task.dueDate.replace(/-/g, '');
  const title = encodeURIComponent(`[${projectName}] ${task.title}`);
  const details = encodeURIComponent(task.description || '');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}&details=${details}`;
  window.open(url, '_blank');
}
