-- AlterTable
ALTER TABLE "Event" ADD COLUMN "soldCount" INTEGER;
ALTER TABLE "Event" ADD COLUMN "symplaUserId" TEXT;
ALTER TABLE "Event" ADD COLUMN "totalRevenue" REAL;

-- CreateTable
CREATE TABLE "EventArtistJoin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventArtistJoin_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventArtistJoin_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EventArtistJoin_eventId_artistId_key" ON "EventArtistJoin"("eventId", "artistId");
