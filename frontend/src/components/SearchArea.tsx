import { useCallback, useEffect, useState } from "react";
import { HiX } from "react-icons/hi";
import { useSearchParams } from "react-router-dom";
import { useDocuments } from "../hooks/documents/useDocuments";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function SearchArea() {
  const { documents, isFetching } = useDocuments();

  const [searchParams, setSearchParams] = useSearchParams();
  const [isSearching, setIsSearching] = useState(false);
  const initialSearch = searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(initialSearch);
  const debouncedSearchTerm = useDebounce(inputValue.trim(), 800);
  useEffect(() => {
    if (debouncedSearchTerm !== initialSearch) {
      if (debouncedSearchTerm) {
        setSearchParams({ search: debouncedSearchTerm });
      } else {
        setSearchParams({});
      }
      setIsSearching(false);
    }
  }, [debouncedSearchTerm, setSearchParams, initialSearch]);
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      setIsSearching(true);
    },
    []
  );
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const trimmedValue = inputValue.trim();
        if (trimmedValue) {
          setSearchParams({ search: trimmedValue });
        } else {
          setSearchParams({});
        }
        setIsSearching(false);
      }
    },
    [inputValue, setSearchParams]
  );

  const clearSearch = useCallback(() => {
    setInputValue("");
    setSearchParams({});
    setIsSearching(false);
  }, [setSearchParams]);
  return (
    <div className="card bg-base-100 shadow-xl rounded-2xl">
      <div className="card-body flex flex-col items-center md:flex-row md:items-start justify-between">
        <div className="w-[80%] flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="w-full input input-bordered flex items-center gap-2 focus-within:input-primary transition-colors">
              <svg
                className="w-4 h-4 opacity-70"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                className="grow"
                placeholder="Start typing to search..."
                value={inputValue}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
              />
              {(inputValue || isSearching) && (
                <button
                  onClick={clearSearch}
                  className="btn btn-ghost btn-sm btn-circle "
                  title="Clear search"
                >
                  {isSearching ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <HiX className="w-4 h-4" />
                  )}
                </button>
              )}
            </label>

            <div className="text-xs text-base-content/60 mt-1">
              Press Enter to search or wait for auto-search
            </div>
          </div>
        </div>

        {/* Status Filter Tabs and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="stats stats-horizontal shadow-sm bg-gradient-to-r from-base-200 to-base-300">
            <div className="stat py-2 px-10 text-center">
              <div className="stat-title text-xs">Showing</div>
              <div className="stat-value text-lg">
                {isFetching ? (
                  <span className="loading loading-infinity loading-lg "></span>
                ) : (
                  documents.length
                )}
              </div>
              <div className="stat-desc text-xs">documents</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchArea;
