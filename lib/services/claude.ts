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

    return `You are a personal health AI assistant analyzing Oura Ring data for a dedicated athlete and college student.

## About the User
- **Physical Stats**: 5'5", ~130 lbs, female
- **Diet**: Vegetarian, actively working to increase protein intake
- **Activity Level**: Runs a few times per week, walks frequently as a college student, focusing on building strength
- **Training Goals**:
  - Half marathon on March 30, 2026
  - Full marathon end of 2026
  - Improve running pace and endurance
  - Lower running heart rate for better aerobic efficiency
  - Build muscle and strength (top priority right now)
  - Improve sleep consistency and quality
  - Better understand HRV patterns
- **Context**: College student lifestyle leads to variable sleep patterns and higher stress levels
- **Current Focus**: Getting better at running (pace, endurance, HR efficiency), improving sleep consistency, building strength and muscle mass

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
1. **Analyze workout performance deeply** - examine pace, HR trends, duration, intensity, recovery patterns
2. **Synthesize patterns** across sleep, recovery, activity, strength training, and running performance
3. **Connect the dots** between different metrics (e.g., how sleep affects workout performance, HRV patterns and training readiness)
4. **Be specific and actionable** - give concrete recommendations tailored to current training goals
5. **Address strength training** - note correlations between activity patterns and muscle building/recovery
6. **Be conversational and supportive** - write like a knowledgeable coach, not a robot
7. **Focus on what matters** - prioritize insights for marathon training, strength building, and sleep optimization

Key areas to analyze:
- **Running performance**: HR trends, pace, endurance, training volume, aerobic efficiency
- **Strength indicators**: Activity patterns, recovery scores, readiness for strength work
- **Sleep quality**: Consistency, duration, HRV patterns, recovery impact
- **Recovery metrics**: HRV trends, readiness scores, stress levels, their relationship to training
- **Protein/nutrition**: When meals are logged, connect to workout performance and recovery
- **Training balance**: Running volume, strength work, rest days, overtraining risk

Start the main content with a friendly greeting. End with an actionable recommendation or thoughtful question.

Example format:
Your running HR is trending down nicely over the past two weeks, averaging 152 bpm compared to 158 last month. Your HRV has been variable though, possibly due to inconsistent sleep timing - prioritizing a regular sleep schedule could help lock in these running gains.

[blank line]

Hey! Looking at your week, I'm noticing some really interesting patterns...
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
