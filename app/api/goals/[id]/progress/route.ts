import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/schema';
import db from '@/lib/db/schema';
import { createClaudeService } from '@/lib/services/claude';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    initializeDatabase();

    const goalId = params.id;
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(goalId) as any;

    if (!goal) {
      return NextResponse.json(
        { success: false, error: 'Goal not found' },
        { status: 404 }
      );
    }

    // For "lower running HR" goal, gather workout data
    let relevantData: any = {};

    if (goal.goal_type === 'lower_running_hr') {
      // Get all running workouts since goal start date
      const workouts = db.prepare(`
        SELECT * FROM oura_workouts
        WHERE day >= ? AND activity LIKE '%run%'
        ORDER BY start_datetime ASC
      `).all(goal.start_date);

      // Get sleep and readiness for context
      const sleep = db.prepare(`
        SELECT * FROM oura_sleep
        WHERE day >= ?
        ORDER BY day DESC LIMIT 14
      `).all(goal.start_date);

      const readiness = db.prepare(`
        SELECT * FROM oura_readiness
        WHERE day >= ?
        ORDER BY day DESC LIMIT 14
      `).all(goal.start_date);

      relevantData = {
        workouts,
        sleep,
        readiness,
        goalStartDate: goal.start_date,
        currentDate: new Date().toISOString().split('T')[0],
      };
    }

    // Generate progress analysis using Claude
    const claudeService = createClaudeService();
    const analysis = await claudeService.analyzeGoalProgress(goal, relevantData);

    // Calculate some basic metrics
    const metrics = calculateGoalMetrics(goal, relevantData);

    return NextResponse.json({
      goal,
      analysis,
      metrics,
      data: relevantData,
    });
  } catch (error: any) {
    console.error('Goal progress error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function calculateGoalMetrics(goal: any, data: any) {
  if (goal.goal_type === 'lower_running_hr') {
    const workouts = data.workouts || [];

    if (workouts.length === 0) {
      return {
        totalWorkouts: 0,
        averageHR: null,
        trend: null,
      };
    }

    // Calculate average HR over time
    const avgHR = workouts.reduce((sum: number, w: any) => sum + (w.average_hr || 0), 0) / workouts.length;

    // Calculate trend (comparing first half to second half)
    const midPoint = Math.floor(workouts.length / 2);
    const firstHalfAvg = workouts.slice(0, midPoint).reduce((sum: number, w: any) => sum + (w.average_hr || 0), 0) / midPoint;
    const secondHalfAvg = workouts.slice(midPoint).reduce((sum: number, w: any) => sum + (w.average_hr || 0), 0) / (workouts.length - midPoint);

    const trend = secondHalfAvg < firstHalfAvg ? 'improving' : secondHalfAvg > firstHalfAvg ? 'worsening' : 'stable';

    return {
      totalWorkouts: workouts.length,
      averageHR: Math.round(avgHR),
      firstHalfAvgHR: Math.round(firstHalfAvg),
      secondHalfAvgHR: Math.round(secondHalfAvg),
      trend,
      improvement: firstHalfAvg > 0 ? Math.round(((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100) : 0,
    };
  }

  return {};
}
