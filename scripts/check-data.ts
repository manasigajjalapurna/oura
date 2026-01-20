import db from '../lib/db/schema';

console.log('\n📊 Database Status Check\n');

const sleepCount = db.prepare('SELECT COUNT(*) as count FROM oura_sleep').get() as any;
console.log(`Sleep records: ${sleepCount.count}`);

const activityCount = db.prepare('SELECT COUNT(*) as count FROM oura_activity').get() as any;
console.log(`Activity records: ${activityCount.count}`);

const workoutCount = db.prepare('SELECT COUNT(*) as count FROM oura_workouts').get() as any;
console.log(`Workout records: ${workoutCount.count}`);

const readinessCount = db.prepare('SELECT COUNT(*) as count FROM oura_readiness').get() as any;
console.log(`Readiness records: ${readinessCount.count}`);

console.log('\n📅 Recent Sleep Data:\n');
const recentSleep = db.prepare('SELECT day, total_sleep_duration, efficiency, average_heart_rate FROM oura_sleep ORDER BY day DESC LIMIT 5').all();
console.table(recentSleep);

console.log('\n💪 Recent Workouts:\n');
const recentWorkouts = db.prepare('SELECT day, activity, average_hr, calories FROM oura_workouts ORDER BY start_datetime DESC LIMIT 5').all();
console.table(recentWorkouts);

console.log('\n🔄 Sync Status:\n');
const syncStatus = db.prepare('SELECT * FROM sync_status').all();
console.table(syncStatus);
