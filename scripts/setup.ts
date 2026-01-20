import { initializeDatabase } from '../lib/db/schema';
import db from '../lib/db/schema';

console.log('Setting up Oura Health Dashboard...\n');

// Initialize database
initializeDatabase();

// Create default goal: "Lower running HR"
const existingGoal = db.prepare('SELECT * FROM goals WHERE id = 1').get();

if (!existingGoal) {
  console.log('Creating default goal: Lower Running HR');

  db.prepare(`
    INSERT INTO goals (title, description, goal_type, target_value, start_date, status)
    VALUES (?, ?, ?, ?, DATE('now'), 'active')
  `).run(
    'Lower Running Heart Rate',
    'Reduce average heart rate during runs to improve endurance and aerobic efficiency for marathon training',
    'lower_running_hr',
    'Reduce avg HR by 10 bpm over 12 weeks'
  );

  console.log('✓ Default goal created');
} else {
  console.log('✓ Default goal already exists');
}

console.log('\n✅ Setup complete!\n');
console.log('Next steps:');
console.log('1. Run: npm run dev');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Click "Sync Oura Data" to fetch your health data');
console.log('4. View your personalized health digest!\n');
