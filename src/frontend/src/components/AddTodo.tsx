import { useState } from "react";
import { useForm } from "@mantine/form";
import { ENDPOINT, type Todo } from "../App";
import type { KeyedMutator } from "swr";

function AddTodo({ mutate }: { mutate: KeyedMutator<Todo[]> }) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    initialValues: {
      title: "",
      body: "",
    },
  });

  async function createTodo(values: { title: string; body: string }) {
    const updated = await fetch(`${ENDPOINT}/api/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then((r) => r.json());

    mutate(updated);
    form.reset();
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700 transition"
      >
        + Add Todo
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Create Todo
            </h2>
            <form
              onSubmit={form.onSubmit(createTodo)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Todo
                </label>
                <input
                  required
                  placeholder="What do you want to do?"
                  {...form.getInputProps("title")}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Body
                </label>
                <textarea
                  required
                  placeholder="Tell me more..."
                  {...form.getInputProps("body")}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddTodo;
