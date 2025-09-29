import { useState, useEffect, useCallback } from 'react';

interface UseMediaQueryOptions {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

export const useMediaQuery = (
  query: string,
  options: UseMediaQueryOptions = {}
): boolean => {
  const { defaultValue = false, initializeWithValue = true } = options;

  const getMatches = useCallback(
    (query: string): boolean => {
      if (typeof window === 'undefined') return defaultValue;
      return window.matchMedia(query).matches;
    },
    [defaultValue]
  );

  const [matches, setMatches] = useState<boolean>(
    initializeWithValue ? getMatches(query) : defaultValue
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mediaQueryList: MediaQueryList;

    try {
      mediaQueryList = window.matchMedia(query);
    } catch {
      return;
    }

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQueryList.matches);

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
      return () => mediaQueryList.removeEventListener('change', listener);
    } else {
      mediaQueryList.addListener(listener);
      return () => mediaQueryList.removeListener(listener);
    }
  }, [query, getMatches]);

  return matches;
};
