import React from 'react';

/**
 * Props for the GV_AppContainer component.
 * @interface GV_AppContainerProps
 * @property {React.ReactNode} children - The content to be rendered inside the container.
 */
interface GV_AppContainerProps {
  children: React.ReactNode;
}

/**
 * GV_AppContainer component.
 * This global container acts as the primary wrapper for all unique view content within the application.
 * It dictates the main layout structure, overall aesthetics, and handles basic desktop responsiveness
 * by centering and constraining the maximum width of the content.
 *
 * @param {GV_AppContainerProps} { children } - The props for the component, primarily its children.
 * @returns {JSX.Element} The rendered application content container.
 */
const GV_AppContainer: React.FC<GV_AppContainerProps> = ({ children }) => {
  return (
    <>
      <main className="flex-grow container mx-auto px-4 py-8 max-w-lg">
        {/*
          flex-grow: allows the container to take up available vertical space
          container: applies a fixed width at each breakpoint (default Tailwind behavior)
          mx-auto: centers the container horizontally
          px-4 py-8: adds padding on the sides and vertical spacing
          max-w-lg: constrains the content to a maximum width for readability on larger screens,
                    implementing FR-4.03 (Clean Layout) and FR-4.04 (Basic Responsiveness)
        */}
        {children}
      </main>
    </>
  );
};

export default GV_AppContainer;