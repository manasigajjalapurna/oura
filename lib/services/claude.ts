import Anthropic from '@anthropic-ai/sdk';

interface DigestInput {
  sleepData: any[];
  activityData: any[];
  readinessData: any[];
  stressData: any[];
  workoutData: any[];
  mealData: any[];
  goals: any[];
  userNotes: any[];
  digestType: 'morning' | 'afternoon' | 'evening';
}

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }

    this.client = new Anthropic({ apiKey });
  }

  async generateDigest(input: DigestInput): Promise<string> {
    const { sleepData, activityData, readinessData, stressData, workoutData, mealData, goals, userNotes, digestType } = input;

    // Prepare the context with relevant data
    const recentSleep = sleepData.slice(-7); // Last 7 days
    const recentActivity = activityData.slice(-7);
    const recentReadiness = readinessData.slice(-7);
    const recentStress = stressData.slice(-7);
    const recentWorkouts = workoutData.slice(-14); // Last 14 days for workout trends
    const recentMeals = mealData.slice(-3); // Last 3 days of meals

    const prompt = this.buildDigestPrompt(
      digestType,
      recentSleep,
      recentActivity,
      recentReadiness,
      recentStress,
      recentWorkouts,
      recentMeals,
      goals,
      userNotes
    );

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude');
  }

  private buildDigestPrompt(
    digestType: string,
    sleep: any[],
    activity: any[],
    readiness: any[],
    stress: any[],
    workouts: any[],
    meals: any[],
    goals: any[],
    userNotes: any[]
  ): string {
    const today = new Date().toISOString().split('T')[0];

    let timeContext = '';
    if (digestType === 'morning') {
      timeContext = 'This is a morning digest. Focus on how the user slept, their readiness for the day ahead, and what they should prioritize based on their recovery and goals.';
    } else if (digestType === 'afternoon') {
      timeContext = 'This is an afternoon digest. Focus on activity progress so far today, energy levels, and how they\'re tracking toward their goals.';
    } else {
      timeContext = 'This is an evening digest. Reflect on the full day - activity, workouts, stress, meals - and provide actionable insights for tomorrow.';
    }

    return `You are a personal health AI assistant analyzing Oura Ring data for a marathon runner training to lower their running heart rate.

${timeContext}

## User's Health Data

### Recent Sleep (Last 7 Days)
${JSON.stringify(sleep, null, 2)}

### Recent Activity (Last 7 Days)
${JSON.stringify(activity, null, 2)}

### Recent Readiness (Last 7 Days)
${JSON.stringify(readiness, null, 2)}

### Recent Stress (Last 7 Days)
${JSON.stringify(stress, null, 2)}

### Recent Workouts (Last 14 Days)
${JSON.stringify(workouts, null, 2)}

### Recent Meals (Last 3 Days)
${meals.length > 0 ? JSON.stringify(meals, null, 2) : 'No meal data logged recently'}

### Active Goals
${goals.length > 0 ? JSON.stringify(goals, null, 2) : 'No active goals'}

### Recent Notes/Reflections
${userNotes.length > 0 ? JSON.stringify(userNotes, null, 2) : 'No recent notes'}

## Your Task

Generate a thoughtful, personalized health digest. Your response MUST follow this exact format:

**Line 1:** A concise 1-3 sentence summary that captures the key takeaway(s) from the data. This should be the most important insight or recommendation. End with TWO newlines.

**Rest of digest:** 3-5 paragraphs that:
1. **Synthesize patterns** across sleep, recovery, activity, and workouts - don't just list stats
2. **Connect the dots** between different metrics (e.g., how poor sleep might be affecting HR during runs)
3. **Be specific and actionable** - give concrete recommendations tailored to the user's goals
4. **Be conversational and supportive** - write like a knowledgeable coach, not a robot
5. **Focus on what matters** - prioritize insights that help achieve goals

For the marathon training goal (lower running HR):
- Track HR trends across workouts over time
- Identify what training conditions correlate with lower/higher HR
- Connect recovery metrics (HRV, sleep quality, readiness) to workout performance
- Suggest specific training adjustments based on recent data

Start the main content with a friendly greeting and end with an actionable recommendation or reflection prompt.

Example format:
Your recovery is trending well this week, with HRV up 12% and consistent sleep - but your running HR remains elevated, suggesting you may still be pushing too hard on easy runs.

[blank line]

Good morning! Looking at your week...
[rest of digest content]

Date: ${today}`;
  }

  async analyzeGoalProgress(goal: any, relevantData: any): Promise<string> {
    const prompt = `Analyze progress toward this health goal:

Goal: ${JSON.stringify(goal, null, 2)}

Relevant Data:
${JSON.stringify(relevantData, null, 2)}

Provide a brief analysis of:
1. Current progress toward the goal
2. Trends over time (improving, plateauing, declining)
3. Specific insights from the data
4. One actionable recommendation

Keep it concise (2-3 paragraphs).`;

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude');
  }

  async generateSmartPrompt(recentData: any): Promise<string> {
    // Generate a contextual prompt/question for the user based on their recent data
    const prompt = `Based on this user's recent health data, generate ONE thoughtful question or reflection prompt that would help gather useful qualitative information.

Recent Data Summary:
${JSON.stringify(recentData, null, 2)}

The prompt should:
- Be specific to something you noticed in the data (e.g., elevated HR, poor sleep, high stress)
- Help understand context the data can't show (how they feel, what might be causing patterns)
- Be conversational and supportive

Return ONLY the question, nothing else.`;

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude');
  }
}

export function createClaudeService(): ClaudeService {
  return new ClaudeService();
}
