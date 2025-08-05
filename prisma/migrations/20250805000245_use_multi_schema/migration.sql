-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "prisma";

-- CreateTable
CREATE TABLE "prisma"."Notes" (
    "_id" VARCHAR NOT NULL,
    "user_id" VARCHAR,
    "title" VARCHAR,
    "image_url" VARCHAR,
    "content" VARCHAR,
    "archived" BOOLEAN,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "notes_pk" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "prisma"."Users" (
    "_id" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password_hash" VARCHAR,
    "otp_code" VARCHAR,
    "otp_expires" TIMESTAMP,
    "auth_type" VARCHAR,
    "username" VARCHAR,

    CONSTRAINT "users_pk" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "prisma"."Tag" (
    "_id" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "tag_pk" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "prisma"."Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device" VARCHAR,
    "user_id" VARCHAR NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prisma"."_NotesToTag" (
    "A" VARCHAR NOT NULL,
    "B" VARCHAR NOT NULL,

    CONSTRAINT "_NotesToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "prisma"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "prisma"."Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "prisma"."Session"("token");

-- CreateIndex
CREATE INDEX "_NotesToTag_B_index" ON "prisma"."_NotesToTag"("B");

-- AddForeignKey
ALTER TABLE "prisma"."Notes" ADD CONSTRAINT "notes_users_fk" FOREIGN KEY ("user_id") REFERENCES "prisma"."Users"("_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prisma"."Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "prisma"."Users"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisma"."_NotesToTag" ADD CONSTRAINT "_NotesToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "prisma"."Notes"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisma"."_NotesToTag" ADD CONSTRAINT "_NotesToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "prisma"."Tag"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
