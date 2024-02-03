-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "tsimsUsername" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" INTEGER NOT NULL,
    "name" JSONB NOT NULL,
    "foundedYear" INTEGER,
    "presidentByTsimsStudentId" INTEGER NOT NULL,
    "vicesByTsimsStudentId" INTEGER[],
    "membersByTsimsStudentId" INTEGER[],
    "description" JSONB NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_tsimsUsername_key" ON "User"("tsimsUsername");
