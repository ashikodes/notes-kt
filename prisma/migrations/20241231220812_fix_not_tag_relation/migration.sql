/*
  Warnings:

  - You are about to drop the column `notes_id` on the `Tag` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `updated_at` on the `Notes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `name` on table `Tag` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "tag_notes_fk";

-- AlterTable
ALTER TABLE "Notes" DROP COLUMN "updated_at",
ADD COLUMN     "updated_at" DATE NOT NULL,
ALTER COLUMN "archived" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "notes_id",
ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "_NotesToTag" (
    "A" VARCHAR NOT NULL,
    "B" VARCHAR NOT NULL,

    CONSTRAINT "_NotesToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_NotesToTag_B_index" ON "_NotesToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");

-- AddForeignKey
ALTER TABLE "_NotesToTag" ADD CONSTRAINT "_NotesToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Notes"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NotesToTag" ADD CONSTRAINT "_NotesToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
