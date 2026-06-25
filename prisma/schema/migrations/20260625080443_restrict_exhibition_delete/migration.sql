-- DropForeignKey
ALTER TABLE "Banner" DROP CONSTRAINT "Banner_exhibitionId_fkey";

-- DropForeignKey
ALTER TABLE "Gallery" DROP CONSTRAINT "Gallery_exhibitionId_fkey";

-- DropForeignKey
ALTER TABLE "PreRegistration" DROP CONSTRAINT "PreRegistration_exhibitionId_fkey";

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreRegistration" ADD CONSTRAINT "PreRegistration_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
