import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Todo = {
  id: string
  text: string
  completed: boolean
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const raw = localStorage.getItem('todos')
      return raw ? (JSON.parse(raw) as Todo[]) : []
    } catch {
      return []
    }
  })
  const [newTodo, setNewTodo] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.completed)
    if (filter === 'completed') return todos.filter(t => t.completed)
    return todos
  }, [todos, filter])

  function addTodo() {
    const text = newTodo.trim()
    if (!text) return
    setTodos(prev => [{ id: crypto.randomUUID(), text, completed: false }, ...prev])
    setNewTodo('')
  }

  function toggleTodo(id: string) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  function removeTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  function clearCompleted() {
    setTodos(prev => prev.filter(t => !t.completed))
  }

  const remainingCount = useMemo(() => todos.filter(t => !t.completed).length, [todos])

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos))
    } catch {}
  }, [todos])

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Todo</h1>
        </header>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTodo() }}
            placeholder="Add a task..."
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={addTodo} className="rounded-md bg-indigo-600 text-white text-sm px-4 py-2 hover:bg-indigo-700">
            Add
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {visibleTodos.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No tasks</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {visibleTodos.map(todo => (
                <li key={todo.id} className="flex items-center gap-3 p-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={"flex-1 text-sm " + (todo.completed ? 'line-through text-gray-400' : 'text-gray-900')}>{todo.text}</span>
                  <button onClick={() => removeTodo(todo.id)} className="text-gray-400 hover:text-red-500 text-xs">Delete</button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 text-sm text-gray-600">
            <div className="flex-1">{remainingCount} items left</div>
            <div className="flex items-center gap-2">
              <FilterButton current={filter} value="all" onClick={() => setFilter('all')}>All</FilterButton>
              <FilterButton current={filter} value="active" onClick={() => setFilter('active')}>Active</FilterButton>
              <FilterButton current={filter} value="completed" onClick={() => setFilter('completed')}>Completed</FilterButton>
            </div>
            <button onClick={clearCompleted} className="text-gray-500 hover:text-gray-800">Clear completed</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterButton({ current, value, onClick, children }: { current: 'all' | 'active' | 'completed', value: 'all' | 'active' | 'completed', onClick: () => void, children: React.ReactNode }) {
  const isActive = current === value
  return (
    <button
      onClick={onClick}
      className={
        'rounded-md px-3 py-1.5 text-sm border ' +
        (isActive ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200')
      }
    >
      {children}
    </button>
  )
}

export default App
