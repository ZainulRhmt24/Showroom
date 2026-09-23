-- CreateIndex
CREATE INDEX "Expense_showroomId_date_idx" ON "Expense"("showroomId", "date");

-- CreateIndex
CREATE INDEX "Lead_showroomId_status_idx" ON "Lead"("showroomId", "status");

-- CreateIndex
CREATE INDEX "Lead_showroomId_assignedTo_idx" ON "Lead"("showroomId", "assignedTo");

-- CreateIndex
CREATE INDEX "Lead_showroomId_createdAt_idx" ON "Lead"("showroomId", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_showroomId_soldAt_idx" ON "Transaction"("showroomId", "soldAt");
