import { useContext } from 'react';
import { SocketContext } from './SocketProvider';

/**
 * Custom hook to access socket context
 */
export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return context;
};

export default useSocket;
