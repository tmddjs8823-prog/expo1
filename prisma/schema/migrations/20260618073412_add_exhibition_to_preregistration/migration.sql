-- AlterTable
ALTER TABLE "Exhibition" ADD COLUMN     "linkUrl" TEXT;

-- AlterTable
ALTER TABLE "PreRegistration" ADD COLUMN     "exhibitionId" INTEGER;

-- AddForeignKey
ALTER TABLE "PreRegistration" ADD CONSTRAINT "PreRegistration_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
