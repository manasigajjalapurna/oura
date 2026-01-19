const OURA_API_BASE = 'https://api.ouraring.com/v2';

interface OuraConfig {
  token: string;
}

export class OuraService {
  private token: string;

  constructor(config: OuraConfig) {
    this.token = config.token;
  }

  private async fetch(endpoint: string, params?: Record<string, string>) {
    const url = new URL(`${OURA_API_BASE}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Oura API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getPersonalInfo() {
    return this.fetch('/usercollection/personal_info');
  }

  async getDailySleep(startDate: string, endDate: string) {
    return this.fetch('/usercollection/daily_sleep', {
      start_date: startDate,
      end_date: endDate,
    });
  }

  async getSleep(startDate: string, endDate: string) {
    return this.fetch('/usercollection/sleep', {
      start_date: startDate,
      end_date: endDate,
    });
  }

  async getDailyActivity(startDate: string, endDate: string) {
    return this.fetch('/usercollection/daily_activity', {
      start_date: startDate,
      end_date: endDate,
    });
  }

  async getDailyReadiness(startDate: string, endDate: string) {
    return this.fetch('/usercollection/daily_readiness', {
      start_date: startDate,
      end_date: endDate,
    });
  }

  async getDailyStress(startDate: string, endDate: string) {
    return this.fetch('/usercollection/daily_stress', {
      start_date: startDate,
      end_date: endDate,
    });
  }

  async getWorkouts(startDate: string, endDate: string) {
    return this.fetch('/usercollection/workout', {
      start_date: startDate,
      end_date: endDate,
    });
  }

  async getDailySpO2(startDate: string, endDate: string) {
    return this.fetch('/usercollection/daily_spo2', {
      start_date: startDate,
      end_date: endDate,
    });
  }

  async getHeartRate(startDate: string, endDate: string) {
    // Note: This endpoint might not be available in all Oura API versions
    // We'll handle heart rate data from workouts and sleep primarily
    try {
      return this.fetch('/usercollection/heartrate', {
        start_date: startDate,
        end_date: endDate,
      });
    } catch (error) {
      console.warn('Heart rate endpoint not available:', error);
      return { data: [] };
    }
  }

  // Helper to get date range for initial sync
  getDateRange(daysBack: number): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }

  // Fetch all data for a date range
  async fetchAllData(startDate: string, endDate: string) {
    console.log(`Fetching Oura data from ${startDate} to ${endDate}...`);

    const [
      sleep,
      dailySleep,
      activity,
      readiness,
      stress,
      workouts,
      spo2,
    ] = await Promise.all([
      this.getSleep(startDate, endDate),
      this.getDailySleep(startDate, endDate),
      this.getDailyActivity(startDate, endDate),
      this.getDailyReadiness(startDate, endDate),
      this.getDailyStress(startDate, endDate),
      this.getWorkouts(startDate, endDate),
      this.getDailySpO2(startDate, endDate),
    ]);

    return {
      sleep: sleep.data || [],
      dailySleep: dailySleep.data || [],
      activity: activity.data || [],
      readiness: readiness.data || [],
      stress: stress.data || [],
      workouts: workouts.data || [],
      spo2: spo2.data || [],
    };
  }
}

export function createOuraService(): OuraService {
  const token = process.env.OURA_API_TOKEN;

  if (!token) {
    throw new Error('OURA_API_TOKEN environment variable is not set');
  }

  return new OuraService({ token });
}
