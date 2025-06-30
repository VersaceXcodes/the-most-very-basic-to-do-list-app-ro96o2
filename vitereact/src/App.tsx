import React, { useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router, // Use BrowserRouter for cleaner URLs
  Route,
  Routes,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';

/*
	import views : unique views (UV_*) and shared global views (GV_*)
*/
import GV_AppHeader from '@/components/views/GV_AppHeader.tsx';
import GV_AppContainer from '@/components/views/GV_AppContainer.tsx';
import UV_TaskManagement from '@/components/views/UV_TaskManagement.tsx';

// Create a client for React Query
const queryClient = new QueryClient();

const App: React.FC = () => {
  // Access the load_tasks_from_local_storage action from the Zustand store
  const load_tasks = useAppStore((state) => state.load_tasks_from_local_storage);
  const is_loading_tasks = useAppStore((state) => state.is_loading_tasks);
  const app_status = useAppStore((state) => state.app_status); // Get app status

  useEffect(() => {
    // Only load tasks if they haven't been loaded or if there was a previous error
    // The `persist` middleware's `onRehydrateStorage` handles initial hydration,
    // but a manual call here can ensure consistency or re-attempt if necessary.
    // Given `is_loading_tasks` is part of our public store state, we can use it.
    if (is_loading_tasks || app_status !== 'initialized') {
        load_tasks();
    }
  }, [load_tasks, is_loading_tasks, app_status]); // Depend on load_tasks to re-run if it re-renders (unlikely for a store action)

  return (
    <Router> {/* Wrap the entire application with Router */}
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans antialiased">
          {/* Global Header persistent component */}
          <GV_AppHeader />

          {/* Main content area wrapped by GV_AppContainer */}
          <GV_AppContainer>
            <Routes>
              {/* The primary and only unique view of the application */}
              <Route path="/" element={<UV_TaskManagement />} />
            </Routes>
          </GV_AppContainer>

          {/* No explicit footer identified in the sitemap */}
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;