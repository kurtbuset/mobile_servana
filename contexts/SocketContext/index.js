/**
 * Socket Context - Simplified
 * Main export for socket functionality
 */

// Context and Provider
export { SocketProvider, SocketContext } from "./SocketProvider";
export { useSocket } from "./useSocket";

// Socket emitters and event listeners
export * from "./emitters";
export { createSocket, clearSocket } from "./config";
