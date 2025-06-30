import React from 'react';

/**
 * GV_AppHeaderProps interface defines the props for the GV_AppHeader component.
 * Currently, no specific props are required for this purely presentational component.
 */
interface GV_AppHeaderProps {}

/**
 * GV_AppHeader is a shared global UI component that provides a persistent header
 * section at the very top of the application's user interface.
 * Its primary function is branding and providing a consistent visual identity
 * for NexTask with a static application title.
 *
 * This component is purely presentational and does not manage its own state,
 * nor does it interact with any global state or make API calls.
 */
const GV_AppHeader: React.FC<GV_AppHeaderProps> = () => {
  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg 
                   flex items-center justify-center min-h-[64px] transition-all duration-300 ease-in-out">
        <h1 className="text-3xl font-extrabold tracking-tight">
          NexTask - To-Do List
        </h1>
      </header>
    </>
  );
};

export default GV_AppHeader;