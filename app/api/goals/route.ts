import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/schema';
import db from '@/lib/db/schema';
import { createClaudeService } from '@/lib/services/claude';

export async function GET() {
  try {
    initializeDatabase();

    const goals = db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all();

    return NextResponse.json({ goals });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeDatabase();

    const body = await request.json();
    const { title, description, goalType, targetValue, targetDate } = body;

    const result = db.prepare(`
      INSERT INTO goals (title, description, goal_type, target_value, start_date, target_date, status)
      VALUES (?, ?, ?, ?, DATE('now'), ?, 'active')
    `).run(title, description, goalType, targetValue, targetDate || null);

    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, goal });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
