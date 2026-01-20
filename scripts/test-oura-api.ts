import { config } from 'dotenv';
import { createOuraService } from '../lib/services/oura';

// Load environment variables
config({ path: '.env.local' });

async function testOuraAPI() {
  try {
    console.log('\n🔗 Testing Oura API Connection...\n');

    const ouraService = createOuraService();

    // Test 1: Get personal info
    console.log('1️⃣ Fetching personal info...');
    const personalInfo = await ouraService.getPersonalInfo();
    console.log('✅ Personal info retrieved:');
    console.log(`   Email: ${personalInfo.email || 'N/A'}`);
    console.log(`   Age: ${personalInfo.age || 'N/A'}`);
    console.log(`   Weight: ${personalInfo.weight || 'N/A'} kg`);
    console.log(`   Height: ${personalInfo.height || 'N/A'} cm`);

    // Test 2: Get recent sleep data
    console.log('\n2️⃣ Fetching last 7 days of sleep data...');
    const { startDate, endDate } = ouraService.getDateRange(7);
    const sleepData = await ouraService.getDailySleep(startDate, endDate);
    console.log(`✅ Retrieved ${sleepData.data?.length || 0} sleep records`);

    if (sleepData.data && sleepData.data.length > 0) {
      console.log('\n   Sample sleep record:');
      const sample = sleepData.data[0];
      console.log(`   Date: ${sample.day}`);
      console.log(`   Sleep duration: ${sample.total_sleep_duration ? (sample.total_sleep_duration / 3600).toFixed(1) : 'N/A'} hours`);
      console.log(`   Efficiency: ${sample.efficiency || 'N/A'}%`);
    }

    // Test 3: Get recent activity
    console.log('\n3️⃣ Fetching last 7 days of activity data...');
    const activityData = await ouraService.getDailyActivity(startDate, endDate);
    console.log(`✅ Retrieved ${activityData.data?.length || 0} activity records`);

    // Test 4: Get workouts
    console.log('\n4️⃣ Fetching last 7 days of workouts...');
    const workoutData = await ouraService.getWorkouts(startDate, endDate);
    console.log(`✅ Retrieved ${workoutData.data?.length || 0} workout records`);

    console.log('\n✨ Oura API connection successful!\n');

  } catch (error: any) {
    console.error('\n❌ Oura API Error:', error.message);
    console.error('\nFull error:', error);
  }
}

testOuraAPI();
