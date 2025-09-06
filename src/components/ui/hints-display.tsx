'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HintsData {
  hintsBalance: number;
}

export function HintsDisplay() {
  const [hintsData, setHintsData] = useState<HintsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/hints');
      const data = await response.json();

      if (data.success) {
        setHintsData({
          hintsBalance: data.hintsBalance
        });
      } else {
        throw new Error(data.error || 'Failed to load hints');
      }
    } catch (err) {
      console.error('Error loading hints:', err);
      setError(err instanceof Error ? err.message : 'Failed to load hints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHints();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Lade Hints...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Fehler beim Laden der Hints
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadHints}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalHints = hintsData?.hintsBalance || 0;

  return (
    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
            <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Verfügbare Hints
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              {totalHints === 0 ? 'Keine Hints verfügbar' : 'Für schwierige Fragen verwenden'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {totalHints}
          </p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            Hints
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
