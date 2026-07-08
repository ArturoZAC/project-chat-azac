-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "is_system" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "channel_invitations" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "channel_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "channel_invitations_token_key" ON "channel_invitations"("token");

-- CreateIndex
CREATE INDEX "channel_invitations_token_idx" ON "channel_invitations"("token");

-- CreateIndex
CREATE INDEX "channel_invitations_channel_id_idx" ON "channel_invitations"("channel_id");

-- AddForeignKey
ALTER TABLE "channel_invitations" ADD CONSTRAINT "channel_invitations_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_invitations" ADD CONSTRAINT "channel_invitations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
