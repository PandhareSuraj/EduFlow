import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Search-specific debounce hook with loading state
 * Useful for async search operations
 */
export function useDebouncedSearch<T>(
  searchFn: (term: string) => Promise<T[]> | T[],
  delay: number = 300
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!term || term.length < 2) {
      setResults([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchFn(term);
        setResults(data);
      } finally {
        setIsSearching(false);
      }
    }, delay);
  }, [searchFn, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { searchTerm, handleSearch, results, isSearching, setSearchTerm };
}
