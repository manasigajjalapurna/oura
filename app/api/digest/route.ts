import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/schema';
import { createClaudeService } from '@/lib/services/claude';
import db from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    initializeDatabase();

    const body = await request.json();
    const { digestType = 'morning', regenerate = false } = body;

    const today = new Date().toISOString().split('T')[0];

    // Check if we have a cached digest for today
    if (!regenerate) {
      const cachedDigest = db
        .prepare('SELECT * FROM digests WHERE digest_type = ? AND date = ?')
        .get(digestType, today) as any;

      if (cachedDigest) {
        return NextResponse.json({
          digest: cachedDigest.content,
          cached: true,
          generatedAt: cachedDigest.generated_at,
        });
      }
    }

    // Fetch recent data from database
    const sleepData = db.prepare('SELECT * FROM oura_sleep ORDER BY day DESC LIMIT 7').all();
    const activityData = db.prepare('SELECT * FROM oura_activity ORDER BY day DESC LIMIT 7').all();
    const readinessData = db.prepare('SELECT * FROM oura_readiness ORDER BY day DESC LIMIT 7').all();
    const stressData = db.prepare('SELECT * FROM oura_stress ORDER BY day DESC LIMIT 7').all();
    const workoutData = db.prepare('SELECT * FROM oura_workouts ORDER BY start_datetime DESC LIMIT 14').all();
    const mealData = db.prepare('SELECT * FROM meals ORDER BY date DESC, time DESC LIMIT 10').all();
    const goals = db.prepare('SELECT * FROM goals WHERE status = ?').all('active');
    const userNotes = db.prepare('SELECT * FROM user_notes ORDER BY date DESC LIMIT 5').all();

    // Generate digest using Claude
    const claudeService = createClaudeService();
    const digestContent = await claudeService.generateDigest({
      sleepData,
      activityData,
      readinessData,
      stressData,
      workoutData,
      mealData,
      goals,
      userNotes,
      digestType: digestType as any,
    });

    // Save to database
    db.prepare(`
      INSERT OR REPLACE INTO digests (digest_type, date, content, generated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(digestType, today, digestContent);

    return NextResponse.json({
      digest: digestContent,
      cached: false,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Digest generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();

    const { searchParams } = new URL(request.url);
    const digestType = searchParams.get('type') || 'morning';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const digest = db
      .prepare('SELECT * FROM digests WHERE digest_type = ? AND date = ?')
      .get(digestType, date) as any;

    if (!digest) {
      return NextResponse.json(
        { success: false, error: 'No digest found for this date' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      digest: digest.content,
      generatedAt: digest.generated_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
