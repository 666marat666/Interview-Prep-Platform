import React, { useState, useMemo } from 'react';
import { CodeFile, LearningModule, TechCategory } from '../types';
import { LEARNING_MODULES } from '../data/learningModules';

// --- Utility Components ---

// Highlights matching text within a string
const HighlightedText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) return <>{text}</>;

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-white font-bold px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

// Reusable Code Viewer Component
const SimpleFileViewer: React.FC<{ files: CodeFile[], highlightTerm: string }> = ({ files, highlightTerm }) => {
  const [activeTab, setActiveTab] = useState(files[0]?.name || '');
  const activeFile = files.find(f => f.name === activeTab) || files[0];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 mt-4">
      <div className="flex bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {files.map(f => (
          <button
            key={f.name}
            onClick={() => setActiveTab(f.name)}
            className={`px-4 py-2 text-xs font-mono border-r border-gray-200 dark:border-gray-700 transition-colors whitespace-nowrap ${
              activeFile.name === f.name 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold border-b-2 border-b-blue-500' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>
      <div className="bg-[#1e1e1e] p-4 overflow-auto max-h-[500px]">
        <pre className="text-sm font-mono text-[#d4d4d4] whitespace-pre-wrap">
          {/* We only highlight in code if the term matches, but simple replace might break HTML syntax of highlighter.
              For simplicity in code blocks, we won't highlight syntax to avoid breaking the view, 
              or we could do basic text highlighting if strictly needed. 
              Let's skip highlighting *inside* code blocks for safety, or just simple text. */}
          {activeFile.content}
        </pre>
      </div>
    </div>
  );
};

export const LearningCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechCategory | 'All'>('All');
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  // Toggle Accordion
  const toggle = (id: string) => {
    const newSet = new Set(openIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setOpenIds(newSet);
  };

  // Filter Logic
  const filteredModules = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    
    return LEARNING_MODULES.filter(mod => {
      // 1. Category Filter
      if (selectedCategory !== 'All' && mod.category !== selectedCategory) return false;

      // 2. Search Filter (Title, Description, or Code Content)
      if (!searchTerm) return true;

      const inTitle = mod.title.toLowerCase().includes(lowerTerm);
      const inDesc = mod.description.toLowerCase().includes(lowerTerm);
      const inExplanation = mod.explanation.toLowerCase().includes(lowerTerm);
      const inCode = mod.files.some(f => f.content.toLowerCase().includes(lowerTerm));

      return inTitle || inDesc || inExplanation || inCode;
    });
  }, [searchTerm, selectedCategory]);

  const categories: (TechCategory | 'All')[] = ['All', 'React', 'Angular', 'Vue', 'C# .NET', 'General'];

  return (
    <div className="space-y-6 animate-fade-in min-h-screen">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-3xl border border-blue-100 dark:border-gray-700 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          📚 Learning Library
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 max-w-2xl">
          Browse our growing collection of tutorials. Compare implementation details across C#, React, Angular, and Vue. 
          Use the search bar to find specific concepts like "Dependency Injection" or "Fetch".
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords (e.g., 'JSON', 'Hook', 'Signal')..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400 font-medium px-2">
        Showing {filteredModules.length} tutorials
      </div>

      {/* List */}
      <div className="grid gap-4">
        {filteredModules.map((mod) => (
          <div 
            key={mod.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggle(mod.id)}
              className="w-full text-left p-5 flex justify-between items-start hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                     mod.category === 'React' ? 'bg-blue-100 text-blue-700' :
                     mod.category === 'Angular' ? 'bg-red-100 text-red-700' :
                     mod.category === 'Vue' ? 'bg-green-100 text-green-700' :
                     'bg-purple-100 text-purple-700'
                   }`}>
                     {mod.category}
                   </span>
                   <span className="text-xs text-gray-400">• {mod.difficulty}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                  <HighlightedText text={mod.title} highlight={searchTerm} />
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                   <HighlightedText text={mod.description} highlight={searchTerm} />
                </p>
              </div>
              <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 transition-transform duration-300 ${openIds.has(mod.id) ? 'rotate-180' : ''}`}>
                 <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </button>
            
            {/* Expanded Content */}
            {openIds.has(mod.id) && (
              <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                 {/* Deep Dive / Explanation */}
                 <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3 text-purple-600 dark:text-purple-400 font-bold text-sm uppercase tracking-wide">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                       Deep Dive Explanation
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      <HighlightedText text={mod.explanation} highlight={searchTerm} />
                    </div>
                 </div>

                 {/* Code Viewer */}
                 <div className="p-5">
                    <div className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2">Implementation Example</div>
                    <SimpleFileViewer files={mod.files} highlightTerm={searchTerm} />
                 </div>
              </div>
            )}
          </div>
        ))}

        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tutorials found matching "{searchTerm}"</p>
            <button 
               onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
               className="mt-2 text-blue-500 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};