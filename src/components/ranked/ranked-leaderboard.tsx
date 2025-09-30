'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_score: number;
  questions_answered: number;
  correct_answers: number;
  accuracy: number;
  average_time_ms: number;
  rank: number;
  created_at: string;
  display_name?: string;
}

export function RankedLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ranked/leaderboard');
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
        setUserRank(data.userRank);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Refresh leaderboard when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadLeaderboard();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Bestenliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Bestenliste
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Einträge in der Bestenliste.</p>
            <p className="text-sm">Sei der Erste, der eine Ranked Session abschließt!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  entry.rank === userRank ? 'bg-primary/5 border-primary/20' : 'bg-card'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-semibold">
                      {entry.display_name || 'Anonymous User'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg">{entry.total_score.toLocaleString()}</div>
                    <div className="text-muted-foreground">Punkte</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {userRank && userRank > 10 && (
          <div className="mt-6 p-4 bg-secondary rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Du bist auf Platz <strong>{userRank}</strong> der Bestenliste!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
