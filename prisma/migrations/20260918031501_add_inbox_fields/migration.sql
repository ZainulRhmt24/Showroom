-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "assignedToUserId" TEXT,
ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "lastMessagePreview" TEXT,
ADD COLUMN     "unreadCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "failedReason" TEXT,
ADD COLUMN     "sentByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_showroomId_lastMessageAt_idx" ON "Conversation"("showroomId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_showroomId_status_idx" ON "Conversation"("showroomId", "status");

-- CreateIndex
CREATE INDEX "Conversation_showroomId_assignedToUserId_idx" ON "Conversation"("showroomId", "assignedToUserId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
