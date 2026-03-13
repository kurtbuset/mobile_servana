/**
 * Socket Context - Simplified
 * Main export for socket functionality
 */

// Context and Provider
export { SocketProvider, SocketContext } from "./SocketProvider";
export { useSocket } from "./useSocket";

// Socket functions
export * from "./chat";
export * from "./typing";
export * from "./connection";
export { createSocket, clearSocket } from "./config";
