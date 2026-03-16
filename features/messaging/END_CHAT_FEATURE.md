# End Chat Feature Documentation

## Overview
The End Chat feature provides a comprehensive chat termination experience for mobile clients, including feedback collection, rating system, and post-chat actions.

## Components

### 1. EndChatModal (`components/EndChatModal.jsx`)
A multi-step modal that guides users through the chat ending process:

**Steps:**
- **Confirm**: Shows chat statistics and asks for confirmation
- **Rating**: Allows users to rate their experience (1-5 stars)
- **Complete**: Shows success message and final rating

**Features:**
- Chat duration and message count display
- 5-star rating system
- Optional text feedback
- Loading states and error handling
- Smooth step transitions

### 2. PostChatScreen (`screens/messaging/PostChatScreen.jsx`)
A dedicated screen shown after chat completion:

**Features:**
- Chat session summary
- Rating display
- Action buttons (Start New Chat, View History, Dashboard)
- Help section
- Clean, professional design

### 3. useEndChat Hook (`hooks/useEndChat.js`)
Manages the end chat functionality:

**Features:**
- API integration for ending chats
- Loading state management
- Error handling with user-friendly messages
- Modal state management
- Callback support for navigation

### 4. Chat Statistics Utilities (`utils/chatStats.js`)
Helper functions for calculating chat metrics:

**Functions:**
- `calculateChatDuration()`: Formats duration from start time
- `getMessageStats()`: Counts messages by type
- `getChatStartTime()`: Gets first message timestamp
- `formatChatStats()`: Combines all statistics

## Backend Integration

### 1. Mobile Message Controller
New endpoint: `PATCH /messages/group/:id/end`
- Validates chat ownership
- Processes feedback data
- Updates chat status to "resolved"
- Stores feedback in database

### 2. Database Schema
New table: `chat_feedback`
```sql
- feedback_id (bigserial, primary key)
- chat_group_id (bigint, foreign key)
- client_id (bigint, foreign key)
- rating (integer, 1-5)
- feedback_text (text, optional)
- chat_duration_seconds (integer)
- message_count (integer)
- created_at (timestamp)
```

Enhanced `chat_group` table:
```sql
- resolved_at (timestamp)
- feedback_id (bigint, foreign key)
```

### 3. API Endpoints
- `PATCH /messages/group/{id}/end` - End chat with feedback
- Stores rating, feedback text, duration, and message count
- Returns success confirmation with feedback data

## Usage Flow

1. **User clicks "End Chat"** → `showEndChatConfirmation()`
2. **Confirmation modal appears** → Shows chat stats, asks for confirmation
3. **User confirms** → Modal transitions to rating step
4. **User rates experience** → Optional 1-5 star rating
5. **User submits** → `handleEndChat()` called with feedback data
6. **API call made** → Chat marked as resolved, feedback stored
7. **Success** → Navigate to PostChatScreen with chat data
8. **Post-chat actions** → User can start new chat, view history, or return to dashboard

## Error Handling

- **Network errors**: User-friendly error messages
- **Invalid chat group**: "Chat not found" message
- **Already resolved**: "Chat already ended" message
- **API failures**: Retry suggestions and fallback options

## Features

### ✅ Implemented
- Multi-step end chat modal
- 5-star rating system
- Chat duration calculation
- Message count tracking
- Feedback text collection
- Post-chat summary screen
- Backend API integration
- Database schema for feedback
- Error handling and loading states

### 🔄 Future Enhancements
- Chat history viewing
- Feedback analytics for admins
- Push notifications for chat end
- Export chat transcript
- Agent performance metrics
- Automated follow-up surveys

## Configuration

### Environment Variables
No additional environment variables required.

### Dependencies
- `react-native-vector-icons/Feather` for icons
- `@react-navigation/native` for navigation
- Existing API client and authentication

### Permissions
- Mobile clients can end their own chats
- No special permissions required
- Chat ownership validated server-side

## Testing

### Manual Testing
1. Start a chat session
2. Send some messages
3. Click "End Chat" button
4. Go through rating flow
5. Verify post-chat screen
6. Check database for feedback record

### API Testing
```bash
# End chat with feedback
curl -X PATCH http://localhost:3000/messages/group/123/end \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "feedback": "Great service!",
    "chatDuration": "5m 30s",
    "messageCount": 12
  }'
```

## Migration

To enable the feedback feature, run the database migration:

```bash
cd backend_servana
node scripts/run-migration.js 008_chat_feedback_schema.sql
```

This creates the `chat_feedback` table and adds required columns to `chat_group`.