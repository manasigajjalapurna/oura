# Oura Health Dashboard

A minimalist personal health dashboard that integrates your Oura Ring data and uses AI to synthesize complex patterns across sleep, recovery, activity, and workouts.

## Features

- **AI-Powered Health Digests**: Morning, afternoon, and evening digests that synthesize your health data with actionable insights
- **Goal Tracking**: Track progress toward specific health goals (starting with "Lower Running HR")
- **Meal Logging**: Simple text-based meal tracking to correlate diet with health outcomes
- **Reflections & Notes**: Add qualitative context to your health data
- **Local-First**: All data stays on your device in a local SQLite database
- **Minimalist UI**: Clean, distraction-free interface focused on insights

## Tech Stack

- **Next.js 16** with TypeScript and App Router
- **SQLite** (better-sqlite3) for local data storage
- **Oura API** for fetching health data
- **Claude API** (Anthropic) for AI-powered insights
- **Tailwind CSS** for styling

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up the database**:
   ```bash
   npm run setup
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## First-Time Use

1. Click **"Sync Oura Data"** to fetch your last 60 days of health data
2. Wait for the sync to complete (this may take 30-60 seconds)
3. Your first morning/afternoon/evening digest will be automatically generated
4. Click **"Refresh Digest"** to regenerate with the latest data

## Usage

### Daily Digests

The app automatically determines whether to show a morning, afternoon, or evening digest based on the time of day:
- **Morning (before 12pm)**: Focus on sleep quality, readiness, and priorities for the day
- **Afternoon (12pm-6pm)**: Focus on activity progress and energy levels
- **Evening (after 6pm)**: Reflect on the full day and provide insights for tomorrow

Click **"Refresh Digest"** to regenerate the current digest with the latest data.

### Goal Tracking

Click **"Goal Progress"** to view detailed analysis of your active goals. For the "Lower Running HR" goal, you'll see:
- Total workouts since starting the goal
- Average heart rate trend
- Improvement percentage
- AI-generated insights and recommendations

### Meal Logging

1. Click **"Log Meal"**
2. Enter what you ate with a general portion estimate (e.g., "chicken salad with quinoa, large portion")
3. Click **"Save Meal"**

The AI will consider your recent meals when generating digests and making recommendations.

### Notes & Reflections

1. Click **"Add Note"**
2. Write qualitative observations (e.g., "Today's run felt harder than usual despite good sleep")
3. Click **"Save Note"**

These notes help the AI understand context that data alone can't capture.

### Syncing New Data

Click **"Sync Oura Data"** periodically (e.g., daily or weekly) to fetch the latest data from your Oura Ring. The app will fetch any new data since the last sync.

## Data Privacy

All your health data is stored locally in a SQLite database (`oura-health.db`) on your device. The only external API calls are:
- **Oura API**: To fetch your health data
- **Anthropic API**: To generate AI insights (your data is sent to Claude but not stored by Anthropic)

Your data never goes to any other third parties.

## Environment Variables

The app uses the following environment variables (already configured in `.env.local`):

```env
OURA_API_TOKEN=your_oura_token
ANTHROPIC_API_KEY=your_anthropic_key
INITIAL_SYNC_DAYS=60
MORNING_DIGEST_HOUR=6
AFTERNOON_DIGEST_HOUR=14
EVENING_DIGEST_HOUR=21
```

## Project Structure

```
/app
  /api
    /digest       - Generate AI-powered health digests
    /goals        - Manage and track health goals
    /meals        - Log meals and food intake
    /notes        - Add reflections and qualitative notes
    /sync         - Sync data from Oura API
  page.tsx        - Main UI

/lib
  /db
    schema.ts     - Database schema and initialization
  /services
    claude.ts     - AI service for generating insights
    oura.ts       - Oura API client
    sync.ts       - Data synchronization logic

/scripts
  setup.ts        - Database setup and initialization
```

## Future Enhancements

Potential features to build on this foundation:
- Multiple concurrent goals
- Weekly/monthly trend analysis
- Correlation analysis between diet and health outcomes
- Export data to CSV/JSON
- Dark mode
- Mobile-responsive improvements
- Historical digest archive
- Custom prompts for AI insights

## Support

This is a personal health dashboard built for individual use. For questions or issues:
1. Check the browser console for error messages
2. Verify your API keys are correct in `.env.local`
3. Ensure the database file has proper permissions

## License

MIT
