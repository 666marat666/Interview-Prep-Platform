import { LearningModule } from '../types';

export const LEARNING_MODULES: LearningModule[] = [
  // ===========================================================================
  // REACT MODULES
  // ===========================================================================
  {
    id: 'react-fetch',
    title: 'Fetching Data (JSON) in React',
    category: 'React',
    difficulty: 'Beginner',
    description: 'How to load data from an API using useEffect and useState.',
    explanation: `
In C# Windows Forms or WPF, you might trigger data loading in the 'Form_Load' event or the ViewModel constructor.

In React, side effects (like HTTP requests) belong in the **useEffect** hook.

1. **Dependency Array []**: Passing an empty array as the second argument ensures the effect runs ONLY once (on mount), similar to a Constructor.
2. **Async inside Effect**: You cannot make the useEffect callback itself async. You must define an async function *inside* it and call it immediately.
    `,
    files: [
      {
        name: 'UserList.tsx',
        language: 'typescript',
        content: `import React, { useState, useEffect } from 'react';

interface User { id: number; name: string; }

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Define async function inside the effect
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error loading users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // <--- Empty array = Run once on mount

  if (loading) return <div>Loading...</div>;

  return (
    <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
  );
}`
      }
    ]
  },
  {
    id: 'react-context',
    title: 'Dependency Injection via Context API',
    category: 'React',
    difficulty: 'Intermediate',
    description: 'Avoiding "Prop Drilling" by providing global state/services.',
    explanation: `
In C# .NET, you register services in the DI Container (Program.cs) and inject them via constructors.

In React, **Context** acts as the container.
1. **createContext**: Defines the "Service" interface.
2. **Provider**: Registers the implementation and wraps the component tree (like Scoped/Singleton scope).
3. **useContext**: The hook used by child components to resolve the dependency.
    `,
    files: [
      {
        name: 'AuthContext.tsx',
        language: 'typescript',
        content: `import React, { createContext, useContext, useState } from 'react';

interface AuthState {
  user: string | null;
  login: (name: string) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const login = (name: string) => setUser(name);

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};`
      }
    ]
  },
  {
    id: 'react-reducer',
    title: 'Complex State with useReducer',
    category: 'React',
    difficulty: 'Intermediate',
    description: 'Managing complex state logic, similar to Redux or a State Machine.',
    explanation: `
When useState gets too messy (e.g., multiple booleans updating together), **useReducer** is the alternative.

It works exactly like the Redux pattern or an Aggregate Root in DDD:
1. **State**: The current data snapshot.
2. **Action**: An event describing "What happened" (e.g., 'INCREMENT').
3. **Reducer**: A pure function \`(state, action) => newState\`.

This allows for predictable state transitions.
    `,
    files: [
      {
        name: 'Counter.tsx',
        language: 'typescript',
        content: `import React, { useReducer } from 'react';

type State = { count: number };
type Action = { type: 'increment' } | { type: 'decrement' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

export default function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}`
      }
    ]
  },
  {
    id: 'react-memo',
    title: 'Optimization with React.memo',
    category: 'React',
    difficulty: 'Advanced',
    description: 'preventing unnecessary re-renders of child components.',
    explanation: `
By default, when a Parent renders, all Children render. 
**React.memo** is a Higher-Order Component (HOC) that makes a component "Pure".
It only re-renders if the Props have changed.

C# Analogy: Like implementing \`IEquatable<T>\` or overriding \`GetHashCode()\` to check if an object actually changed before processing.
    `,
    files: [
      {
        name: 'ChildComponent.tsx',
        language: 'typescript',
        content: `import React, { memo } from 'react';

interface Props {
  name: string;
}

const Child = ({ name }: Props) => {
  console.log("Child rendered!");
  return <div>Hello {name}</div>;
};

// Wrap in memo to enable prop comparison check
export const MemoizedChild = memo(Child);`
      }
    ]
  },
  {
    id: 'react-refs',
    title: 'Accessing DOM with useRef',
    category: 'React',
    difficulty: 'Beginner',
    description: 'Directly accessing DOM elements or persisting values without re-renders.',
    explanation: `
**useRef** has two main uses:
1. **DOM Access**: Like \`document.getElementById\`.
2. **Instance Variables**: Holds a value that persists across renders but DOES NOT trigger a re-render when changed (unlike useState).

C# Analogy: A private field in a class that doesn't implement INotifyPropertyChanged.
    `,
    files: [
      {
        name: 'FocusInput.tsx',
        language: 'typescript',
        content: `import React, { useRef } from 'react';

export default function TextInputWithFocusButton() {
  // Initialize ref with null
  const inputEl = useRef<HTMLInputElement>(null);

  const onButtonClick = () => {
    // strict null check
    if (inputEl.current) {
      inputEl.current.focus();
    }
  };

  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}`
      }
    ]
  },
  {
    id: 'react-children',
    title: 'Wrapper Components (Children Prop)',
    category: 'React',
    difficulty: 'Beginner',
    description: 'Creating layout components that accept content.',
    explanation: `
The **children** prop is a special prop in React. It lets you pass components *inside* other components.
This is how you build Layouts, Cards, or Modals.

C# Analogy: Like XAML's \`<ContentControl>\` or passing content into a detailed View.
    `,
    files: [
      {
        name: 'Card.tsx',
        language: 'typescript',
        content: `import React from 'react';

// Props definition includes children
export const Card = ({ title, children }: { title: string, children: React.ReactNode }) => {
  return (
    <div className="border rounded p-4 shadow">
      <h2 className="font-bold border-b mb-2">{title}</h2>
      <div className="content">
        {children} {/* Renders whatever is passed inside <Card>...</Card> */}
      </div>
    </div>
  );
};

// Usage:
// <Card title="My Card">
//   <p>This is the content!</p>
// </Card>`
      }
    ]
  },
  {
    id: 'react-controlled',
    title: 'Controlled vs Uncontrolled Inputs',
    category: 'React',
    difficulty: 'Intermediate',
    description: 'The two ways to handle form inputs in React.',
    explanation: `
1. **Controlled (Recommended)**: React state handles the value. \`value={state}\` and \`onChange={setState}\`. The source of truth is React.
2. **Uncontrolled**: The DOM handles the value. You access it via \`useRef\`.

Controlled inputs are like Two-Way Binding in WPF (ViewModel <-> View).
    `,
    files: [
      {
        name: 'Form.tsx',
        language: 'typescript',
        content: `import React, { useState, useRef } from 'react';

export default function Form() {
  // Controlled
  const [val, setVal] = useState("");
  
  // Uncontrolled
  const ref = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Controlled:", val);
    console.log("Uncontrolled:", ref.current?.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={val} onChange={e => setVal(e.target.value)} placeholder="Controlled" />
      <input ref={ref} placeholder="Uncontrolled" />
      <button type="submit">Submit</button>
    </form>
  );
}`
      }
    ]
  },

  // ===========================================================================
  // ANGULAR MODULES
  // ===========================================================================
  {
    id: 'ng-pipes',
    title: 'Angular Pipes (Data Formatting)',
    category: 'Angular',
    difficulty: 'Beginner',
    description: 'Transforming data in templates using the pipe operator (|).',
    explanation: `
**Pipes** are simple functions used in templates to accept an input value and return a transformed value.
They are heavily used for Dates, Currency, and JSON formatting.

C# Analogy: String.Format() or ValueConverters in WPF/XAML.
    `,
    files: [
      {
        name: 'app.component.html',
        language: 'html',
        content: `<!-- Built-in Date Pipe -->
<p>Birthday: {{ birthday | date:'shortDate' }}</p>

<!-- Built-in Currency Pipe -->
<p>Price: {{ price | currency:'USD' }}</p>

<!-- Chaining Pipes -->
<p>Data: {{ rawData | json | uppercase }}</p>`
      },
      {
        name: 'app.component.ts',
        language: 'typescript',
        content: `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  birthday = new Date(1990, 3, 15);
  price = 123.45;
  rawData = { id: 1, name: 'Test' };
}`
      }
    ]
  },
  {
    id: 'ng-directives',
    title: 'Angular Attribute Directives',
    category: 'Angular',
    difficulty: 'Intermediate',
    description: 'Changing the appearance or behavior of a DOM element.',
    explanation: `
Directives are markers on a DOM element.
1. **Component**: A directive with a template.
2. **Structural**: Change DOM layout (*ngIf, *ngFor).
3. **Attribute**: Change appearance/behavior (ngClass, ngStyle).

You can create custom attribute directives to encapsulate UI logic (like a tooltip or highlight).
    `,
    files: [
      {
        name: 'highlight.directive.ts',
        language: 'typescript',
        content: `import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHighlight]', // Usage: <p appHighlight>
  standalone: true
})
export class HighlightDirective {
  constructor(private el: ElementRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.highlight('yellow');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}`
      }
    ]
  },
  {
    id: 'ng-guards',
    title: 'Angular Route Guards',
    category: 'Angular',
    difficulty: 'Intermediate',
    description: 'Preventing users from navigating to unauthorized routes.',
    explanation: `
**Guards** return \`true\` or \`false\` to allow/deny navigation.
Common types: CanActivate, CanDeactivate (unsaved changes), CanMatch.

C# Analogy: ASP.NET Core Authorization Filters (Attributes) on Controller Actions.
    `,
    files: [
      {
        name: 'auth.guard.ts',
        language: 'typescript',
        content: `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// Functional Guard (Modern Angular)
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    // Redirect to login
    return router.parseUrl('/login');
  }
};`
      }
    ]
  },
  {
    id: 'ng-signals-computed',
    title: 'Angular Computed Signals',
    category: 'Angular',
    difficulty: 'Intermediate',
    description: 'Deriving state efficiently with Signals.',
    explanation: `
**computed()** creates a readonly signal that derives its value from other signals.
It is memoized (cached) and only updates when dependencies change.

C# Analogy: A calculated property (getter) but with automatic caching/dependency tracking.
    `,
    files: [
      {
        name: 'cart.component.ts',
        language: 'typescript',
        content: `import { Component, signal, computed } from '@angular/core';

@Component({ ... })
export class CartComponent {
  price = signal(10);
  quantity = signal(2);

  // Automatically updates when price or quantity changes
  total = computed(() => this.price() * this.quantity());

  increment() {
    this.quantity.update(q => q + 1);
  }
}`
      }
    ]
  },
  {
    id: 'ng-reactive-forms',
    title: 'Angular Reactive Forms',
    category: 'Angular',
    difficulty: 'Advanced',
    description: 'Managing complex forms with explicit state management.',
    explanation: `
**Reactive Forms** provide direct, explicit access to the underlying form object model (FormControl, FormGroup).
They are more robust, scalable, and testable than Template-driven forms.
    `,
    files: [
      {
        name: 'profile-editor.component.ts',
        language: 'typescript',
        content: `import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: \`
    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
      <label>First Name:
        <input type="text" formControlName="firstName">
      </label>
      <label>Last Name:
        <input type="text" formControlName="lastName">
      </label>
      <button type="submit" [disabled]="!profileForm.valid">Submit</button>
    </form>
  \`
})
export class ProfileEditorComponent {
  profileForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
  });

  onSubmit() {
    console.warn(this.profileForm.value);
  }
}`
      }
    ]
  },
  {
    id: 'ng-output',
    title: 'Angular @Output & Event Emitters',
    category: 'Angular',
    difficulty: 'Beginner',
    description: 'Passing data from Child to Parent.',
    explanation: `
In React, you pass a callback function as a prop.
In Angular, you use **@Output** with an **EventEmitter**.

C# Analogy: Defining a C# \`event EventHandler<T> OnClick;\` in a child control.
    `,
    files: [
      {
        name: 'child.component.ts',
        language: 'typescript',
        content: `import { Component, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-child', template: '<button (click)="send()">Click Me</button>' })
export class ChildComponent {
  @Output() notify = new EventEmitter<string>();

  send() {
    this.notify.emit('Hello from Child!');
  }
}`
      },
      {
        name: 'parent.component.html',
        language: 'html',
        content: `<app-child (notify)="onNotify($event)"></app-child>`
      }
    ]
  },

  // ===========================================================================
  // VUE MODULES
  // ===========================================================================
  {
    id: 'vue-watch',
    title: 'Vue Watchers',
    category: 'Vue',
    difficulty: 'Intermediate',
    description: 'Running side effects when data changes.',
    explanation: `
**watch** allows you to perform async operations or expensive tasks in response to changing data.

C# Analogy: Implementing \`PropertyChanged\` callback logic to trigger other actions.
    `,
    files: [
      {
        name: 'Search.vue',
        language: 'html',
        content: `<script setup>
import { ref, watch } from 'vue';

const question = ref('');
const answer = ref('Questions usually contain a question mark. ;-)');

// Watch for changes on 'question' ref
watch(question, async (newQuestion, oldQuestion) => {
  if (newQuestion.includes('?')) {
    answer.value = 'Thinking...';
    try {
      const res = await fetch('https://yesno.wtf/api');
      answer.value = (await res.json()).answer;
    } catch (error) {
      answer.value = 'Error! Could not reach the API. ' + error;
    }
  }
});
</script>

<template>
  <p>Ask a yes/no question:</p>
  <input v-model="question" />
  <p>{{ answer }}</p>
</template>`
      }
    ]
  },
  {
    id: 'vue-slots',
    title: 'Vue Slots (Content Projection)',
    category: 'Vue',
    difficulty: 'Beginner',
    description: 'Passing template content into a component.',
    explanation: `
**Slots** are placeholders in a child component where parent content is injected.
This is identical to React's \`children\` prop or Angular's \`ng-content\`.

C# Analogy: Templated Controls in WPF where you define a \`ItemTemplate\`.
    `,
    files: [
      {
        name: 'AlertBox.vue',
        language: 'html',
        content: `<template>
  <div class="alert-box">
    <strong>Error!</strong>
    <!-- The <slot> tag will be replaced by parent content -->
    <slot></slot>
  </div>
</template>`
      },
      {
        name: 'Parent.vue',
        language: 'html',
        content: `<AlertBox>
  Something went wrong with <u>Connection</u>.
</AlertBox>`
      }
    ]
  },
  {
    id: 'vue-teleport',
    title: 'Vue Teleport',
    category: 'Vue',
    difficulty: 'Intermediate',
    description: 'Rendering content elsewhere in the DOM (e.g., Modals).',
    explanation: `
**<Teleport>** allows you to move a part of a component's template into a DOM node that exists outside the component hierarchy (like <body>).
Essential for Modals, Tooltips, and Popups to avoid z-index/overflow issues.

Analogy: Like React Portals.
    `,
    files: [
      {
        name: 'Modal.vue',
        language: 'html',
        content: `<template>
  <button @click="open = true">Open Modal</button>

  <Teleport to="body">
    <div v-if="open" class="modal">
      <p>Hello from the modal!</p>
      <button @click="open = false">Close</button>
    </div>
  </Teleport>
</template>`
      }
    ]
  },
  {
    id: 'vue-emit',
    title: 'Vue Emits (Child Events)',
    category: 'Vue',
    difficulty: 'Beginner',
    description: 'Sending events from child to parent.',
    explanation: `
In Vue, components emit events using **defineEmits**.
The parent listens using \`@event-name\`.
    `,
    files: [
      {
        name: 'Child.vue',
        language: 'html',
        content: `<script setup>
const emit = defineEmits(['increaseBy']);

function submit() {
  emit('increaseBy', 1);
}
</script>

<template>
  <button @click="submit">Increase</button>
</template>`
      },
      {
        name: 'Parent.vue',
        language: 'html',
        content: `<Child @increase-by="(n) => count += n" />`
      }
    ]
  },
  {
    id: 'vue-lifecycle',
    title: 'Vue Lifecycle Hooks',
    category: 'Vue',
    difficulty: 'Intermediate',
    description: 'Hooking into component creation, update, and destruction.',
    explanation: `
Vue provides explicit lifecycle hooks:
- **onMounted**: Component is in the DOM (React useEffect []).
- **onUpdated**: Reactive state changed (React useEffect [dep]).
- **onUnmounted**: Component removed (React useEffect cleanup).
    `,
    files: [
      {
        name: 'Lifecycle.vue',
        language: 'html',
        content: `<script setup>
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  console.log('Component is ready!');
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  console.log('Component destroyed!');
  window.removeEventListener('resize', handleResize);
});

function handleResize() { /* ... */ }
</script>`
      }
    ]
  },

  // ===========================================================================
  // C# .NET CORE MODULES (Advanced)
  // ===========================================================================
  {
    id: 'cs-async-streams',
    title: 'C# Async Streams (IAsyncEnumerable)',
    category: 'C# .NET',
    difficulty: 'Advanced',
    description: 'Streaming data asynchronously using yield return.',
    explanation: `
**IAsyncEnumerable<T>** (introduced in C# 8) allows you to iterate over a data source where *each item* might be retrieved asynchronously.
Great for processing large datasets from a DB or API without buffering everything in memory.

Analogy: Like \`IEnumerable<T>\` but you can \`await\` inside the loop.
    `,
    files: [
      {
        name: 'DataStreamer.cs',
        language: 'csharp',
        content: `public async IAsyncEnumerable<int> GetNumbersAsync()
{
    for (int i = 0; i < 10; i++)
    {
        await Task.Delay(100); // Simulate IO
        yield return i;
    }
}

// Consumer
public async Task Consume()
{
    await foreach (var number in GetNumbersAsync())
    {
        Console.WriteLine(number);
    }
}`
      }
    ]
  },
  {
    id: 'cs-middleware',
    title: 'Custom .NET Middleware',
    category: 'C# .NET',
    difficulty: 'Intermediate',
    description: 'Intercepting HTTP requests in the pipeline.',
    explanation: `
Middleware are components that are assembled into an application pipeline to handle requests and responses.
You can write custom middleware for Logging, Auth, or Headers.

Analogy: Like Filters in MVC or Interceptors.
    `,
    files: [
      {
        name: 'RequestLoggerMiddleware.cs',
        language: 'csharp',
        content: `public class RequestLoggerMiddleware
{
    private readonly RequestDelegate _next;

    public RequestLoggerMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        Console.WriteLine($"Request: {context.Request.Path}");
        
        // Call next middleware
        await _next(context);
        
        Console.WriteLine($"Response: {context.Response.StatusCode}");
    }
}

// Program.cs
app.UseMiddleware<RequestLoggerMiddleware>();`
      }
    ]
  },
  {
    id: 'cs-linq-deferred',
    title: 'LINQ Deferred Execution',
    category: 'C# .NET',
    difficulty: 'Intermediate',
    description: 'Understanding when LINQ queries actually execute.',
    explanation: `
LINQ queries are not executed when defined. They execute when you **iterate** (foreach) or materialize (ToList, ToArray).
This is "Deferred Execution".

Pitfall: Modifying the source collection while iterating throws an exception.
    `,
    files: [
      {
        name: 'LinqExample.cs',
        language: 'csharp',
        content: `var numbers = new List<int> { 1, 2, 3 };

// Query defined, NOT executed
var query = numbers.Select(n => n * 2); 

numbers.Add(4); // Add items after query definition

// Execution happens HERE. 
// Output includes 8 (4 * 2) because query ran now.
foreach (var n in query) 
{
    Console.WriteLine(n); 
}`
      }
    ]
  },
  {
    id: 'cs-extension-methods',
    title: 'C# Extension Methods',
    category: 'C# .NET',
    difficulty: 'Beginner',
    description: 'Adding methods to existing types without subclassing.',
    explanation: `
Extension methods allow you to "add" methods to existing types (like String or List).
They are static methods in a static class, using the \`this\` keyword on the first parameter.
    `,
    files: [
      {
        name: 'StringExtensions.cs',
        language: 'csharp',
        content: `public static class StringExtensions
{
    public static int WordCount(this string str)
    {
        return str.Split(new char[] { ' ', '.', '?' }, 
                         StringSplitOptions.RemoveEmptyEntries).Length;
    }
}

// Usage
string text = "Hello world";
int count = text.WordCount(); // Looks like an instance method`
      }
    ]
  },
  {
    id: 'cs-options-pattern',
    title: 'Options Pattern (Configuration)',
    category: 'C# .NET',
    difficulty: 'Intermediate',
    description: 'Strongly typed configuration management.',
    explanation: `
Instead of reading raw strings from \`appsettings.json\`, bind them to classes using **IOptions<T>**.
This provides Type Safety and DI support.
    `,
    files: [
      {
        name: 'EmailSettings.cs',
        language: 'csharp',
        content: `public class EmailSettings
{
    public string SmtpServer { get; set; }
    public int Port { get; set; }
}

// Program.cs
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("Email"));

// Service
public class EmailService
{
    private readonly EmailSettings _settings;
    
    public EmailService(IOptions<EmailSettings> options)
    {
        _settings = options.Value;
    }
}`
      }
    ]
  },
  {
    id: 'cs-attributes',
    title: 'Custom Attributes & Filters',
    category: 'C# .NET',
    difficulty: 'Intermediate',
    description: 'Creating metadata markers and Action Filters.',
    explanation: `
Attributes allow you to add metadata to classes/methods. 
In ASP.NET, ActionFilters use attributes to run logic before/after a controller action.
    `,
    files: [
      {
        name: 'LogAttribute.cs',
        language: 'csharp',
        content: `public class LogAttribute : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        Console.WriteLine("Executing...");
    }
}

// Usage in Controller
[Log]
[HttpGet]
public IActionResult Get() 
{
   return Ok();
}`
      }
    ]
  },

  // ===========================================================================
  // GENERAL & TYPESCRIPT
  // ===========================================================================
  {
    id: 'ts-generics',
    title: 'TypeScript Generics',
    category: 'General',
    difficulty: 'Intermediate',
    description: 'Reusable components with Type Safety.',
    explanation: `
Generics in TypeScript work very similarly to C# Generics.
They allow you to create components/functions that work over a variety of types rather than a single one.
    `,
    files: [
      {
        name: 'Box.ts',
        language: 'typescript',
        content: `// Generic Interface
interface Box<T> {
  contents: T;
}

// Generic Function
function identity<T>(arg: T): T {
  return arg;
}

// Usage
let stringBox: Box<string> = { contents: "hello" };
let num = identity<number>(42);`
      }
    ]
  },
  {
    id: 'ts-unions',
    title: 'TypeScript Union Types',
    category: 'General',
    difficulty: 'Beginner',
    description: 'Variables that can be one of several types.',
    explanation: `
C# doesn't strictly have Union types (though \`OneOf\` libraries exist).
TypeScript allows a variable to be \`string | number\`.
    `,
    files: [
      {
        name: 'id.ts',
        language: 'typescript',
        content: `function printId(id: number | string) {
  if (typeof id === "string") {
    // In this block, TS knows 'id' is a string
    console.log(id.toUpperCase());
  } else {
    // Here, TS knows 'id' is a number
    console.log(id);
  }
}`
      }
    ]
  },

  // --- ORIGINAL TODO PROJECTS (Integrated) ---
  {
    id: 'react-todo-sample',
    title: 'Full React Todo App',
    category: 'React',
    difficulty: 'Beginner',
    description: 'Complete Todo implementation with useState.',
    explanation: 'The classic example of React state management using functional components.',
    files: [
      {
        name: 'App.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';
interface Todo { id: number; text: string; }

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (!input) return;
    setTodos([...todos, { id: Date.now(), text: input }]);
    setInput('');
  };

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>Add</button>
      <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>
    </div>
  );
}`
      }
    ]
  },
  {
    id: 'vue-todo-sample',
    title: 'Full Vue 3 Todo App',
    category: 'Vue',
    difficulty: 'Beginner',
    description: 'Complete Todo implementation with Composition API.',
    explanation: 'Demonstrating v-model and v-for directives in Vue 3.',
    files: [
      {
        name: 'App.vue',
        language: 'html',
        content: `<script setup lang="ts">
import { ref } from 'vue';
const todos = ref<{id:number, text:string}[]>([]);
const input = ref('');

const addTodo = () => {
  if(!input.value) return;
  todos.value.push({id: Date.now(), text: input.value});
  input.value = '';
}
</script>
<template>
  <input v-model="input" />
  <button @click="addTodo">Add</button>
  <ul><li v-for="t in todos" :key="t.id">{{t.text}}</li></ul>
</template>`
      }
    ]
  },
  {
    id: 'angular-todo-sample',
    title: 'Full Angular Todo App',
    category: 'Angular',
    difficulty: 'Beginner',
    description: 'Complete Todo implementation with Signals.',
    explanation: 'Using the new Signals API in Angular 17+ for granular reactivity.',
    files: [
      {
        name: 'todo.component.ts',
        language: 'typescript',
        content: `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: \`
    <input [(ngModel)]="text" />
    <button (click)="add()">Add</button>
    <ul><li *ngFor="let t of todos()">{{t.text}}</li></ul>
  \`
})
export class TodoComponent {
  todos = signal<any[]>([]);
  text = '';

  add() {
    this.todos.update(v => [...v, {text: this.text}]);
    this.text = '';
  }
}`
      }
    ]
  },
  
  // ===========================================================================
  // EXISTING BASIC MODULES (Preserved)
  // ===========================================================================
  {
    id: 'react-custom-hook',
    title: 'Logic Reuse with Custom Hooks',
    category: 'React',
    difficulty: 'Intermediate',
    description: 'Extracting reusable state logic into a function.',
    explanation: `
In C#, you might create a BaseClass or a Helper Class to share logic.

In React, **Custom Hooks** are the standard for sharing stateful logic.
A custom hook is just a function that starts with 'use' and calls other hooks.
    `,
    files: [
      {
        name: 'useToggle.ts',
        language: 'typescript',
        content: `import { useState } from 'react';

export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(prev => !prev);
  return { value, toggle };
}`
      }
    ]
  },
  {
    id: 'vue-computed',
    title: 'Vue 3 Computed Properties',
    category: 'Vue',
    difficulty: 'Beginner',
    description: 'Derived state that automatically updates.',
    explanation: `
In Vue, **computed()** refs are cached. They only re-evaluate when their dependencies change.
This is highly efficient compared to running a function on every render.
    `,
    files: [
      {
        name: 'PriceCalculator.vue',
        language: 'html',
        content: `<script setup>
import { ref, computed } from 'vue';

const price = ref(100);
const quantity = ref(2);

// Computed ref
const total = computed(() => price.value * quantity.value);
</script>`
      }
    ]
  },
  {
    id: 'cs-minimal-api',
    title: 'C# .NET 8 Minimal API',
    category: 'C# .NET',
    difficulty: 'Beginner',
    description: 'Creating a REST endpoint without Controllers.',
    explanation: `
Modern .NET (6+) allows for "Minimal APIs" in Program.cs, removing the boilerplate of Controller classes.
    `,
    files: [
      {
        name: 'Program.cs',
        language: 'csharp',
        content: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/todos", () => new [] { "Buy Milk", "Walk Dog" });

app.Run();`
      }
    ]
  },
  {
    id: 'cs-di-lifecycle',
    title: 'C# DI Lifecycles',
    category: 'C# .NET',
    difficulty: 'Intermediate',
    description: 'Transient vs Scoped vs Singleton.',
    explanation: `
1. **Transient**: Created EVERY time.
2. **Scoped**: Created ONCE per Request.
3. **Singleton**: Created ONCE per App lifetime.
    `,
    files: [
      {
        name: 'Program.cs',
        language: 'csharp',
        content: `builder.Services.AddTransient<IOperation, Operation>();
builder.Services.AddScoped<MyDbContext>();
builder.Services.AddSingleton<ICache, MemoryCache>();`
      }
    ]
  },
  {
    id: 'cs-records',
    title: 'C# Records vs Classes',
    category: 'C# .NET',
    difficulty: 'Beginner',
    description: 'Using Record types for immutable data models.',
    explanation: `
**Records** are reference types that use value-based equality.
    `,
    files: [
      {
        name: 'Models.cs',
        language: 'csharp',
        content: `public record UserRecord(string Name, int Age);

void Example() {
    var u1 = new UserRecord("Dave", 30);
    var u3 = u1 with { Age = 31 };
}`
      }
    ]
  }
];