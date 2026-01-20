import db from '../db/schema';
import { OuraService } from './oura';

export class SyncService {
  private ouraService: OuraService;

  constructor(ouraService: OuraService) {
    this.ouraService = ouraService;
  }

  // Sync sleep data
  syncSleep(sleepData: any[]) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO oura_sleep (
        id, day, bedtime_start, bedtime_end, total_sleep_duration,
        awake_time, light_sleep_duration, deep_sleep_duration,
        rem_sleep_duration, restless_periods, average_hrv,
        average_heart_rate, lowest_heart_rate, efficiency,
        latency, temperature_delta, respiratory_rate, raw_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((records: any[]) => {
      for (const record of records) {
        const contributors = record.contributors || {};
        stmt.run(
          record.id,
          record.day,
          record.bedtime_start,
          record.bedtime_end,
          record.total_sleep_duration,
          record.awake_time,
          record.light_sleep_duration,
          record.deep_sleep_duration,
          record.rem_sleep_duration,
          record.restless_periods,
          record.average_hrv,
          record.average_heart_rate,
          record.lowest_heart_rate,
          record.efficiency,
          record.latency,
          record.temperature_delta,
          record.average_breath,
          JSON.stringify(record)
        );
      }
    });

    insertMany(sleepData);
    console.log(`✓ Synced ${sleepData.length} sleep records`);
  }

  // Sync daily activity data
  syncActivity(activityData: any[]) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO oura_activity (
        id, day, steps, active_calories, total_calories,
        target_calories, met_min_high, met_min_medium, met_min_low,
        average_met, sedentary_time, resting_time, inactivity_alerts,
        low_activity_met, medium_activity_met, high_activity_met, raw_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((records: any[]) => {
      for (const record of records) {
        stmt.run(
          record.id,
          record.day,
          record.steps,
          record.active_calories,
          record.total_calories,
          record.target_calories,
          record.high_activity_time,
          record.medium_activity_time,
          record.low_activity_time,
          record.average_met_minutes,
          record.sedentary_time,
          record.resting_time,
          record.inactivity_alerts,
          record.low_activity_met_minutes,
          record.medium_activity_met_minutes,
          record.high_activity_met_minutes,
          JSON.stringify(record)
        );
      }
    });

    insertMany(activityData);
    console.log(`✓ Synced ${activityData.length} activity records`);
  }

  // Sync readiness data
  syncReadiness(readinessData: any[]) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO oura_readiness (
        id, day, score, temperature_deviation, temperature_trend_deviation,
        activity_balance, body_temperature, hrv_balance,
        previous_day_activity, previous_night, recovery_index,
        resting_heart_rate, sleep_balance, raw_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((records: any[]) => {
      for (const record of records) {
        const contributors = record.contributors || {};
        stmt.run(
          record.id,
          record.day,
          record.score,
          record.temperature_deviation,
          record.temperature_trend_deviation,
          contributors.activity_balance,
          contributors.body_temperature,
          contributors.hrv_balance,
          contributors.previous_day_activity,
          contributors.previous_night,
          contributors.recovery_index,
          contributors.resting_heart_rate,
          contributors.sleep_balance,
          JSON.stringify(record)
        );
      }
    });

    insertMany(readinessData);
    console.log(`✓ Synced ${readinessData.length} readiness records`);
  }

  // Sync stress data
  syncStress(stressData: any[]) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO oura_stress (
        id, day, stress_high, recovery_high, day_summary, raw_data
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((records: any[]) => {
      for (const record of records) {
        stmt.run(
          record.id,
          record.day,
          record.stress_high,
          record.recovery_high,
          record.day_summary,
          JSON.stringify(record)
        );
      }
    });

    insertMany(stressData);
    console.log(`✓ Synced ${stressData.length} stress records`);
  }

  // Sync workouts
  syncWorkouts(workoutData: any[]) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO oura_workouts (
        id, day, activity, start_datetime, end_datetime,
        calories, intensity, average_hr, max_hr, distance, raw_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((records: any[]) => {
      for (const record of records) {
        stmt.run(
          record.id,
          record.day,
          record.activity,
          record.start_datetime,
          record.end_datetime,
          record.calories,
          record.intensity,
          record.average_heart_rate,
          record.max_heart_rate,
          record.distance,
          JSON.stringify(record)
        );
      }
    });

    insertMany(workoutData);
    console.log(`✓ Synced ${workoutData.length} workout records`);
  }

  // Sync SpO2 data
  syncSpO2(spo2Data: any[]) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO oura_spo2 (
        id, day, spo2_percentage, breathing_disturbance_index, raw_data
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((records: any[]) => {
      for (const record of records) {
        stmt.run(
          record.id,
          record.day,
          record.spo2_percentage?.average,
          record.breathing_disturbance_index,
          JSON.stringify(record)
        );
      }
    });

    insertMany(spo2Data);
    console.log(`✓ Synced ${spo2Data.length} SpO2 records`);
  }

  // Sync sleep sessions (individual sleep periods)
  syncSleepSessions(sleepSessionData: any[]) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO oura_sleep_sessions (
        id, day, bedtime_start, bedtime_end, type, total_sleep_duration,
        awake_time, light_sleep_duration, deep_sleep_duration,
        rem_sleep_duration, average_hrv, average_heart_rate,
        lowest_heart_rate, efficiency, raw_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((records: any[]) => {
      for (const record of records) {
        stmt.run(
          record.id,
          record.day,
          record.bedtime_start,
          record.bedtime_end,
          record.type,
          record.total_sleep_duration,
          record.awake_time,
          record.light_sleep_duration,
          record.deep_sleep_duration,
          record.rem_sleep_duration,
          record.average_hrv,
          record.average_heart_rate,
          record.lowest_heart_rate,
          record.efficiency,
          JSON.stringify(record)
        );
      }
    });

    insertMany(sleepSessionData);
    console.log(`✓ Synced ${sleepSessionData.length} sleep session records`);
  }

  // Sync heart rate data (5-minute interval data)
  syncHeartRate(heartRateData: any[]) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO heart_rate (
        timestamp, bpm, source
      ) VALUES (?, ?, ?)
    `);

    const insertMany = db.transaction((records: any[]) => {
      for (const record of records) {
        stmt.run(
          record.timestamp,
          record.bpm,
          record.source || 'oura'
        );
      }
    });

    insertMany(heartRateData);
    console.log(`✓ Synced ${heartRateData.length} heart rate records`);
  }

  // Update sync status
  updateSyncStatus(dataType: string, date: string) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO sync_status (data_type, last_sync_date, last_sync_timestamp)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(dataType, date);
  }

  // Get last sync date for a data type
  getLastSyncDate(dataType: string): string | null {
    const result = db.prepare('SELECT last_sync_date FROM sync_status WHERE data_type = ?')
      .get(dataType) as { last_sync_date: string } | undefined;
    return result?.last_sync_date || null;
  }

  // Full sync
  async performFullSync(daysBack: number = 60) {
    console.log(`\n🔄 Starting full sync (${daysBack} days)...\n`);

    const { startDate, endDate } = this.ouraService.getDateRange(daysBack);

    try {
      const data = await this.ouraService.fetchAllData(startDate, endDate);

      // Sync all data types
      if (data.dailySleep.length > 0) {
        this.syncSleep(data.dailySleep);
        this.updateSyncStatus('daily_sleep', endDate);
      }

      if (data.sleepSessions.length > 0) {
        this.syncSleepSessions(data.sleepSessions);
        this.updateSyncStatus('sleep_sessions', endDate);
      }

      if (data.activity.length > 0) {
        this.syncActivity(data.activity);
        this.updateSyncStatus('activity', endDate);
      }

      if (data.readiness.length > 0) {
        this.syncReadiness(data.readiness);
        this.updateSyncStatus('readiness', endDate);
      }

      if (data.stress.length > 0) {
        this.syncStress(data.stress);
        this.updateSyncStatus('stress', endDate);
      }

      if (data.workouts.length > 0) {
        this.syncWorkouts(data.workouts);
        this.updateSyncStatus('workouts', endDate);
      }

      if (data.spo2.length > 0) {
        this.syncSpO2(data.spo2);
        this.updateSyncStatus('spo2', endDate);
      }

      if (data.heartRate.length > 0) {
        this.syncHeartRate(data.heartRate);
        this.updateSyncStatus('heart_rate', endDate);
      }

      console.log(`\n✓ Full sync completed successfully!\n`);

      return {
        success: true,
        syncedRecords: {
          dailySleep: data.dailySleep.length,
          sleepSessions: data.sleepSessions.length,
          activity: data.activity.length,
          readiness: data.readiness.length,
          stress: data.stress.length,
          workouts: data.workouts.length,
          spo2: data.spo2.length,
          heartRate: data.heartRate.length,
        },
      };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }
}
