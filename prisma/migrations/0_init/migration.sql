-- CreateTable
CREATE TABLE "Notes" (
    "_id" VARCHAR NOT NULL,
    "user_id" VARCHAR,
    "title" VARCHAR,
    "image_url" VARCHAR,
    "content" VARCHAR,
    "created_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" VARCHAR NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_pk" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Users" (
    "_id" VARCHAR NOT NULL,
    "email" VARCHAR,
    "password_hash" VARCHAR,
    "otp_code" VARCHAR,
    "auth_type" VARCHAR,
    "username" VARCHAR,

    CONSTRAINT "users_pk" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "_id" VARCHAR NOT NULL,
    "name" VARCHAR,
    "notes_id" VARCHAR,

    CONSTRAINT "tag_pk" PRIMARY KEY ("_id")
);

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "notes_users_fk" FOREIGN KEY ("user_id") REFERENCES "Users"("_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "tag_notes_fk" FOREIGN KEY ("notes_id") REFERENCES "Notes"("_id") ON DELETE CASCADE ON UPDATE NO ACTION;

