import { exec } from 'child_process';
import path from 'path';
import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { startJobAlertCron } from './utils/jobAlertCron';

async function autoSeedIfEmpty() {
  try {
    const count = await prisma.user.count();
    if (count > 0) return;
    console.log('🌱 Empty DB detected — auto-seeding...');
    await new Promise<void>((resolve, reject) =>
      exec(
        'npx prisma db seed',
        { cwd: path.resolve(__dirname, '../'), env: process.env },
        (err) => (err ? reject(err) : resolve()),
      )
    );
    console.log('✅ Auto-seed complete');
  } catch (e) {
    console.error('⚠️  Auto-seed failed (server still running):', (e as Error).message);
  }
}

app.listen(Number(env.PORT), '0.0.0.0', () => {
  console.log(`Backend running on http://localhost:${env.PORT}`);
  autoSeedIfEmpty();
  startJobAlertCron();
});
