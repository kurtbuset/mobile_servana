import { useState, useCallback } from 'react';

/**
 * Custom hook for data mutations (POST, PUT, DELETE)
 */
export const useMutation = (mutateFn) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await mutateFn(...args);
        setData(result);
        return { success: true, data: result };
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || 'Mutation failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [mutateFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
};

export default useMutation;
