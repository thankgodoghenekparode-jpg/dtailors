const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();
  console.log('Connected to Supabase!');

  const sqlFile = fs.readFileSync(path.join(__dirname, 'new-tables.sql'), 'utf-8');

  const statements = sqlFile
    .split(';')
    .map(s => {
      return s.split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();
    })
    .filter(s => s.length > 0);

  let success = 0;
  let skipped = 0;
  let errors = 0;

  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
      success++;
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate') || e.message.includes('Duplicate') || e.message.includes('does not exist') || e.message.includes('Multiple FK')) {
        skipped++;
      } else {
        console.error('ERROR:', e.message.substring(0, 200));
        errors++;
      }
    }
  }

  console.log(`Done! ${success} applied, ${skipped} skipped, ${errors} errors`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
