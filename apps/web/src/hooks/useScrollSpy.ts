import { type RefObject, useEffect, useState } from "react";

interface ScrollSpyOptions {
  /**
   * Margin around the root element, similar to IntersectionObserver's rootMargin
   */
  rootMargin?: string;

  /**
   * Threshold for when to consider an element visible
   */
  threshold?: number;

  /**
   * Additional offset to apply when determining active section
   */
  offset?: number;

  /**
   * Whether to run the scrollspy only once
   */
  once?: boolean;

  /**
   * Whether to update the active section on scroll
   * If false, it will only update when an element enters/exits the viewport
   */
  updateOnScroll?: boolean;
}

/**
 * Hook for tracking which section is currently in view based on scroll position
 *
 * @param sectionRefs Array of refs to the sections being tracked
 * @param options Configuration options
 * @returns Index of the currently active section
 */
export function useScrollSpy(
  sectionRefs: RefObject<HTMLElement>[],
  options: ScrollSpyOptions = {},
): number {
  const [activeSection, setActiveSection] = useState<number>(0);

  const {
    rootMargin = "-20% 0px -70% 0px",
    threshold = 0.1,
    offset = 0,
    once = false,
    updateOnScroll = true,
  } = options;

  useEffect(() => {
    if (!sectionRefs || sectionRefs.length === 0) return;

    // Intersection Observer callback
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find visible sections
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => {
          const target = entry.target as HTMLElement;
          const index = sectionRefs.findIndex((ref) => ref.current === target);
          return { index, top: target.getBoundingClientRect().top };
        })
        .sort((a, b) => a.top - b.top);

      if (visibleSections.length > 0) {
        setActiveSection(visibleSections[0].index);
      }
    };

    // Create and configure the observer
    const observer = new IntersectionObserver(observerCallback, {
      rootMargin,
      threshold,
    });

    // Observe all section refs
    for (const ref of sectionRefs) {
      if (ref.current) {
        observer.observe(ref.current);
      }
    }

    // Scroll handler for more precise tracking
    const handleScroll = () => {
      if (!updateOnScroll) return;

      // Find the section closest to the top of the viewport
      const viewportTop = window.scrollY + offset;

      // Get positions of all sections
      const sectionPositions = sectionRefs
        .map((ref, index) => {
          if (!ref.current) return { index, top: Number.POSITIVE_INFINITY };
          const rect = ref.current.getBoundingClientRect();
          const top = window.scrollY + rect.top;
          return { index, top };
        })
        .sort((a, b) => a.top - b.top);

      // Find the section that is currently at or past the top of the viewport
      for (let i = 0; i < sectionPositions.length; i++) {
        const current = sectionPositions[i];
        const next = sectionPositions[i + 1];

        if (current.top <= viewportTop && (!next || next.top > viewportTop)) {
          setActiveSection(current.index);
          break;
        }

        // If we're before the first section, choose the first
        if (i === 0 && current.top > viewportTop) {
          setActiveSection(current.index);
          break;
        }

        // If we're past the last section, choose the last
        if (i === sectionPositions.length - 1) {
          setActiveSection(current.index);
        }
      }
    };

    // Add scroll listener if needed
    if (updateOnScroll) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      // Run once on mount
      handleScroll();
    }

    // Cleanup
    return () => {
      observer.disconnect();
      if (updateOnScroll) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [sectionRefs, rootMargin, threshold, offset, updateOnScroll]);

  return activeSection;
}

/**
 * Hook for table of contents navigation that automatically highlights the current section
 *
 * @param headingSelector CSS selector for heading elements to track
 * @param options Configuration options
 * @returns Array of [activeId, headings] where headings is an array of heading elements info
 */
export function useTableOfContents(
  headingSelector = "h2, h3, h4",
  options: ScrollSpyOptions = {},
): [string, Array<{ id: string; text: string; level: number }>] {
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<
    Array<{ id: string; text: string; level: number }>
  >([]);

  useEffect(() => {
    // Find all headings matching the selector
    const elements = Array.from(document.querySelectorAll(headingSelector));

    // Extract relevant information from heading elements
    const headingElements = elements.map((element) => {
      const id = element.id;
      const text = element.textContent || "";
      const level = Number.parseInt(element.tagName.substring(1), 10); // Extract the heading level (2 for h2, etc.)

      return { id, text, level };
    });

    setHeadings(headingElements);

    // Create refs for each heading
    const refs = headingElements.map(() => ({ current: null }));

    // Populate refs with elements
    headingElements.forEach((heading, index) => {
      refs[index].current = document.getElementById(heading.id) as null;
    });

    // Create scroll spy
    const {
      rootMargin = "-20% 0px -70% 0px",
      threshold = 0.1,
      offset = 0,
      updateOnScroll = true,
    } = options;

    // Create observer for headings
    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find visible headings
      const visibleHeadings = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => {
          const id = entry.target.id;
          const top = entry.target.getBoundingClientRect().top;
          return { id, top };
        })
        .sort((a, b) => a.top - b.top);

      if (visibleHeadings.length > 0) {
        setActiveId(visibleHeadings[0].id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin,
      threshold,
    });

    // Observe all headings
    for (const heading of headingElements) {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    }

    // Scroll handler
    const handleScroll = () => {
      if (!updateOnScroll) return;

      const scrollPosition = window.scrollY + offset;

      // Find the heading that's currently visible
      for (let i = 0; i < headingElements.length; i++) {
        const current = document.getElementById(headingElements[i].id);
        const next = headingElements[i + 1]
          ? document.getElementById(headingElements[i + 1].id)
          : null;

        if (!current) continue;

        const currentTop = current.getBoundingClientRect().top + window.scrollY;
        const nextTop = next
          ? next.getBoundingClientRect().top + window.scrollY
          : Number.POSITIVE_INFINITY;

        if (scrollPosition >= currentTop && scrollPosition < nextTop) {
          setActiveId(headingElements[i].id);
          break;
        }
      }
    };

    // Add scroll listener if needed
    if (updateOnScroll) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      // Run once on mount
      handleScroll();
    }

    // Cleanup
    return () => {
      observer.disconnect();
      if (updateOnScroll) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [headingSelector, options]);

  return [activeId, headings];
}

/**
 * Hook for creating a smooth scrolling effect to element
 *
 * @param options Configuration options
 * @returns Function to scroll to an element by ID
 */
export function useSmoothScroll(
  options: {
    offset?: number;
    duration?: number;
    easing?: (t: number) => number;
  } = {},
): (elementId: string) => void {
  const {
    offset = 0,
    duration = 500,
    easing = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  } = options;

  return (elementId: string): void => {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) return;

    const targetPosition =
      targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    function animation(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easing(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  };
}
