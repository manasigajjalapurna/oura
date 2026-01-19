'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [digest, setDigest] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [showGoalProgress, setShowGoalProgress] = useState(false);
  const [goalProgress, setGoalProgress] = useState<any>(null);
  const [showMealInput, setShowMealInput] = useState(false);
  const [mealDescription, setMealDescription] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    loadDigest();
  }, []);

  const loadDigest = async (regenerate = false) => {
    try {
      setRefreshing(regenerate);
      setLoading(!regenerate);

      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          digestType: getDigestType(),
          regenerate,
        }),
      });

      const data = await response.json();
      setDigest(data.digest);
      setGeneratedAt(data.generatedAt);
    } catch (error) {
      console.error('Failed to load digest:', error);
      setDigest('Failed to load digest. Please try syncing your data first.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const syncData = async () => {
    try {
      setSyncing(true);
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (result.success) {
        alert(`Synced successfully! Records: ${JSON.stringify(result.syncedRecords, null, 2)}`);
        // Reload digest after sync
        await loadDigest(true);
      } else {
        alert(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      alert('Sync failed. Check console for details.');
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const loadGoalProgress = async () => {
    try {
      // For MVP, we're hardcoding goal ID as 1 (the "lower running HR" goal)
      const response = await fetch('/api/goals/1/progress');
      const data = await response.json();
      setGoalProgress(data);
      setShowGoalProgress(true);
    } catch (error) {
      console.error('Failed to load goal progress:', error);
    }
  };

  const logMeal = async () => {
    if (!mealDescription.trim()) return;

    try {
      await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: mealDescription }),
      });

      setMealDescription('');
      setShowMealInput(false);
      alert('Meal logged successfully!');
    } catch (error) {
      alert('Failed to log meal');
      console.error(error);
    }
  };

  const saveNote = async () => {
    if (!noteContent.trim()) return;

    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent, noteType: 'reflection' }),
      });

      setNoteContent('');
      setShowNoteInput(false);
      alert('Note saved successfully!');
    } catch (error) {
      alert('Failed to save note');
      console.error(error);
    }
  };

  const getDigestType = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400 text-lg">Loading your health insights...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-2xl font-light text-stone-800 mb-2">{getGreeting()}</h1>
          <p className="text-sm text-stone-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Main Digest */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 mb-6">
          <div className="prose prose-stone max-w-none">
            <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
              {digest}
            </div>
          </div>

          {generatedAt && (
            <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-400">
              Generated at {new Date(generatedAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => loadDigest(true)}
            disabled={refreshing}
            className="px-6 py-2 bg-stone-800 text-white text-sm font-medium rounded-md hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : '↻ Refresh Digest'}
          </button>

          <button
            onClick={syncData}
            disabled={syncing}
            className="px-6 py-2 bg-white border border-stone-300 text-stone-700 text-sm font-medium rounded-md hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : '⟳ Sync Oura Data'}
          </button>

          <button
            onClick={loadGoalProgress}
            className="px-6 py-2 bg-white border border-stone-300 text-stone-700 text-sm font-medium rounded-md hover:bg-stone-50 transition-colors"
          >
            📊 Goal Progress
          </button>

          <button
            onClick={() => setShowMealInput(!showMealInput)}
            className="px-6 py-2 bg-white border border-stone-300 text-stone-700 text-sm font-medium rounded-md hover:bg-stone-50 transition-colors"
          >
            🍽️ Log Meal
          </button>

          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="px-6 py-2 bg-white border border-stone-300 text-stone-700 text-sm font-medium rounded-md hover:bg-stone-50 transition-colors"
          >
            📝 Add Note
          </button>
        </div>

        {/* Meal Input */}
        {showMealInput && (
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-stone-800 mb-4">Log a Meal</h3>
            <textarea
              value={mealDescription}
              onChange={(e) => setMealDescription(e.target.value)}
              placeholder="E.g., chicken salad with quinoa, large portion"
              className="w-full p-3 border border-stone-300 rounded-md text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 mb-3"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={logMeal}
                className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-md hover:bg-stone-700 transition-colors"
              >
                Save Meal
              </button>
              <button
                onClick={() => setShowMealInput(false)}
                className="px-4 py-2 bg-white border border-stone-300 text-stone-700 text-sm font-medium rounded-md hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Note Input */}
        {showNoteInput && (
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-stone-800 mb-4">Add a Note</h3>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="How did your workout feel? Any observations about your energy or recovery?"
              className="w-full p-3 border border-stone-300 rounded-md text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-800 mb-3"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={saveNote}
                className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-md hover:bg-stone-700 transition-colors"
              >
                Save Note
              </button>
              <button
                onClick={() => setShowNoteInput(false)}
                className="px-4 py-2 bg-white border border-stone-300 text-stone-700 text-sm font-medium rounded-md hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goal Progress */}
        {showGoalProgress && goalProgress && (
          <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-stone-800">{goalProgress.goal?.title}</h3>
              <button
                onClick={() => setShowGoalProgress(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            </div>

            {goalProgress.metrics && (
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-stone-50 rounded-md">
                <div>
                  <div className="text-xs text-stone-500 mb-1">Total Workouts</div>
                  <div className="text-2xl font-semibold text-stone-800">{goalProgress.metrics.totalWorkouts}</div>
                </div>
                <div>
                  <div className="text-xs text-stone-500 mb-1">Avg Heart Rate</div>
                  <div className="text-2xl font-semibold text-stone-800">{goalProgress.metrics.averageHR} bpm</div>
                </div>
                <div>
                  <div className="text-xs text-stone-500 mb-1">Trend</div>
                  <div className={`text-lg font-medium ${
                    goalProgress.metrics.trend === 'improving' ? 'text-green-600' :
                    goalProgress.metrics.trend === 'worsening' ? 'text-red-600' :
                    'text-stone-600'
                  }`}>
                    {goalProgress.metrics.trend}
                  </div>
                </div>
                {goalProgress.metrics.improvement !== 0 && (
                  <div>
                    <div className="text-xs text-stone-500 mb-1">Improvement</div>
                    <div className="text-lg font-medium text-green-600">
                      {goalProgress.metrics.improvement > 0 ? '+' : ''}{goalProgress.metrics.improvement}%
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="prose prose-stone prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-stone-700 leading-relaxed">
                {goalProgress.analysis}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-stone-400 mt-12">
          Your personal health data stays local on this device.
        </div>
      </div>
    </div>
  );
}
