import { CheckCircleFillIcon } from "@primer/octicons-react";
import useSWR from "swr";
import AddTodo from "./components/AddTodo";

export interface Todo {
  id: number;
  title: string;
  body: string;
  done: boolean;
}

export const ENDPOINT = "http://localhost:4000";



const fetcher = (url: string) =>
  fetch(`${ENDPOINT}/${url}`).then((r) => r.json());

function App() {
  const { data, mutate } = useSWR<Todo[]>("api/todos", fetcher);

  async function markTodoAsDone(id: number) {
    const updated = await fetch(`${ENDPOINT}/api/todos/${id}/done`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true }),
    }).then((r) => r.json());

    mutate((current) =>
      current ? current.map((t) => (t.id === updated.id ? updated : t)) : []
    , false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-12 px-4">
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">
          TodoApp
        </h1>
      </header>

      {/* Todo list card */}
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-6">
        {data?.length === 0 && (
          <p className="text-gray-500 text-center">No todos yet. Add one!</p>
        )}

        <ul className="space-y-4">
          {data?.map((todo) => (
            <li
              key={`todo_${todo.id}`}
              onClick={() => markTodoAsDone(todo.id)}
              className={`flex items-start p-4 rounded-xl border cursor-pointer transition hover:shadow-md ${
                todo.done
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <span
                className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full mr-4 ${
                  todo.done ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <CheckCircleFillIcon size={18} className="text-white" />
              </span>

              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold ${
                    todo.done ? "line-through text-gray-500" : "text-gray-800"
                  }`}
                >
                  {todo.title}
                </h3>
                <p
                  className={`text-sm ${
                    todo.done ? "line-through text-gray-400" : "text-gray-600"
                  }`}
                >
                  {todo.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <AddTodo mutate={mutate} />
        </div>
      </div>
    </div>
  );
}

export default App;