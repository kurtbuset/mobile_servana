// Central export for messaging feature module
export { useMessages } from './hooks/useMessages';
export { useSendMessage } from './hooks/useSendMessage';
export { useMessageSocket } from './hooks/useMessageSocket';

export { MessageBubble } from './components/MessageBubble';
export { MessageInput } from './components/MessageInput';
export { TypingIndicator } from './components/TypingIndicator';
export { MessageList } from './components/MessageList';
export { DateSeparator } from './components/DateSeparator';

export * from './utils/messageHelpers';
