-- CreateTable
CREATE TABLE "SymplaSync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lastSyncAt" DATETIME NOT NULL,
    "eventsCount" INTEGER NOT NULL DEFAULT 0,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "errorLog" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
