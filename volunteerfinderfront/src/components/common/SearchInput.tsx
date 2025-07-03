import { useEffect, useState, type ChangeEvent, useRef, useCallback } from 'react';
import { api, type Event } from '@/lib/api'; // Assuming these are your imports
import useDebounce from '@/lib/useDebounce'; // Assuming you have this custom hook

interface Props {
  value: string;
  onChange: (value: string) => void;
  onEventsFound: (events: Event[]) => void;
  className?: string;
}

const SearchInput = ({ value, onChange, onEventsFound, className = '' }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // This hook delays updating the 'debouncedValue' until the user stops typing for 300ms.
  const debouncedValue = useDebounce(value, 300); 

  // This helps prevent sending redundant API requests for the same term.
  const lastSearchedTerm = useRef<string | null>(null);

  const executeSearch = useCallback(async (searchTerm: string) => {
    const trimmedTerm = searchTerm.trim();

    // Exit if:
    // 1. A search is already in progress.
    // 2. The search term is empty.
    // 3. We just searched for this exact same term.
    if (isLoading || !trimmedTerm || lastSearchedTerm.current === trimmedTerm) {
      if (!trimmedTerm) {
        onEventsFound([]);
        lastSearchedTerm.current = null;
      }
      return;
    }

    setIsLoading(true);
    lastSearchedTerm.current = trimmedTerm; // Mark this term as being searched

    try {
      const data = await api.searchEvents(trimmedTerm);
      onEventsFound(data || []);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
      onEventsFound([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, onEventsFound]);

  /**
   * This effect triggers the search automatically when the user stops typing.
   */
  useEffect(() => {
    // We check debouncedValue here. If it's an empty string after debouncing,
    // it means the user cleared the input, and we should clear the results.
    if (debouncedValue.trim() === '') {
      onEventsFound([]);
      lastSearchedTerm.current = null;
    } else {
      executeSearch(debouncedValue);
    }
    // The effect should only re-run when the debounced search term changes.
    // 'executeSearch' is memoized with useCallback, so it's a stable dependency.
  }, [debouncedValue, executeSearch, onEventsFound]);

  /**
   * Handles immediate search on button click or Enter key press.
   */
  const handleManualSearch = () => {
    // We don't need to debounce here, just execute with the current value.
    executeSearch(value);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleManualSearch();
          }
        }}
        placeholder="Search volunteer events…"
        aria-label="Search volunteer events"
        className="input-primary w-full max-w-lg h-10 pr-12"
        disabled={isLoading}
      />
      <button
        onClick={handleManualSearch}
        disabled={isLoading}
        aria-label="Submit search"
        className={`absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-600 rounded-r-md
                    hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {/* Search Icon SVG */}
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 7.65a7.5 7.5 0 010 10.6z" />
        </svg>
      </button>
    </div>
  );
};

export default SearchInput;
