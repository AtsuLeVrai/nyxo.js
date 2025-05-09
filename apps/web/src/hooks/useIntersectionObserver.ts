import { type RefObject, useEffect, useRef, useState } from "react";

export interface IntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  unobserveOnEntry?: boolean;
}

/**
 * Custom hook for detecting when an element enters the viewport using IntersectionObserver
 *
 * @param options - IntersectionObserver options with additional control parameters
 * @returns - Object containing ref, isIntersecting, entry, and observer instance
 */
export function useIntersectionObserver<
  T extends HTMLElement = HTMLDivElement,
>({
  threshold = 0,
  root = null,
  rootMargin = "0px",
  freezeOnceVisible = false,
  unobserveOnEntry = false,
}: IntersectionOptions = {}): {
  ref: RefObject<T>;
  isIntersecting: boolean;
  hasIntersected: boolean;
  entry: IntersectionObserverEntry | null;
  observer: IntersectionObserver | null;
} {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
  const [hasIntersected, setHasIntersected] = useState<boolean>(false);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);

  const ref = useRef<T>(null);
  const frozen = freezeOnceVisible && isIntersecting;

  useEffect(() => {
    // Don't observe if frozen or no element to observe
    if (frozen || !ref.current) return;

    // Create the observer
    const observerInstance = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);

        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting) {
          setHasIntersected(true);

          // Unobserve if requested after first intersection
          if (unobserveOnEntry && ref.current) {
            observerInstance.unobserve(ref.current);
          }
        }
      },
      { threshold, root, rootMargin },
    );

    setObserver(observerInstance);

    if (ref.current) {
      observerInstance.observe(ref.current);
    }

    return () => {
      observerInstance.disconnect();
    };
  }, [threshold, root, rootMargin, frozen, unobserveOnEntry]);

  return {
    ref: ref as RefObject<T>,
    isIntersecting,
    hasIntersected,
    entry,
    observer,
  };
}

/**
 * Enhanced version of useIntersectionObserver with animation control features
 *
 * @param options - IntersectionObserver options and animation options
 * @returns - Object containing ref, animation state flags and intersection data
 */
export function useAnimateOnScroll<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  root = null,
  rootMargin = "-50px",
  freezeOnceVisible = true,
  delay = 0,
  staggerChildren = false,
  childrenDelay = 0.1,
  unobserveOnEntry = true,
}: IntersectionOptions & {
  delay?: number;
  staggerChildren?: boolean;
  childrenDelay?: number;
} = {}): {
  ref: RefObject<T>;
  isInView: boolean;
  hasBeenInView: boolean;
  animationVariants: {
    hidden: { opacity: number; y: number };
    visible: {
      opacity: number;
      y: number;
      transition: {
        duration: number;
        delay: number;
        staggerChildren?: number;
        delayChildren?: number;
      };
    };
  };
} {
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver<T>({
    threshold,
    root,
    rootMargin,
    freezeOnceVisible,
    unobserveOnEntry,
  });

  // Animation variants for Framer Motion
  const animationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ...(staggerChildren && {
          staggerChildren: childrenDelay,
          delayChildren: delay,
        }),
      },
    },
  };

  return {
    ref,
    isInView: isIntersecting || hasIntersected,
    hasBeenInView: hasIntersected,
    animationVariants,
  };
}

/**
 * Hook for creating parallax scroll effects
 *
 * @param options - Configuration options for parallax effect
 * @returns - Object containing ref and transform style for parallax
 */
export function useParallaxEffect<T extends HTMLElement = HTMLDivElement>({
  speed = 0.5,
  direction = "up",
  overflow = "hidden",
}: {
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  overflow?: string;
} = {}): {
  ref: RefObject<T>;
  style: React.CSSProperties;
} {
  const ref = useRef<T>(null);
  const [scrollY, setScrollY] = useState<number>(0);
  const [elementTop, setElementTop] = useState<number>(0);
  const [elementHeight, setElementHeight] = useState<number>(0);
  const [windowHeight, setWindowHeight] = useState<number>(0);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrollY(window.scrollY);
    };

    const handleResize = (): void => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setElementTop(rect.top + window.scrollY);
        setElementHeight(rect.height);
        setWindowHeight(window.innerHeight);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Initial measurement
    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Calculate parallax offset
  const calculateOffset = (): number => {
    // If element is not yet measured, return 0
    if (!elementHeight || !windowHeight) return 0;

    // Calculate how far the element is from the viewport top
    const relativeTop = elementTop - scrollY;

    // Calculate percentage through the viewport (-1 to 1 range)
    // -1: element is at the top of viewport
    // 0: element is centered in viewport
    // 1: element is at bottom of viewport
    const viewportProgress =
      (relativeTop - windowHeight / 2 + elementHeight / 2) /
      (windowHeight + elementHeight);

    // Apply speed factor
    return viewportProgress * speed * 100;
  };

  // Get transform based on direction
  const getTransformStyle = (): string => {
    const offset = calculateOffset();

    switch (direction) {
      case "up":
        return `translateY(${-offset}px)`;
      case "down":
        return `translateY(${offset}px)`;
      case "left":
        return `translateX(${-offset}px)`;
      case "right":
        return `translateX(${offset}px)`;
      default:
        return `translateY(${-offset}px)`;
    }
  };

  return {
    ref: ref as RefObject<T>,
    style: {
      transform: getTransformStyle(),
      overflow,
      willChange: "transform",
    },
  };
}
