import React, { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/main';
import { Task } from '@/store/main'; // Import Task type for type safety

const UV_TaskManagement: React.FC = () => {
  // Global state selectors
  const task_input_description = useAppStore((state) => state.task_input_description);
  const tasks_list = useAppStore((state) => state.tasks_list);
  const is_loading_tasks = useAppStore((state) => state.is_loading_tasks);
  const error_message = useAppStore((state) => state.error_message);
  const app_status = useAppStore((state) => state.app_status); // For app health status

  // Global actions
  const set_task_input_description = useAppStore((state) => state.set_task_input_description);
  const add_new_task = useAppStore((state) => state.add_new_task);
  const toggle_task_completion = useAppStore((state) => state.toggle_task_completion);
  const delete_task = useAppStore((state) => state.delete_task);

  // Ref for the input field to manage focus
  const inputRef = useRef<HTMLInputElement>(null);
  // Local state for shake animation
  const [shakeInput, setShakeInput] = React.useState(false);

  // Effect to manage input field focus after adding a task
  useEffect(() => {
    if (!error_message && inputRef.current) {
      // Retain focus on the input field after successful addition (FR-1.04)
      inputRef.current.focus();
    }
  }, [tasks_list, error_message]); // Depend on tasks_list to trigger when a task is added, or error_message to clear

  // Effect to trigger shake animation on error and clear it
  useEffect(() => {
    if (error_message) {
      setShakeInput(true);
      // Remove shake class after animation duration
      const timer = setTimeout(() => {
        setShakeInput(false);
      }, 300); // FR-1.04: ~0.3s duration
      return () => clearTimeout(timer);
    }
  }, [error_message]); // Trigger when error_message changes

  // Handler for adding a new task
  const handle_add_task = useCallback(() => {
    // add_new_task returns boolean indicating success/failure
    const success = add_new_task();
    if (!success) {
      // Error message will be set by the store if validation fails
      // Shake animation effect is handled by useEffect
    } else {
      // Successfully added, focus is retained by useEffect based on tasks_list change
    }
  }, [add_new_task]);

  // Handle Enter keypress in the input field (FR-1.03)
  const handle_keydown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default form submission or other default behavior
      handle_add_task();
    }
  }, [handle_add_task]);

  // Conditional Rendering based on app status or loading
  if (app_status === 'error' || app_status === 'local_storage_unavailable') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-red-500">
        <p className="text-xl font-bold mb-4">Application Error</p>
        <p className="text-center">{error_message || "An unexpected error occurred. Please try again or clear your browser's local storage."}</p>
        <p className="text-sm mt-2">If this persists, local storage might be unavailable or corrupted.</p>
      </div>
    );
  }

  // Loading state (conceptual, as localStorage is fast)
  if (is_loading_tasks) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
        <p className="ml-4 text-lg">Loading tasks...</p>
      </div>
    );
  }

  return (
    <> {/* FR-4.03: Clean and Minimalist Layout - Main content wrapper */}
      <div className="flex flex-col items-center p-4 w-full max-w-md mx-auto">
        {/* Task Input Section */}
        <div className="w-full flex items-center mb-6">
          <input
            ref={inputRef}
            type="text"
            className={`flex-grow p-3 border rounded-l-lg outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400
              ${shakeInput ? 'animate-shake border-red-500' : 'border-gray-300 dark:border-gray-600'}
              ${error_message ? 'border-red-500' : ''}
            `}
            placeholder="What needs to be done?" // FR-1.01
            value={task_input_description}
            onChange={(e) => set_task_input_description(e.target.value)}
            onKeyDown={handle_keydown} // FR-1.03
            maxLength={256} // FR-1.01
            aria-label="New task description"
          />
          <button
            onClick={handle_add_task}
            className="p-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap" // FR-1.02
            aria-label="Add Task"
          >
            Add Task
          </button>
        </div>

        {/* Dynamic error message for input validation */}
        {error_message && (
          <p className="text-red-500 text-sm mb-4 transition-opacity duration-300 ease-in-out opacity-100 italic" role="alert">
            {error_message}
          </p>
        )}

        {/* Task List Display Section - FR-2.01 */}
        <div className="w-full">
          {tasks_list.length === 0 ? (
            // FR-2.02: Empty Task List Message
            <p className="text-center text-gray-500 dark:text-gray-400 italic text-lg mt-8">
              Your to-do list is empty. Time to get productive!
            </p>
          ) : (
            <ul className="space-y-3">
              {tasks_list.map((task: Task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200"
                >
                  {/* Task Completion Toggle - FR-2.04 */}
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                    checked={task.completed}
                    onChange={() => toggle_task_completion(task.id)}
                    aria-label={`Mark task "${task.description}" as ${task.completed ? 'incomplete' : 'complete'}`}
                  />
                  {/* Task Description and Visual Status - FR-2.05 */}
                  <span
                    className={`flex-grow mx-3 text-lg transition-colors duration-200
                      ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}
                    `}
                    aria-live="polite"
                  >
                    {task.description}
                  </span>
                  {/* Delete Task Element - FR-2.06 */}
                  <button
                    onClick={() => delete_task(task.id)}
                    className="p-1 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full"
                    aria-label={`Delete task "${task.description}"`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_TaskManagement;