import React from 'react';
import { Todo } from '../types';
import { useTodoStore } from '../store/todoStore';

interface TodoItemProps {
  todo: Todo;
}

// C# Analogy: A "Partial View" or a specific "UserControl"
// It receives data via 'props' (arguments) and renders output.
export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  // Extracting actions from store
  const { toggleTodo, removeTodo } = useTodoStore();

  // Handling date formatting
  const formattedDate = new Date(todo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="group flex items-center justify-between p-4 mb-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        {/* Checkbox */}
        <button
          onClick={() => toggleTodo(todo.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            todo.isCompleted 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          {todo.isCompleted && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Text */}
        <div className="flex flex-col">
          <span 
            className={`text-lg font-medium transition-all ${
              todo.isCompleted 
                ? 'text-gray-400 line-through' 
                : 'text-gray-800 dark:text-gray-100'
            }`}
          >
            {todo.text}
          </span>
          <span className="text-xs text-gray-400">{formattedDate}</span>
        </div>
      </div>

      {/* Delete Button - Only shows on hover (group-hover) */}
      <button
        onClick={() => removeTodo(todo.id)}
        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2"
        aria-label="Delete todo"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};