import { useState } from 'react';
import { Settings as SettingsIcon, Plus } from 'lucide-react';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import HistoryFeed from './components/HistoryFeed';
import AIAnalysis from './components/AIAnalysis';
import SettingsPage from './components/Settings';
import QuickUpdate from './components/QuickUpdate';
import { useCheeseData } from './hooks/useCheeseData';
import { themes } from './utils/themes';

function App() {
  const { data, addEntry, settings, updateSettings, importData, updateTodayEntry } = useCheeseData();
  const [view, setView] = useState('dashboard'); // dashboard, entry, settings

  const theme = themes[settings.theme] || themes.cherry;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.baseText} font-sans pb-20`}>
      {/* Header */}
      <header className={`${theme.header} sticky top-0 z-10 border-b ${theme.headerBorder} px-4 py-3 flex justify-between items-center shadow-sm`}>
        <h1 className={`text-xl font-black tracking-tight ${theme.headerText} flex items-center gap-2`}>
          🐹 倉鼠追蹤器
        </h1>
        <button
          onClick={() => setView('settings')}
          className={`p-2 ${theme.headerButton} rounded-full`}
        >
          <SettingsIcon size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">

        {view === 'dashboard' && (
          <>
            <Dashboard data={data} theme={theme} onAddClick={() => setView('entry')} />
            <QuickUpdate theme={theme} onUpdate={updateTodayEntry} />
            <AIAnalysis data={data} apiKey={settings.apiKey} theme={theme} hamsterBackground={settings.hamsterBackground} />
            <HistoryFeed data={data} theme={theme} />
          </>
        )}

        {view === 'entry' && (
          <EntryForm
            theme={theme}
            onSave={(entry) => {
              addEntry(entry);
              setView('dashboard');
            }}
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdate={updateSettings}
            onImport={importData}
            theme={theme}
            onClose={() => setView('dashboard')}
          />
        )}

      </main>
    </div>
  );
}

export default App;
