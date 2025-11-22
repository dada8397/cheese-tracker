import { useState } from 'react';
import { Settings as SettingsIcon, Plus } from 'lucide-react';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import HistoryFeed from './components/HistoryFeed';
import AIAnalysis from './components/AIAnalysis';
import SettingsPage from './components/Settings';
import QuickUpdate from './components/QuickUpdate';
import Welcome from './components/Welcome';
import { useCheeseData } from './hooks/useCheeseData';
import { themes } from './utils/themes';

function App() {
  const { data, addEntry, settings, updateSettings, importData, updateTodayEntry, clearAllData } = useCheeseData();
  const [view, setView] = useState('dashboard'); // dashboard, entry, settings

  const theme = themes[settings.theme] || themes.cherry;
  
  // Check URL parameter for testing
  const urlParams = new URLSearchParams(window.location.search);
  const forceFirstTime = urlParams.get('first') === 'true';
  
  // Check if onboarding is needed
  // Show welcome screen only if:
  // 1. onboardingCompleted is not true AND
  // 2. no existing data AND
  // 3. no hamster name in settings (for backward compatibility)
  // OR if ?first=true is in URL (for testing)
  const hasExistingData = data && data.length > 0;
  const hasHamsterInfo = settings.hamsterName && settings.hamsterName.trim() !== '';
  const needsOnboarding = forceFirstTime || (!settings.onboardingCompleted && !hasExistingData && !hasHamsterInfo);

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.baseText} font-sans pb-20`}>
      {/* Header - Hide during onboarding */}
      {!needsOnboarding && (
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
      )}

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {needsOnboarding ? (
          <Welcome
            theme={theme}
            onComplete={(welcomeData) => {
              updateSettings({
                ...welcomeData,
                onboardingCompleted: true
              });
              
              // Remove ?first=true from URL if present
              if (forceFirstTime) {
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
              }
            }}
            onImportData={importData}
            onImportSettings={(settingsData) => {
              updateSettings({
                ...settingsData,
                onboardingCompleted: false // Keep onboarding incomplete so user can review/complete
              });
            }}
          />
        ) : (
          <>
            {view === 'dashboard' && (
              <>
                <Dashboard data={data} theme={theme} settings={settings} onAddClick={() => setView('entry')} onUpdateSettings={updateSettings} />
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
                onClearAll={clearAllData}
                theme={theme}
                onClose={() => setView('dashboard')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
