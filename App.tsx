import React, { useState } from 'react';
import { APP_TITLE } from './constants';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LearningCenter } from './components/LearningCenter';
import { InterviewPrep } from './components/InterviewPrep';

/**
 * C# Developer's Quick Reference to React (Hooks):
 * 
 * 1. useState(initial): 
 *    - Analogy: A Property { get; set; } + INotifyPropertyChanged.
 *    - Triggers a re-render of the UI when changed.
 * 
 * 2. useEffect(fn, [dependencies]):
 *    - Analogy: Constructor + OnLoad + OnClose + PropertyChanged Event Handler.
 *    - [] -> Runs once on mount (Constructor/OnLoad).
 *    - [prop] -> Runs when 'prop' changes (PropertyChanged).
 *    - return () => {} -> Runs on unmount (Dispose/Destructor).
 * 
 * 3. useContext(Context):
 *    - Analogy: Service Locator or Dependency Injection resolution.
 */

// A wrapper component to handle the header containing the Theme Toggle
function Header() {
  const { theme, toggleTheme } = useTheme(); // Consuming Context

  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
        {APP_TITLE}
      </h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 transition-colors"
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}

// Enum for Tab Selection
type Tab = 'LEARNING' | 'INTERVIEW';

// The Main App Component
function TodoAppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('LEARNING');

  return (
    <div className="max-w-3xl mx-auto pt-10 px-4 pb-20">
      <Header />
      
      {/* Tab Navigation Control */}
      {/* C# Analogy: Like a TabControl or RadioButton group for View Switching */}
      <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-xl mb-8">
        <button
          onClick={() => setActiveTab('LEARNING')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'LEARNING'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          📚 Learning Center
        </button>
        <button
          onClick={() => setActiveTab('INTERVIEW')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'INTERVIEW'
              ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
          }`}
        >
          🤖 Interview Prep
        </button>
      </div>
      
      {/* Conditional Rendering based on State */}
      <div className={activeTab === 'LEARNING' ? 'block' : 'hidden'}>
        <LearningCenter />
      </div>

      {/* We keep it mounted but hidden or mount conditionally depending on preference.
          Conditional mounting (using &&) resets state when switching tabs.
          Hidden class preserves state (like your typed code).
      */}
      {activeTab === 'INTERVIEW' && (
        <div className="animate-fade-in">
          <InterviewPrep />
        </div>
      )}
    </div>
  );
}

// Root App Component
// wraps the content in necessary Providers (Context)
function App() {
  return (
    <ThemeProvider>
      <TodoAppContent />
    </ThemeProvider>
  );
}

export default App;