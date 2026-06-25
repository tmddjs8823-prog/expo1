-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "exhibitionId" INTEGER;

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "exhibitionId" INTEGER;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
