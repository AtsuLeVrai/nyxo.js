/**
 * Hook for tracking window size changes
 *
 * @returns Object containing window dimensions and breakpoint information
 */
import { useEffect, useState } from "react";

export function useWindowSize(): {
  width: number;
  height: number;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} {
  // Initialize with reasonable defaults
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize(): void {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  // Calculate breakpoint booleans
  const { width } = windowSize;
  const isXs = width < 640;
  const isSm = width >= 640 && width < 768;
  const isMd = width >= 768 && width < 1024;
  const isLg = width >= 1024 && width < 1280;
  const isXl = width >= 1280 && width < 1536;
  const is2xl = width >= 1536;

  // Generalized device categories
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    ...windowSize,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2xl,
    isMobile,
    isTablet,
    isDesktop,
  };
}

/**
 * Hook for showing a confirmation dialog before leaving a page with unsaved changes
 *
 * @param unsavedChanges - Boolean indicating whether there are unsaved changes
 * @param message - Message to show in the confirmation dialog
 */
export function useUnsavedChangesWarning(
  unsavedChanges: boolean,
  message = "You have unsaved changes. Are you sure you want to leave this page?",
): void {
  useEffect(() => {
    // Handler for beforeunload event
    const handleBeforeUnload = (e: BeforeUnloadEvent): string | undefined => {
      if (!unsavedChanges) return undefined;

      // Display browser's default confirmation message
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    // Add beforeunload event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [unsavedChanges, message]);
}

/**
 * Hook for managing a single local storage value with type safety
 *
 * @param key - The key to store the value under in localStorage
 * @param initialValue - The initial value to use if none exists in localStorage
 * @returns A tuple of [storedValue, setValue] to get and set the value
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    // Browser compatibility check
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)): void => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to the stored value in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue) as T);
      }
    };

    // Add event listener for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Remove event listener on cleanup
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

export * from "./useIntersectionObserver";
export * from "./useScrollSpy";
