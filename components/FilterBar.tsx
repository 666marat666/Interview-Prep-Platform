import React from 'react';
import { FilterType } from '../types';
import { useTodoStore } from '../store/todoStore';

// Functional Component
export const FilterBar: React.FC = () => {
  // Accessing Global Store
  const { filter, setFilter } = useTodoStore();

  const btnClass = (isActive: boolean) => 
    `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
    }`;

  return (
    <div className="flex justify-center space-x-3 mb-6">
      {Object.values(FilterType).map((type) => (
        <button
          key={type}
          onClick={() => setFilter(type)}
          className={btnClass(filter === type)}
        >
          {type.charAt(0) + type.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );
};