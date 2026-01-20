import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/schema';
import db from '@/lib/db/schema';
import { createClaudeService } from '@/lib/services/claude';

export async function POST(request: NextRequest) {
  try {
    initializeDatabase();

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Fetch recent health data for context
    const recentSleep = db.prepare(`
      SELECT * FROM oura_sleep
      ORDER BY day DESC
      LIMIT 7
    `).all();

    const recentActivity = db.prepare(`
      SELECT * FROM oura_activity
      ORDER BY day DESC
      LIMIT 7
    `).all();

    const recentWorkouts = db.prepare(`
      SELECT * FROM oura_workouts
      ORDER BY start_datetime DESC
      LIMIT 10
    `).all();

    const recentReadiness = db.prepare(`
      SELECT * FROM oura_readiness
      ORDER BY day DESC
      LIMIT 7
    `).all();

    const goals = db.prepare(`
      SELECT * FROM goals
      WHERE status = 'active'
      ORDER BY created_at DESC
    `).all();

    const recentMeals = db.prepare(`
      SELECT * FROM meals
      ORDER BY logged_at DESC
      LIMIT 5
    `).all();

    // Build context-aware prompt for Claude
    const contextPrompt = `You are a personal health AI assistant with access to the user's Oura Ring data. The user is asking you a question about their health.

## About the User
- **Physical Stats**: 5'5", ~130 lbs, female
- **Diet**: Vegetarian, actively working to increase protein intake
- **Activity**: Runs a few times per week, college student who walks frequently, focusing on building strength
- **Goals**: Half marathon March 30, 2026; Full marathon end of 2026; improve running pace/HR; build muscle and strength; improve sleep consistency; understand HRV patterns better
- **Context**: College student with variable sleep and higher stress levels

## Recent Health Data

### Sleep (Last 7 Days)
${JSON.stringify(recentSleep, null, 2)}

### Activity (Last 7 Days)
${JSON.stringify(recentActivity, null, 2)}

### Workouts (Last 10)
${JSON.stringify(recentWorkouts, null, 2)}

### Readiness (Last 7 Days)
${JSON.stringify(recentReadiness, null, 2)}

### Active Goals
${JSON.stringify(goals, null, 2)}

### Recent Meals
${JSON.stringify(recentMeals, null, 2)}

## User's Question
${message}

## Your Task
Answer the user's question thoughtfully and specifically, using their actual health data. Be:
- **Specific**: Reference actual numbers and trends from their data
- **Actionable**: Provide concrete recommendations they can implement
- **Conversational**: Write naturally, like a knowledgeable coach
- **Insightful**: Connect patterns across different metrics
- **Supportive**: Be encouraging while being honest about what the data shows

Keep your response concise (2-4 paragraphs unless more detail is needed).`;

    const claudeService = createClaudeService();
    const responseText = await claudeService.generateChatResponse(contextPrompt);

    return NextResponse.json({ success: true, response: responseText });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
