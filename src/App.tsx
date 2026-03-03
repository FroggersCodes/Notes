import { useApp } from './contexts/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import NotesView from './components/Notes/NotesView';
import NoteEditor from './components/Notes/NoteEditor';
import ProjectsView from './components/Projects/ProjectsView';
import ProjectEditor from './components/Projects/ProjectEditor';
import CalendarView from './components/Calendar/CalendarView';
import StudyView from './components/Study/StudyView';
import SearchView from './components/Search/SearchView';

function MainContent() {
  const { currentView } = useApp();

  switch (currentView) {
    case 'dashboard':   return <Dashboard />;
    case 'notes':       return <NotesView />;
    case 'note-editor': return <NoteEditor />;
    case 'projects':    return <ProjectsView />;
    case 'project-editor': return <ProjectEditor />;
    case 'calendar':    return <CalendarView />;
    case 'study':       return <StudyView />;
    case 'search':      return <SearchView />;
    default:            return <Dashboard />;
  }
}

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen bg-gray-50">
        <MainContent />
      </main>
    </div>
  );
}
