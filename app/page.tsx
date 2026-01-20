'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [digest, setDigest] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string>('');
  const [showGoalProgress, setShowGoalProgress] = useState(false);
  const [goalProgress, setGoalProgress] = useState<any>(null);
  const [showMealInput, setShowMealInput] = useState(false);
  const [mealDescription, setMealDescription] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    checkDataAndLoadDigest();
  }, []);

  const checkDataAndLoadDigest = async () => {
    try {
      // Check if we have data first
      const statusResponse = await fetch('/api/sync');
      const statusData = await statusResponse.json();
      const dataExists = statusData.syncStatus && statusData.syncStatus.length > 0;
      setHasData(dataExists);

      if (dataExists) {
        await loadDigest();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking data status:', error);
      setLoading(false);
    }
  };

  const loadDigest = async (regenerate = false) => {
    try {
      setRefreshing(regenerate);
      if (!regenerate) setLoading(true);

      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          digestType: getDigestType(),
          regenerate,
        }),
      });

      const data = await response.json();

      // Extract first paragraph as summary (before first blank line)
      const lines = data.digest.split('\n');
      const firstBlankLine = lines.findIndex((l: string) => l.trim() === '');

      if (firstBlankLine > 0) {
        // Summary is everything before the first blank line
        const summaryLines = lines.slice(0, firstBlankLine);
        setSummary(summaryLines.join(' ').trim());
        // Digest is everything after the blank line
        setDigest(lines.slice(firstBlankLine + 1).join('\n').trim());
      } else {
        // Fallback: no clear summary structure, use first paragraph
        const firstParagraphEnd = lines.findIndex((l, i) => i > 0 && l.trim() === '');
        if (firstParagraphEnd > 0) {
          setSummary(lines.slice(0, firstParagraphEnd).join(' ').trim());
          setDigest(lines.slice(firstParagraphEnd).join('\n').trim());
        } else {
          // No paragraph breaks, just show the whole thing as digest
          setSummary('Your Health Digest');
          setDigest(data.digest);
        }
      }

      setGeneratedAt(data.generatedAt);
      setHasData(true);
    } catch (error) {
      console.error('Failed to load digest:', error);
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
        setHasData(true);
        await loadDigest(true);
      } else {
        alert(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      alert('Sync failed. Please check your internet connection and API keys.');
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const loadGoalProgress = async (goalId?: number) => {
    try {
      // If no goalId provided, fetch all goals first
      if (!goalId) {
        const goalsResponse = await fetch('/api/goals');
        const goalsData = await goalsResponse.json();

        if (goalsData.goals && goalsData.goals.length > 0) {
          // Load progress for the first active goal
          const firstGoal = goalsData.goals.find((g: any) => g.status === 'active') || goalsData.goals[0];
          goalId = firstGoal.id;
        } else {
          // No goals exist yet
          setGoalProgress({ noGoals: true });
          setShowGoalProgress(true);
          return;
        }
      }

      const response = await fetch(`/api/goals/${goalId}/progress`);
      const data = await response.json();

      if (data.success === false) {
        setGoalProgress({ error: data.error });
      } else {
        setGoalProgress(data);
      }
      setShowGoalProgress(true);
    } catch (error) {
      console.error('Failed to load goal progress:', error);
      setGoalProgress({ error: 'Failed to load goals' });
      setShowGoalProgress(true);
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
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="text-neutral-400 text-sm font-light tracking-wide">Loading your health insights...</div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-serif text-neutral-800 mb-6" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>
            Welcome to your health dashboard
          </h1>
          <p className="text-neutral-600 mb-8 leading-relaxed font-light">
            To get started, sync your Oura Ring data. This will fetch your recent health metrics and generate personalized insights.
          </p>
          <button
            onClick={syncData}
            disabled={syncing}
            className="px-8 py-3 bg-neutral-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            {syncing ? 'Syncing your data...' : 'Sync Oura Data'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Greeting */}
        <div className="mb-4">
          <p className="text-sm text-neutral-500 font-light tracking-wide">
            {getGreeting()} — {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Header with Title and Summary */}
        <div className="mb-12">
          <h1
            className="text-4xl text-neutral-800 leading-tight mb-4"
            style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}
          >
            {getDigestType().charAt(0).toUpperCase() + getDigestType().slice(1)} Digest
          </h1>
          {summary && summary !== 'Your Health Digest' && (
            <p className="text-lg text-neutral-600 leading-relaxed font-light max-w-2xl">
              {summary}
            </p>
          )}
        </div>

        {/* Main Digest */}
        <div className="prose prose-neutral max-w-none mb-16">
          <div className="text-neutral-700 leading-relaxed font-light whitespace-pre-wrap">
            {digest}
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-6 mb-16 border-t border-neutral-200 pt-8">
          <button
            onClick={() => loadDigest(true)}
            disabled={refreshing}
            className="group flex flex-col items-center gap-2 transition-opacity hover:opacity-60 disabled:opacity-30"
            title="Refresh digest"
          >
            <span className="text-2xl">↻</span>
            <span className="text-xs text-neutral-500 font-light tracking-wide">refresh</span>
          </button>

          <button
            onClick={syncData}
            disabled={syncing}
            className="group flex flex-col items-center gap-2 transition-opacity hover:opacity-60 disabled:opacity-30"
            title="Sync Oura data"
          >
            <span className="text-2xl">⟳</span>
            <span className="text-xs text-neutral-500 font-light tracking-wide">sync</span>
          </button>

          <button
            onClick={loadGoalProgress}
            className="group flex flex-col items-center gap-2 transition-opacity hover:opacity-60"
            title="View goal progress"
          >
            <span className="text-2xl">📊</span>
            <span className="text-xs text-neutral-500 font-light tracking-wide">goals</span>
          </button>

          <button
            onClick={() => setShowMealInput(!showMealInput)}
            className="group flex flex-col items-center gap-2 transition-opacity hover:opacity-60"
            title="Log a meal"
          >
            <span className="text-2xl">🍽️</span>
            <span className="text-xs text-neutral-500 font-light tracking-wide">meal</span>
          </button>

          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="group flex flex-col items-center gap-2 transition-opacity hover:opacity-60"
            title="Add a note"
          >
            <span className="text-2xl">✍️</span>
            <span className="text-xs text-neutral-500 font-light tracking-wide">note</span>
          </button>
        </div>

        {/* Meal Input Modal */}
        {showMealInput && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-6">
            <div className="bg-white rounded-sm shadow-2xl max-w-md w-full p-8">
              <h3 className="text-xl font-serif mb-4" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>
                Log a meal
              </h3>
              <textarea
                value={mealDescription}
                onChange={(e) => setMealDescription(e.target.value)}
                placeholder="e.g., grilled salmon with roasted vegetables"
                className="w-full p-3 border border-neutral-200 rounded-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 mb-4 font-light"
                rows={4}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={logMeal}
                  className="px-6 py-2 bg-neutral-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-neutral-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowMealInput(false)}
                  className="px-6 py-2 text-neutral-600 text-sm font-light tracking-wide hover:text-neutral-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Note Input Modal */}
        {showNoteInput && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-6">
            <div className="bg-white rounded-sm shadow-2xl max-w-md w-full p-8">
              <h3 className="text-xl font-serif mb-4" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>
                Add a reflection
              </h3>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="How did today feel? Any observations about your energy or recovery?"
                className="w-full p-3 border border-neutral-200 rounded-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 mb-4 font-light"
                rows={5}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={saveNote}
                  className="px-6 py-2 bg-neutral-800 text-white text-sm font-light tracking-wide rounded-sm hover:bg-neutral-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="px-6 py-2 text-neutral-600 text-sm font-light tracking-wide hover:text-neutral-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goal Progress Modal */}
        {showGoalProgress && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-6">
            <div className="bg-white rounded-sm shadow-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-serif" style={{ fontFamily: 'Instrument Serif, Georgia, serif' }}>
                  {goalProgress?.noGoals ? 'Your Goals' : goalProgress?.error ? 'Error' : goalProgress?.goal?.title || 'Goal Progress'}
                </h3>
                <button
                  onClick={() => setShowGoalProgress(false)}
                  className="text-neutral-400 hover:text-neutral-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {goalProgress?.noGoals ? (
                <div className="text-center py-8">
                  <p className="text-neutral-600 mb-6 font-light">
                    You haven&apos;t set any goals yet. Goals help you track specific health and fitness objectives.
                  </p>
                  <p className="text-neutral-500 text-sm font-light">
                    The default &quot;Lower Running HR&quot; goal should have been created during setup. Try running the setup script again or create a new goal manually.
                  </p>
                </div>
              ) : goalProgress?.error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-2 font-light">{goalProgress.error}</p>
                  <p className="text-neutral-500 text-sm font-light">
                    There was an issue loading your goals. Please try again or check your data.
                  </p>
                </div>
              ) : goalProgress ? (
                <>
                  {goalProgress.metrics && (
                    <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-neutral-200">
                      <div>
                        <div className="text-xs text-neutral-500 mb-1 tracking-wide uppercase">Workouts</div>
                        <div className="text-3xl font-light text-neutral-800">{goalProgress.metrics.totalWorkouts}</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500 mb-1 tracking-wide uppercase">Avg HR</div>
                        <div className="text-3xl font-light text-neutral-800">{goalProgress.metrics.averageHR} bpm</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500 mb-1 tracking-wide uppercase">Trend</div>
                        <div className={`text-xl font-light ${
                          goalProgress.metrics.trend === 'improving' ? 'text-emerald-600' :
                          goalProgress.metrics.trend === 'worsening' ? 'text-red-600' :
                          'text-neutral-600'
                        }`}>
                          {goalProgress.metrics.trend}
                        </div>
                      </div>
                      {goalProgress.metrics.improvement !== 0 && (
                        <div>
                          <div className="text-xs text-neutral-500 mb-1 tracking-wide uppercase">Change</div>
                          <div className="text-xl font-light text-emerald-600">
                            {goalProgress.metrics.improvement > 0 ? '+' : ''}{goalProgress.metrics.improvement}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="prose prose-neutral max-w-none">
                    <div className="text-neutral-700 leading-relaxed font-light whitespace-pre-wrap">
                      {goalProgress.analysis}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-500 font-light">Loading...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-neutral-400 mt-16 font-light tracking-wide">
          your health data stays local on this device
        </div>

        {generatedAt && (
          <div className="text-center text-xs text-neutral-300 mt-2 font-light">
            last updated {new Date(generatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}
