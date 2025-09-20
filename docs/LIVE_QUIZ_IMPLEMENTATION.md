# Live Quiz Sessions - Implementation Documentation

## Overview

The Live Quiz Sessions feature enables real-time, interactive quiz experiences where teachers can control the flow of questions and students participate simultaneously. This implementation follows the exact specification provided in issue #141.

## Architecture

### Database Schema

The system uses three main tables following the specification:

#### `quiz_sessions`
```sql
- id: uuid (primary key)
- org_id: uuid (organization reference)
- class_id: uuid (optional class reference)
- quiz_id: uuid (quiz reference)
- pin: text (6-character A-Z0-9 join code, auto-generated)
- status: enum ('LOBBY', 'ACTIVE', 'PAUSED', 'ENDED')
- current_index: int (current question index, 0-based)
- settings: jsonb (timePerQuestion, showAfterEach, autoAdvance)
- created_by: uuid (teacher reference)
- started_at: timestamptz
- ended_at: timestamptz
- created_at: timestamptz
```

#### `quiz_session_participants`
```sql
- session_id: uuid (session reference)
- user_id: uuid (user reference, primary key part)
- display_name: text (participant display name)
- role: enum ('teacher', 'student')
- joined_at: timestamptz
- last_seen_at: timestamptz
```

#### `quiz_answers`
```sql
- session_id: uuid (session reference)
- question_id: uuid (question reference)
- user_id: uuid (user reference)
- answer: text (option ID or free text)
- is_correct: boolean (auto-calculated)
- submitted_at: timestamptz
```

### API Endpoints

#### Core Session Management
- `POST /api/live-sessions` - Create new live session
- `POST /api/live-sessions/[id]/join` - Join session with display name
- `POST /api/live-sessions/[id]/start` - Start session (teacher only)
- `POST /api/live-sessions/[id]/next` - Advance to next question
- `POST /api/live-sessions/[id]/answer` - Submit student answer
- `GET /api/live-sessions/by-pin/[pin]` - Lookup session by PIN

#### Real-time Events
All real-time communication uses Supabase Realtime channels on `live:session:{sessionId}`:

**Events:**
- `session:start` - Session has begun
- `question:show` - New question is active
- `session:end` - Session has completed
- `participant_joined` - New participant joined
- `answer:submitted` - Answer was submitted

## User Flows

### Teacher Flow
1. **Create Session**: Navigate to quiz → Start Session → Select "Live (Realtid)"
2. **Share Access**: Display PIN/QR code for students to join
3. **Manage Lobby**: Monitor participant joining in real-time
4. **Control Session**: Start quiz when ready, advance through questions
5. **Monitor Progress**: View answer statistics and participant activity
6. **End Session**: Complete quiz and view final results

### Student Flow
1. **Join Session**: Visit `/live/join` and enter 6-character PIN
2. **Enter Details**: Provide display name for identification
3. **Wait in Lobby**: See session info and wait for teacher to start
4. **Answer Questions**: Respond to questions with timer pressure
5. **Real-time Feedback**: See answer confirmation and correctness
6. **View Results**: See final completion status

## Security & Privacy

### Row Level Security (RLS)
Comprehensive RLS policies ensure data isolation:

**Sessions**: 
- Teachers can only access sessions they created or org sessions they have permission for
- Students can only access sessions they're participants in

**Participants**: 
- Teachers see all participants in their sessions
- Students see only themselves

**Answers**: 
- Teachers can read all answers in their sessions
- Students can only read their own answers
- All submissions validated against session state

### GDPR Compliance
The system is designed to support both GDPR modes specified in the requirements:

**Korttidsläge (Short-term)**: 
- Anonymous participation supported (foundation laid)
- Data auto-deletion after session
- No long-term storage

**Långtidsläge (Long-term)**:
- Authenticated participants with consent
- Permanent storage for analytics
- Full data export capabilities

## Integration Points

### Existing Quiz System
The live quiz system integrates seamlessly with the existing quiz infrastructure:

- **SessionManager Component**: Enhanced to support live session creation
- **Quiz Types**: All existing question types (multiple-choice, free-text) supported
- **Question Processing**: Reuses existing quiz question structures
- **Answer Validation**: Automatic correctness checking using existing logic

### Real-time Infrastructure
Built on Supabase Realtime:

- **Channels**: One channel per session for isolated communication
- **Presence**: Track online participants
- **Broadcasting**: Push events to all session participants
- **Subscriptions**: Client-side listeners for reactive UI updates

## Performance Considerations

### Database Optimization
- **Indexes**: Strategic indexes on session_id, user_id, question_id for fast lookups
- **Partitioning**: Session data can be partitioned by date for large-scale deployments
- **Caching**: PIN lookups optimized with unique constraints

### Real-time Performance
- **Channel Isolation**: Each session uses dedicated channels
- **Message Filtering**: Client-side filtering reduces unnecessary updates
- **Connection Management**: Automatic cleanup of disconnected clients

### Frontend Optimization
- **Code Splitting**: Live quiz components loaded separately
- **State Management**: Minimal re-renders through optimized React hooks
- **Polling Fallback**: WebSocket failures gracefully degrade to polling

## Mobile Considerations

### Responsive Design
- **Touch Targets**: All interactive elements meet 44px minimum size
- **Viewport Optimization**: Questions display properly on small screens
- **Network Tolerance**: Handles poor connectivity gracefully

### PWA Integration
- **Offline Capability**: Basic offline support for already-loaded questions
- **App-like Experience**: Full-screen display on mobile devices
- **Installation**: Can be installed as PWA for native-like experience

## Testing Strategy

### Unit Tests
- API endpoint validation
- Database constraint testing
- RLS policy verification
- Answer correctness logic

### Integration Tests
- Real-time event flow
- Session state transitions
- Multi-participant scenarios
- Error handling and recovery

### E2E Tests
- Complete teacher-student workflow
- PIN-based joining process
- Real-time synchronization
- Cross-browser compatibility

## Monitoring & Analytics

### Session Metrics
- Participant count and engagement
- Question response times
- Session duration and completion rates
- Error rates and failure modes

### Performance Monitoring
- Real-time connection stability
- Database query performance
- API response times
- Client-side error tracking

## Future Enhancements

### Planned Features
- **Guest Mode**: Anonymous participation without authentication
- **Advanced Analytics**: Detailed performance insights
- **Question Pool**: Dynamic question selection
- **Multimedia Support**: Image/video questions
- **Breakout Rooms**: Small group sessions

### Scalability Improvements
- **Load Balancing**: Multiple server support
- **Database Sharding**: Horizontal scaling for large deployments
- **CDN Integration**: Global content delivery
- **Regional Deployment**: Reduced latency worldwide

## Troubleshooting

### Common Issues
1. **PIN Not Working**: Check session status and expiration
2. **Real-time Updates Missing**: Verify Supabase Realtime configuration
3. **Performance Issues**: Monitor database query performance
4. **Authentication Errors**: Verify user permissions and org membership

### Debug Tools
- Browser developer console for client-side errors
- Supabase dashboard for real-time connection monitoring
- Database logs for query performance analysis
- Network tab for API request debugging

## Deployment Checklist

### Database Setup
- [ ] Apply migration 014_quiz_live_sessions_v2.sql
- [ ] Verify RLS policies are active
- [ ] Test PIN generation function
- [ ] Validate answer correctness triggers

### Environment Configuration
- [ ] Supabase Realtime enabled
- [ ] CORS settings for live domains
- [ ] Rate limiting configured
- [ ] Monitoring tools connected

### Performance Validation
- [ ] Load test with multiple participants
- [ ] Verify real-time latency
- [ ] Test mobile device compatibility
- [ ] Validate offline capabilities

This implementation provides a robust, scalable foundation for live quiz sessions while maintaining security, performance, and user experience standards.