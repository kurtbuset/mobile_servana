import { useDispatch, useSelector } from 'react-redux';

/**
 * Typed hooks for Redux
 * Use these instead of plain useDispatch and useSelector
 */

// Export typed dispatch hook
export const useAppDispatch = () => useDispatch();

// Export typed selector hook
export const useAppSelector = useSelector;

export default {
  useAppDispatch,
  useAppSelector,
};
