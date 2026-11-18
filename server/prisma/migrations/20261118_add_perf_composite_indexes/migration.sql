-- CreateIndex: Composite and status indexes for performance optimization (DB-009)

-- 1. classrooms: Status & scheduledEndTime scan optimization for expired room background sweep
CREATE INDEX `classrooms_status_scheduledEndTime_idx` ON `classrooms`(`status`, `scheduledEndTime`);

-- 2. writing_submissions: Status filter and user chronological history
CREATE INDEX `writing_submissions_status_idx` ON `writing_submissions`(`status`);
CREATE INDEX `writing_submissions_userId_submittedAt_idx` ON `writing_submissions`(`userId`, `submittedAt`);

-- 3. speaking_submissions: Status filter and user chronological history
CREATE INDEX `speaking_submissions_status_idx` ON `speaking_submissions`(`status`);
CREATE INDEX `speaking_submissions_userId_submittedAt_idx` ON `speaking_submissions`(`userId`, `submittedAt`);

-- 4. quiz_submissions: Passed checkpoint validation for unlocked curriculum
CREATE INDEX `quiz_submissions_userId_isPassed_idx` ON `quiz_submissions`(`userId`, `isPassed`);

-- 5. attendance_records: Chronological and status grouping
CREATE INDEX `attendance_records_createdAt_idx` ON `attendance_records`(`createdAt`);
CREATE INDEX `attendance_records_status_idx` ON `attendance_records`(`status`);

-- 6. messages: Realtime chat unread count and latest message lookup
CREATE INDEX `messages_conversationId_isRead_idx` ON `messages`(`conversationId`, `isRead`);
CREATE INDEX `messages_conversationId_createdAt_idx` ON `messages`(`conversationId`, `createdAt`);
