import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getStoreSettings } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { Search as SearchIcon, X } from 'lucide-react';

// Custom hook for debouncing search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [inputValue, setInputValue] = useState(queryParam);
  const debouncedSearch = useDebounce(inputValue, 400);

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: getStoreSettings });
  
  useEffect(() => {
    if (settings) {
      document.title = debouncedSearch ? `Results for "${debouncedSearch}" | ${settings.store_name}` : `Search | ${settings.store_name}`;
    }
  }, [debouncedSearch, settings]);
  
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'search', debouncedSearch],
    queryFn: () => getProducts(undefined, debouncedSearch),
    enabled: debouncedSearch.length > 0,
  });

  const products = data?.products;
  const totalCount = data?.count || 0;

  // Sync back to URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch) {
      setSearchParams({ q: debouncedSearch });
    } else {
      setSearchParams({});
    }
  }, [debouncedSearch, setSearchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative flex items-center w-full h-14 rounded-full shadow-sm bg-white border overflow-hidden focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-shadow">
          <div className="grid place-items-center h-full w-12 text-gray-400">
            <SearchIcon className="h-5 w-5" />
          </div>
          <input
            className="peer h-full w-full outline-none text-gray-700 pr-2 placeholder-gray-400"
            type="text"
            id="search"
            placeholder="Search products..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          {inputValue && (
            <button
              onClick={() => setInputValue('')}
              className="grid place-items-center h-full w-12 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {!debouncedSearch ? (
        <div className="text-center py-12">
          <SearchIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Search the store</h3>
          <p className="mt-1 text-sm text-gray-500">Type what you're looking for above.</p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-4 shadow-sm">
              <div className="bg-gray-200 aspect-square rounded-md mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">We couldn't find anything matching "{debouncedSearch}".</p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-medium mb-6">
            Found {totalCount} result{totalCount === 1 ? '' : 's'} for "{debouncedSearch}"
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map(product => (
              <ProductCard key={product.id} product={product} settings={settings} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
