import React, { useState, KeyboardEvent } from 'react';
import { generateSubtasks } from '../services/geminiService';

interface AddTodoProps {
  // Callback to parent/store
  onAdd: (text: string) => void;
}

export const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  // C# Analogy: useState is like a Property with a backing field and INotifyPropertyChanged.
  // const [property, setProperty] = useState(initialValue);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAdd = () => {
    if (!inputText.trim()) return;
    onAdd(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleAiBreakdown = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    // Call our service layer
    const subtasks = await generateSubtasks(inputText);
    
    // Add the main task
    onAdd(inputText);
    
    // Add all generated subtasks
    subtasks.forEach(task => onAdd(task));
    
    setInputText('');
    setIsGenerating(false);
  };

  return (
    <div className="mb-8">
      <div className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)} // Two-way binding manually implemented
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className="flex-1 p-4 bg-transparent outline-none text-gray-700 dark:text-white placeholder-gray-400"
          disabled={isGenerating}
        />
        
        {/* AI Action Button */}
        {inputText.length > 3 && (
           <button
             onClick={handleAiBreakdown}
             disabled={isGenerating}
             className="mr-2 text-purple-500 hover:text-purple-600 font-semibold text-sm px-3 py-1 rounded bg-purple-50 hover:bg-purple-100 transition-colors flex items-center gap-1"
             title="Use AI to break this down into subtasks"
           >
             {isGenerating ? (
               <span className="animate-pulse">Thinking...</span>
             ) : (
               <>
                 <span>✨ Magic Split</span>
               </>
             )}
           </button>
        )}

        {/* Standard Add Button */}
        <button
          onClick={handleAdd}
          disabled={isGenerating}
          className="p-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:bg-gray-400"
        >
          Add
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400 text-center">
        Tip: Type a complex task (e.g., "Plan a vacation") and click "Magic Split" to see AI in action.
      </p>
    </div>
  );
};