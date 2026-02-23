import { useState, useCallback } from 'react';

/**
 * Custom hook for infinite scroll pagination
 */
export const useInfiniteScroll = (fetchFn, options = {}) => {
  const { pageSize = 20, initialPage = 1 } = options;

  const [data, setData] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn({ page, pageSize });
      
      setData((prev) => [...prev, ...result.data]);
      setHasMore(result.data.length === pageSize);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to load more');
      console.error('useInfiniteScroll error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, pageSize, loading, hasMore]);

  const refresh = useCallback(async () => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    
    setLoading(true);
    try {
      const result = await fetchFn({ page: initialPage, pageSize });
      setData(result.data);
      setHasMore(result.data.length === pageSize);
      setPage(initialPage + 1);
    } catch (err) {
      setError(err.message || 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, initialPage, pageSize]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    refresh,
  };
};

export default useInfiniteScroll;
