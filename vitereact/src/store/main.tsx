import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Type Definitions ---

/**
 * Represents a single task item in the to-do list.
 */
export interface Task {
  id: string;
  description: string;
  completed: boolean;
}

/**
 * Defines the shape of the global application state variables.
 */
export interface AppState {
  app_status: 'initialized' | 'local_storage_unavailable' | 'error';
  has_persisted_data: boolean;
  task_input_description: string; // The text currently in the task input field
  tasks_list: Task[]; // The main list of tasks
  is_loading_tasks: boolean; // Flag for initial loading from localStorage
  error_message?: string; // Optional message for input validation errors
}

/**
 * Defines the actions (methods) that can be performed on the global state.
 */
export interface AppActions {
  set_task_input_description: (description: string) => void;
  load_tasks_from_local_storage: () => void;
  add_new_task: () => boolean; // Returns true if task added, false if validation failed
  toggle_task_completion: (task_id: string) => void;
  delete_task: (task_id: string) => void;
  clear_error_message: () => void;
}

/**
 * Combines the state and actions to define the entire structure of the app store.
 */
export type AppStore = AppState & AppActions;

// --- Zustand Store Implementation ---

const LOCAL_STORAGE_KEY = 'nex_task_tasks';
const TASK_DESCRIPTION_MAX_LENGTH = 256; // As per PRD (FR-1.01)

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // --- State Initialization ---
      app_status: 'initialized',
      has_persisted_data: false,
      task_input_description: '',
      tasks_list: [],
      is_loading_tasks: true, // Set to true initially as we'll try to load from local storage
      error_message: undefined,

      // --- Actions Implementation ---

      /**
       * Sets the current value of the task input description.
       * @param description The string value from the input field.
       */
      set_task_input_description: (description: string) => {
        set({ task_input_description: description });
        // Clear error message if user starts typing after an error
        if (get().error_message) {
          get().clear_error_message();
        }
      },

      /**
       * Clears any active error message.
       */
      clear_error_message: () => {
        set({ error_message: undefined });
      },

      /**
       * Loads tasks from local storage. Called on application initialization or rehydration.
       */
      load_tasks_from_local_storage: () => {
        set({ is_loading_tasks: true }); // Ensure loading state is active
        try {
          const stored_tasks = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (stored_tasks) {
            const parsed_tasks: Task[] = JSON.parse(stored_tasks);
            if (Array.isArray(parsed_tasks)) {
              set({
                tasks_list: parsed_tasks,
                has_persisted_data: parsed_tasks.length > 0,
                app_status: 'initialized',
              });
            } else {
              console.error('LocalStorage data is not an array, resetting tasks.');
              set({ tasks_list: [], app_status: 'error', error_message: 'Corrupted data in local storage.' });
            }
          } else {
            set({ tasks_list: [], has_persisted_data: false });
          }
        } catch (error) {
          console.error('Failed to load or parse tasks from localStorage:', error);
          set({
            tasks_list: [],
            app_status: 'local_storage_unavailable',
            error_message: 'Failed to load data from browser storage. Data might be corrupted or storage is full.',
            has_persisted_data: false,
          });
        } finally {
          set({ is_loading_tasks: false });
        }
      },

      /**
       * Adds a new task to the list and persists the changes.
       * Performs basic validation on the task description.
       * @returns true if task was added successfully, false otherwise.
       */
      add_new_task: () => {
        const { task_input_description, tasks_list, clear_error_message } = get();
        const trimmed_description = task_input_description.trim();

        // Validate input (FR-1.04)
        if (!trimmed_description) {
          set({ error_message: 'Task cannot be empty.' });
          setTimeout(() => clear_error_message(), 3000); // Clear after 3 seconds
          return false;
        }
        if (trimmed_description.length > TASK_DESCRIPTION_MAX_LENGTH) {
          set({ error_message: `Task is too long (max ${TASK_DESCRIPTION_MAX_LENGTH} characters).` });
          setTimeout(() => clear_error_message(), 3000);
          return false;
        }

        const new_task: Task = {
          id: Date.now().toString(), // Simple unique ID (FR-3.01)
          description: trimmed_description,
          completed: false,
        };

        const updated_tasks = [...tasks_list, new_task];
        set({
          tasks_list: updated_tasks,
          task_input_description: '', // Clear input field after adding (FR-1.04)
          has_persisted_data: true,
        });

        // Persist immediately (FR-3.02)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated_tasks));
        return true;
      },

      /**
       * Toggles the completion status of a specific task and persists the changes.
       * @param task_id The ID of the task to toggle.
       */
      toggle_task_completion: (task_id: string) => {
        const { tasks_list } = get();
        const updated_tasks = tasks_list.map((task) =>
          task.id === task_id ? { ...task, completed: !task.completed } : task
        );
        set({ tasks_list: updated_tasks });

        // Persist immediately (FR-3.03)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated_tasks));
      },

      /**
       * Deletes a task from the list and persists the changes.
       * @param task_id The ID of the task to delete.
       */
      delete_task: (task_id: string) => {
        const { tasks_list } = get();
        const updated_tasks = tasks_list.filter((task) => task.id !== task_id);
        set({ tasks_list: updated_tasks, has_persisted_data: updated_tasks.length > 0 });

        // Persist immediately (FR-3.04)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated_tasks));
      },
    }),
    {
      name: 'nex_task_store', // unique name for the local storage item
      getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
      // Use 'onRehydrateStorage' to handle loading state more accurately during hydration
      onRehydrateStorage: (state) => {
        // This function is called before hydration starts.
        // `state` is the raw state coming from storage.
        if (state) {
          state.is_loading_tasks = true; // Set loading to true while rehydrating
        }
        return (storedState, error) => {
          // This function is called after hydration finishes (or fails).
          if (error) {
            console.error('An error occurred during rehydration:', error);
            // Fallback: load_tasks_from_local_storage handles parsing errors
            // but this catches deeper persist middleware errors.
            get().load_tasks_from_local_storage(); // Attempt a clean load
          } else {
            // Once rehydration is complete, set loading to false.
            set({ is_loading_tasks: false });
            // Ensure app_status is correct if it was set to error during initial loading sequence
            if (get().app_status === 'local_storage_unavailable' || get().app_status === 'error') {
               // Only reset if there's no problem detected. A specific explicit check here is beneficial.
               // Re-run the basic load to update status based on actual content
               get().load_tasks_from_local_storage();
            }
          }
        };
      },
      // Middleware state selector: Only persist `tasks_list`
      // Other state like `task_input_description`, `error_message`, `is_loading_tasks` are transient
      partialize: (state) => ({ tasks_list: state.tasks_list, has_persisted_data: state.has_persisted_data }),
    }
  )
);

// Initial load can be triggered here or within a root component.
// For a simple app, triggering on store creation via onRehydrateStorage and initial state is sufficient.
// If not using onRehydrateStorage for explicit load, then a useEffect in a root App component would call load_tasks_from_local_storage.
// However, the persist middleware handles the initial loading process implicitly, and `is_loading_tasks` will correctly reflect it.