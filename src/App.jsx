import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
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
  const { 
    data, 
    allData,
    hamsters, 
    currentHamster, 
    currentHamsterId,
    addEntry, 
    settings, 
    updateSettings, 
    importData,
    importBackup, 
    updateTodayEntry, 
    clearAllData,
    addHamster,
    updateHamster,
    setCurrentHamster,
    deleteHamster
  } = useCheeseData();
  const [view, setView] = useState('dashboard'); // dashboard, entry, settings, hamster-selector
  const [showWelcome, setShowWelcome] = useState(false);
  const [isNewHamster, setIsNewHamster] = useState(false);

  const theme = themes[settings.theme] || themes.cherry;
  
  // Check if onboarding is needed
  // Show welcome screen only if:
  // 1. No hamsters exist (first time use)
  // OR if showWelcome is true (adding new hamster)
  const needsOnboarding = hamsters.length === 0 || showWelcome;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.baseText} font-sans pb-20`}>
      {/* Header - Hide during onboarding */}
      {!needsOnboarding && (
        <header className={`${theme.header} sticky top-0 z-10 border-b ${theme.headerBorder} px-4 py-3 flex justify-between items-center shadow-sm`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h1 className={`text-xl font-black tracking-tight ${theme.headerText} flex items-center gap-2`}>
              🐹 倉鼠追蹤器
            </h1>
          </div>
          <button
            onClick={() => setView('settings')}
            className={`p-2 ${theme.headerButton} rounded-full flex-shrink-0`}
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
            hamsters={hamsters}
            currentHamsterId={currentHamsterId}
            isNewHamster={isNewHamster}
            onComplete={(welcomeData) => {
              addHamster(welcomeData);
              setShowWelcome(false);
              setIsNewHamster(false);
            }}
            onSelectHamster={(hamsterId) => {
              setCurrentHamster(hamsterId);
              setShowWelcome(false);
            }}
            onCancel={() => {
              if (isNewHamster) {
                setShowWelcome(false);
                setIsNewHamster(false);
              }
            }}
            onImportData={importData}
            onImportBackup={importBackup}
            onImportSettings={(settingsData) => {
              // Import as new hamster
              addHamster(settingsData);
              setShowWelcome(false);
              setIsNewHamster(false);
            }}
            onImportBackupComplete={() => {
              // Reload page to refresh data after backup import
              window.location.reload();
            }}
          />
        ) : (
          <>
            {view === 'dashboard' && (
              <>
                <Dashboard 
                  data={data} 
                  theme={theme} 
                  settings={settings} 
                  onAddClick={() => setView('entry')} 
                  onUpdateSettings={updateSettings}
                  hamsters={hamsters}
                  currentHamsterId={currentHamsterId}
                  onSelectHamster={setCurrentHamster}
                  onAddHamster={() => {
                    setIsNewHamster(true);
                    setShowWelcome(true);
                  }}
                  onEditHamster={updateHamster}
                />
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
                hamsters={hamsters}
                currentHamsterId={currentHamsterId}
                onUpdate={updateSettings}
                onImport={importData}
                onImportBackup={importBackup}
                onClearAll={clearAllData}
                onAddHamster={() => {
                  setIsNewHamster(true);
                  setShowWelcome(true);
                }}
                onDeleteHamster={deleteHamster}
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
