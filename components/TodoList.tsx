import React, { useMemo } from 'react';
import { useTodoStore } from '../store/todoStore';
import { TodoItem } from './TodoItem';
import { FilterType } from '../types';

export const TodoList: React.FC = () => {
  // Subscribe to store updates
  const { todos, filter } = useTodoStore();

  // C# Analogy: LINQ .Where() query.
  // useMemo ensures this logic only re-runs when 'todos' or 'filter' changes,
  // preventing unnecessary calculations on every render.
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case FilterType.ACTIVE:
        return todos.filter(t => !t.isCompleted);
      case FilterType.COMPLETED:
        return todos.filter(t => t.isCompleted);
      default:
        return todos;
    }
  }, [todos, filter]);

  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-xl mb-2">🎉 No tasks yet!</p>
        <p className="text-sm">Add one above to get started.</p>
      </div>
    );
  }

  if (filteredTodos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No {filter.toLowerCase()} tasks found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* C# Analogy: foreach loop. In React, we map data to components. */}
      {filteredTodos.map((todo) => (
        // Key prop is crucial for React's reconciliation algorithm (Diffing).
        // It's like a unique ID for the DOM element to track moves/deletes efficiently.
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
};