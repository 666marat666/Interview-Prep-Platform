import { create } from 'zustand';
import { Todo, FilterType } from '../types';
import { STORAGE_KEY } from '../constants';

// C# Analogy: State Management
// -------------------------------------------------------------------------
// This replaces the need for a complex "Service" that holds state or passing 
// data up and down 10 layers of components (Prop Drilling).
//
// Think of this file as a Global Singleton Service that holds the application state.
// Ideally, this is like a static class with Observable properties.

interface TodoState {
  // State (Properties)
  todos: Todo[];
  filter: FilterType;
  
  // Actions (Methods)
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  loadFromStorage: () => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  // Initial State
  todos: [],
  filter: FilterType.ALL,

  // Action: Add Todo
  addTodo: (text: string) => {
    // Functional Update Pattern:
    // We don't mutate state directly (e.g., todos.push). 
    // Instead, we return a new object representing the next state.
    // C# Analogy: Immutability (like C# Records with { ... }).
    set((state) => {
      const newTodo: Todo = {
        id: crypto.randomUUID(), // Native browser UUID generation
        text,
        isCompleted: false,
        createdAt: Date.now(),
      };
      
      const updatedTodos = [newTodo, ...state.todos];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      return { todos: updatedTodos };
    });
  },

  // Action: Toggle Completed
  toggleTodo: (id: string) => {
    set((state) => {
      const updatedTodos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      return { todos: updatedTodos };
    });
  },

  // Action: Remove
  // C# Analogy: standard LINQ Where() clause
  removeTodo: (id: string) => {
    set((state) => {
      const updatedTodos = state.todos.filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      return { todos: updatedTodos };
    });
  },

  // Action: Set Filter
  setFilter: (filter: FilterType) => set({ filter }),

  // Action: Load from LocalStorage (Persistence)
  loadFromStorage: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      set({ todos: JSON.parse(stored) });
    }
  }
}));