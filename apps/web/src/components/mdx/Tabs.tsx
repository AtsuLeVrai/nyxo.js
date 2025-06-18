"use client";

import { createContext, useContext, useState } from "react";

/**
 * Context for managing tab state across tab components
 */
interface TabContextType {
  /** Currently active tab ID */
  activeTab: string;
  /** Function to set the active tab */
  setActiveTab: (tabId: string) => void;
}

const TabContext = createContext<TabContextType | null>(null);

/**
 * Hook to access tab context
 */
function useTabContext() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("Tab components must be used within a TabGroup");
  }
  return context;
}

/**
 * Props for the TabGroup component
 */
interface TabGroupProps {
  /** Content of the tab group (TabHeading and TabContent components) */
  children: React.ReactNode;
  /** ID of the initially active tab */
  defaultTab?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TabGroup component that provides context for managing tab state
 *
 * This is the main container for a set of tabs. It manages the active tab state
 * and provides context to child TabHeading, TabItem, and TabContent components.
 *
 * @param props - Component props
 * @returns Tab group container with context provider
 */
export function TabGroup({
  children,
  defaultTab = "tab-1",
  className = "",
}: TabGroupProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`my-6 ${className}`}>{children}</div>
    </TabContext.Provider>
  );
}

/**
 * Props for the TabHeading component
 */
interface TabHeadingProps {
  /** Tab items (TabItem components) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TabHeading component that contains the tab navigation buttons
 *
 * This component renders the horizontal list of tab buttons that users click
 * to switch between different tab content panels.
 *
 * @param props - Component props
 * @returns Styled tab navigation header
 */
export function TabHeading({ children, className = "" }: TabHeadingProps) {
  return (
    <div className={`border-dark-500 border-b ${className}`}>
      <nav className="flex space-x-1">{children}</nav>
    </div>
  );
}

/**
 * Props for the TabItem component
 */
interface TabItemProps {
  /** Unique identifier for this tab */
  id: string;
  /** Tab label text */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TabItem component representing a single tab button
 *
 * This component renders an individual tab button that users can click to
 * activate the corresponding tab content. It automatically handles active
 * state styling and accessibility attributes.
 *
 * @param props - Component props
 * @returns Interactive tab button
 */
export function TabItem({ id, children, className = "" }: TabItemProps) {
  const { activeTab, setActiveTab } = useTabContext();
  const isActive = activeTab === id;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`${id}-content`}
      onClick={() => setActiveTab(id)}
      className={`border-b-2 px-4 py-3 font-medium text-sm transition-all duration-200 ${
        isActive
          ? "border-primary-500 bg-primary-500/5 text-primary-400"
          : "border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-300"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Props for the TabContent component
 */
interface TabContentProps {
  /** Unique identifier matching the corresponding TabItem */
  id: string;
  /** Content to display when this tab is active */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TabContent component that displays content for a specific tab
 *
 * This component conditionally renders its content based on whether its
 * ID matches the currently active tab. It includes proper accessibility
 * attributes and smooth transitions.
 *
 * @param props - Component props
 * @returns Tab content panel (only visible when active)
 */
export function TabContent({ id, children, className = "" }: TabContentProps) {
  const { activeTab } = useTabContext();
  const isActive = activeTab === id;

  if (!isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`${id}-content`}
      aria-labelledby={id}
      className={`py-6 ${className}`}
    >
      {children}
    </div>
  );
}
