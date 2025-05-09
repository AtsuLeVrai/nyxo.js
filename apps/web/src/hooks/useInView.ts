import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

export interface UseInViewOptions {
  /** Threshold value between 0 and 1 indicating percentage visible */
  threshold?: number;
  /** Root margin similar to CSS margin */
  rootMargin?: string;
  /** Whether to trigger only once */
  triggerOnce?: boolean;
}

/**
 * Hook that tracks when an element enters the viewport
 */
export function useInView(options: UseInViewOptions = {}): {
  ref: RefObject<HTMLElement>;
  isInView: boolean;
  hasBeenInView: boolean;
} {
  const [isInView, setIsInView] = useState<boolean>(false);
  const [hasBeenInView, setHasBeenInView] = useState<boolean>(false);
  const ref = useRef<HTMLElement>(null);

  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          setIsInView(true);
          setHasBeenInView(true);

          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: ref as RefObject<HTMLElement>, isInView, hasBeenInView };
}
