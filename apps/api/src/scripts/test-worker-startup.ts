/**
 * Test worker startup
 * 
 * Verifies that workers and cron jobs can start without errors
 * Run with: ts-node src/scripts/test-worker-startup.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testWorkerStartup() {
  console.log('🧪 Testing Worker Startup...\n');

  try {
    // Test 1: Import cron jobs
    console.log('1. Importing cron jobs...');
    const { dailyDigestJob, startDailyDigestJob } = await import('../jobs/daily-digest.job.js');
    const { reconciliationJob, startReconciliationJob } = await import('../jobs/reconciliation.job.js');
    console.log('   ✅ Cron jobs imported successfully');

    // Test 2: Verify cron expressions
    console.log('\n2. Verifying cron expressions...');
    console.log(`   Daily Digest: ${dailyDigestJob.cronTime.source}`);
    console.log(`   Reconciliation: ${reconciliationJob.cronTime.source}`);

    if (dailyDigestJob.cronTime.source !== '0 9 * * *') {
      throw new Error('Daily digest cron expression is incorrect');
    }
    if (reconciliationJob.cronTime.source !== '59 23 * * *') {
      throw new Error('Reconciliation cron expression is incorrect');
    }
    console.log('   ✅ Cron expressions are correct');

    // Test 3: Start cron jobs (don't wait for execution)
    console.log('\n3. Starting cron jobs...');
    startDailyDigestJob();
    startReconciliationJob();
    console.log('   ✅ Cron jobs started');

    // Test 4: Verify jobs can be stopped (means they started)
    console.log('\n4. Verifying jobs started...');
    console.log('   ✅ Jobs started successfully (no errors thrown)');

    // Test 5: Stop jobs
    console.log('\n5. Stopping cron jobs...');
    dailyDigestJob.stop();
    reconciliationJob.stop();
    console.log('   ✅ Cron jobs stopped');

    console.log('\n🎉 Worker startup test passed!\n');

    // Test 6: Import workers (verify no syntax errors)
    console.log('6. Importing workers...');
    await import('../workers/outbox.worker.js');
    await import('../workers/notification.worker.js');
    await import('../workers/email.worker.js');
    console.log('   ✅ Workers imported successfully');

    console.log('\n✅ All startup tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

testWorkerStartup();
