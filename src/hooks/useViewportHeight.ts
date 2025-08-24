import { useState, useEffect } from 'react';

export const useViewportHeight = () => {
  const [viewportHeight, setViewportHeight] = useState(() => {
    // Use visualViewport if available for better mobile support
    if (typeof window !== 'undefined') {
      return window.visualViewport?.height || window.innerHeight;
    }
    return 0;
  });

  useEffect(() => {
    const updateViewportHeight = () => {
      // Use visualViewport if available (better for mobile keyboard detection)
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    // Listen for viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
      window.visualViewport.addEventListener('scroll', updateViewportHeight);
    } else {
      window.addEventListener('resize', updateViewportHeight);
    }

    // Listen for orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(updateViewportHeight, 100);
    });

    // Listen for focus events that might trigger keyboard
    window.addEventListener('focusin', () => {
      setTimeout(updateViewportHeight, 300); // Delay to allow keyboard to appear
    });

    window.addEventListener('focusout', () => {
      setTimeout(updateViewportHeight, 300); // Delay to allow keyboard to disappear
    });

    // Initial measurement
    updateViewportHeight();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
        window.visualViewport.removeEventListener('scroll', updateViewportHeight);
      } else {
        window.removeEventListener('resize', updateViewportHeight);
      }
      window.removeEventListener('orientationchange', updateViewportHeight);
      window.removeEventListener('focusin', updateViewportHeight);
      window.removeEventListener('focusout', updateViewportHeight);
    };
  }, []);

  return viewportHeight;
};
