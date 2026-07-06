require('dotenv/config');
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Program: location 제거, exhibitionId 추가
    await pool.query(`
      ALTER TABLE "Program" DROP COLUMN IF EXISTS "location";
      ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "exhibitionId" INTEGER;
      ALTER TABLE "Program" ADD CONSTRAINT IF NOT EXISTS "Program_exhibitionId_fkey"
        FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE RESTRICT;
    `);
    console.log('Program 테이블 수정 완료 (location→exhibitionId)');

    // 결과 확인
    const { rows } = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Program' ORDER BY ordinal_position;
    `);
    console.log('Program 컬럼:', rows.map(r => r.column_name));
  } catch (err) {
    // IF NOT EXISTS 미지원 시 대안
    console.log('FK 추가 시도 중 에러 (이미 존재할 수 있음):', err.message);
    try {
      await pool.query(`
        ALTER TABLE "Program" DROP COLUMN IF EXISTS "location";
        ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "exhibitionId" INTEGER;
      `);
      // FK가 이미 있는지 확인
      const { rows: fks } = await pool.query(`
        SELECT constraint_name FROM information_schema.table_constraints
        WHERE table_name = 'Program' AND constraint_type = 'FOREIGN KEY';
      `);
      if (!fks.find(f => f.constraint_name === 'Program_exhibitionId_fkey')) {
        await pool.query(`
          ALTER TABLE "Program" ADD CONSTRAINT "Program_exhibitionId_fkey"
            FOREIGN KEY ("exhibitionId") REFERENCES "Exhibition"("id") ON DELETE RESTRICT;
        `);
      }
      console.log('Program 테이블 수정 완료 (fallback)');
    } catch (err2) {
      console.error('수정 실패:', err2.message);
    }
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
