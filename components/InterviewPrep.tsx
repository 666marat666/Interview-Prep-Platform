import React, { useState } from 'react';
import { useInterviewStore } from '../store/interviewStore';
import { InterviewTopic, InterviewComplexity, InterviewType, HistoryItem, CodeFile } from '../types';

// Sub-component for displaying file content (Read Only)
const FileViewer: React.FC<{ files: CodeFile[] }> = ({ files }) => {
  const [activeTab, setActiveTab] = useState(files[0]?.name || '');
  const activeFile = files.find(f => f.name === activeTab) || files[0];

  if (!files || files.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mt-2">
      <div className="flex bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {files.map(f => (
          <button
            key={f.name}
            onClick={() => setActiveTab(f.name)}
            className={`px-3 py-1 text-xs font-mono border-r border-gray-200 dark:border-gray-700 ${
              activeFile.name === f.name 
                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 font-bold' 
                : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f.name}
          </button>
        ))}
      </div>
      <div className="bg-gray-900 p-3 overflow-auto max-h-60">
        <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">
          {activeFile.content}
        </pre>
      </div>
    </div>
  );
};

// Sub-component for History Entry
const HistoryEntry: React.FC<{ item: HistoryItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
      >
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              item.question.type === 'Theory' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {item.question.type}
            </span>
            <span className="text-xs font-mono text-gray-400">
              {new Date(item.timestamp).toLocaleTimeString()} • {item.question.topic} • {item.question.complexity}
            </span>
          </div>
          <p className="font-medium text-gray-700 dark:text-gray-300 line-clamp-1">
            {item.question.text}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            item.evaluation.isCorrect 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {item.evaluation.isCorrect ? 'Pass' : 'Review'}
          </div>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700 text-sm space-y-6 animate-fade-in">
          
          {/* Question */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Question</h4>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{item.question.text}</p>
          </div>

          {/* User Submission */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Your Submission</h4>
            {item.question.type === 'Theory' ? (
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic">
                {item.submittedText || "(No text provided)"}
              </div>
            ) : (
              <FileViewer files={item.submittedFiles} />
            )}
          </div>

          {/* Evaluation */}
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Feedback</h4>
            <div className={`p-3 rounded border ${
              item.evaluation.isCorrect 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <p className="text-gray-700 dark:text-gray-300">{item.evaluation.feedback}</p>
              {item.evaluation.improvedCode && (
                 <div className="mt-3">
                   <p className="text-xs font-semibold uppercase opacity-70 mb-1">Suggested Improvement:</p>
                   <pre className="bg-black/10 dark:bg-black/30 p-2 rounded text-xs font-mono overflow-x-auto">
                     {item.evaluation.improvedCode}
                   </pre>
                 </div>
              )}
            </div>
          </div>

           {/* Reference Answer */}
           <div>
             <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">Reference Solution</h4>
             <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded border border-yellow-100 dark:border-yellow-900/30 text-gray-700 dark:text-gray-300">
                {item.question.referenceAnswer}
             </div>
           </div>

        </div>
      )}
    </div>
  );
};


export const InterviewPrep: React.FC = () => {
  const { 
    currentTopic, 
    setTopic,
    currentComplexity,
    setComplexity,
    currentType,
    setType,
    fetchQuestion, 
    currentQuestion, 
    isLoading, 
    activeFiles,
    activeFileName,
    setActiveFile,
    updateFileContent,
    submitAnswer,
    evaluation,
    history,
    clearHistory
  } = useInterviewStore();

  const [textAnswer, setTextAnswer] = useState('');

  const topics: InterviewTopic[] = ['C# .NET', 'React', 'VueJS 3', 'General TypeScript', 'Basic Architecture'];
  const complexities: InterviewComplexity[] = ['Junior', 'Medior', 'Senior'];
  const types: InterviewType[] = ['Theory', 'Practice'];

  // Helper to get active file content
  const activeFile = activeFiles.find(f => f.name === activeFileName);

  const handleSubmit = () => {
    submitAnswer(textAnswer);
  };

  return (
    <div className="space-y-8">
      
      {/* --- Controls Section --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
          <span>🤖</span> AI Technical Interviewer
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Topic
            </label>
            <select
              value={currentTopic}
              onChange={(e) => setTopic(e.target.value as InterviewTopic)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Complexity
            </label>
            <select
              value={currentComplexity}
              onChange={(e) => setComplexity(e.target.value as InterviewComplexity)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {complexities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Type
            </label>
            <select
              value={currentType}
              onChange={(e) => setType(e.target.value as InterviewType)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <button
            onClick={fetchQuestion}
            disabled={isLoading}
            className="md:col-span-1 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-blue-500/30"
          >
            {isLoading && !currentQuestion ? 'Generating...' : 'Start New Question'}
          </button>
        </div>
      </div>

      {/* --- Current Question Region --- */}
      {currentQuestion && (
        <div className="animate-fade-in bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Question Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-2">
               <div className="flex gap-2">
                 <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  {currentQuestion.complexity}
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  currentQuestion.type === 'Theory' 
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300' 
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300'
                }`}>
                  {currentQuestion.type}
                </span>
               </div>
              <span className="text-xs text-gray-400 font-mono">ID: {currentQuestion.id.slice(0, 8)}</span>
            </div>
            <p className="text-lg text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
              {currentQuestion.text}
            </p>

            {/* Reference Solution Peek */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
               <details className="group">
                  <summary className="flex items-center cursor-pointer text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors select-none">
                     <svg className="w-4 h-4 mr-2 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                     Stuck? Reveal Educational Solution
                  </summary>
                  <div className="mt-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap border border-yellow-100 dark:border-yellow-900/30">
                     <strong className="block mb-2 text-yellow-800 dark:text-yellow-500 uppercase tracking-wide text-xs">Explanation & Solution:</strong>
                     {currentQuestion.referenceAnswer}
                  </div>
               </details>
            </div>
          </div>

          {/* Interactive Area */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
            
            {/* CODE VIEWER / EDITOR */}
            {currentQuestion.hasCode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {currentQuestion.type === 'Practice' ? 'Your Code Solution (Editable)' : 'Context Code (Read Only)'}
                  </label>
                </div>

                {/* File Tabs */}
                {activeFiles.length > 0 && (
                  <div className="flex space-x-1 mb-0 overflow-x-auto">
                    {activeFiles.map((file) => (
                      <button
                        key={file.name}
                        onClick={() => setActiveFile(file.name)}
                        className={`px-4 py-2 text-sm font-mono border-t border-l border-r rounded-t-lg transition-colors ${
                          activeFileName === file.name
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {file.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Editor */}
                <div className="relative group">
                  <textarea
                    value={activeFile?.content || ''}
                    onChange={(e) => updateFileContent(activeFileName, e.target.value)}
                    // Disable editing if Theory type
                    readOnly={currentQuestion.type === 'Theory'}
                    className={`w-full h-[600px] p-4 rounded-b-xl rounded-tr-xl outline-none transition-all code-editor font-mono text-sm resize-none ${
                       currentQuestion.type === 'Theory' 
                       ? 'bg-gray-800 text-gray-300 cursor-default' 
                       : 'bg-gray-900 text-green-400 focus:ring-2 focus:ring-purple-500'
                    }`}
                    spellCheck={false}
                  />
                  <div className="absolute top-2 right-2 text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded opacity-50">
                    {activeFile?.language || 'text'}
                  </div>
                </div>
              </div>
            )}
            
            {/* TEXT ANSWER AREA (Visible mostly for Theory, but can be used for notes in Practice) */}
            {currentQuestion.type === 'Theory' && (
              <div>
                 <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Your Answer / Explanation
                </label>
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  className="w-full h-40 p-4 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all font-sans text-base bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                  placeholder="Explain your answer here..."
                />
              </div>
            )}

            {/* Action Bar */}
            <div className="mt-6 flex justify-between items-center">
               <div className="text-xs text-gray-400">
                 {currentQuestion.type === 'Practice' 
                   ? 'Tip: Edit the code files directly to solve the problem.' 
                   : 'Tip: Analyze the code/question and provide a text explanation.'}
               </div>
               <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-purple-500/30 flex items-center gap-2"
              >
                {isLoading ? (
                   <span>Evaluating...</span>
                ) : (
                   <>
                     <span>Submit Answer</span>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Feedback Region --- */}
      {evaluation && currentQuestion && (
        <div className="animate-slide-up space-y-4">
          
          {/* Evaluation Card */}
          <div className={`p-6 rounded-2xl border-l-4 shadow-lg ${
            evaluation.isCorrect 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-500'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${
                evaluation.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {evaluation.isCorrect 
                  ? <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  : <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                }
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-2 ${
                  evaluation.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {evaluation.isCorrect ? 'Excellent Work!' : 'Review Needed'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {evaluation.feedback}
                </p>
                {evaluation.improvedCode && (
                  <div className="mt-4">
                     <p className="text-sm font-semibold opacity-70 mb-2">Improvement Suggestion:</p>
                     <pre className="bg-black/10 dark:bg-black/30 p-3 rounded text-sm font-mono overflow-x-auto">
                       {evaluation.improvedCode}
                     </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Session History --- */}
      {history.length > 0 && (
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider">Session History</h3>
            <button
              onClick={clearHistory}
              className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline transition-all"
            >
              Clear History
            </button>
          </div>
          
          <div className="space-y-4">
            {history.slice().reverse().map((item, idx) => (
              <HistoryEntry key={item.timestamp} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Intro State */}
      {!currentQuestion && !isLoading && (
        <div className="text-center py-12 opacity-50">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Select a topic, complexity, and type to start.</p>
        </div>
      )}
    </div>
  );
};