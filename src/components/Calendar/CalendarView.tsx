import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { exportProjectsToICS, exportTaskToGoogleCalendar } from '../../utils/exportCalendar';
import { isOverdue, isDueToday } from '../../utils/helpers';

interface DayEvent {
  label: string;
  type: 'project' | 'task';
  color: string;
  projectId?: string;
  taskId?: string;
  projectName?: string;
}

export default function CalendarView() {
  const { projects, navigate } = useApp();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Build event map: "YYYY-MM-DD" → DayEvent[]
  const eventMap: Record<string, DayEvent[]> = {};

  for (const project of projects) {
    if (project.dueDate) {
      const events = (eventMap[project.dueDate] ??= []);
      events.push({ label: project.name, type: 'project', color: project.color, projectId: project.id });
    }
    for (const task of project.tasks) {
      if (task.dueDate) {
        const events = (eventMap[task.dueDate] ??= []);
        events.push({
          label: task.title,
          type: 'task',
          color: project.color,
          projectId: project.id,
          taskId: task.id,
          projectName: project.name,
        });
      }
    }
  }

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDay(null);
  }

  function dateStr(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const monthName = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const selectedEvents = selectedDay ? (eventMap[dateStr(selectedDay)] ?? []) : [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <button
          onClick={() => exportProjectsToICS(projects)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <Download size={16} /> Export to Google Calendar (.ics)
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button onClick={prevMonth} className="p-1.5 rounded hover:bg-gray-100">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-semibold text-gray-900">{monthName}</h2>
            <button onClick={nextMonth} className="p-1.5 rounded hover:bg-gray-100">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 text-center py-2 border-b border-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-medium text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (day === null)
                return <div key={`empty-${i}`} className="h-16 border-b border-r border-gray-50" />;

              const ds = dateStr(day);
              const events = eventMap[ds] ?? [];
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`h-16 border-b border-r border-gray-50 p-1 text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50'
                      : isToday
                        ? 'bg-indigo-600'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      isToday ? 'text-white' : isSelected ? 'text-indigo-700' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {events.slice(0, 3).map((ev, j) => (
                      <span
                        key={j}
                        className="block w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: ev.color }}
                      />
                    ))}
                    {events.length > 3 && (
                      <span className="text-xs text-gray-400">+{events.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar: selected day / upcoming */}
        <div className="space-y-4">
          {selectedDay ? (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                {new Date(year, month, selectedDay).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-gray-400">Nothing due.</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2 rounded-lg border border-gray-100 hover:border-gray-200"
                    >
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: ev.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{ev.label}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {ev.type}{ev.projectName ? ` · ${ev.projectName}` : ''}
                        </p>
                      </div>
                      {ev.type === 'task' && ev.taskId && (
                        <button
                          title="Add to Google Calendar"
                          onClick={() => {
                            const proj = projects.find((p) => p.id === ev.projectId);
                            const task = proj?.tasks.find((t) => t.id === ev.taskId);
                            if (task && proj) exportTaskToGoogleCalendar(task, proj.name);
                          }}
                          className="text-gray-400 hover:text-blue-500 flex-shrink-0"
                        >
                          <ExternalLink size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Click a day to see events</h3>
              <p className="text-sm text-gray-400">
                Colored dots indicate due dates for projects and tasks.
              </p>
            </div>
          )}

          {/* Export instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Google Calendar Export</h4>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Export (.ics)" above</li>
              <li>Open Google Calendar</li>
              <li>Settings → Import & Export</li>
              <li>Select the downloaded file</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
