'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/providers/auth-provider';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { LogOut, Download, Trash2, Star, Flame, Target, TrendingUp } from 'lucide-react';

interface UserStats {
  totalXP: number;
  currentStreak: number;
  totalQuestions: number;
  accuracy: number;
  displayName: string;
}

export function ProfilePage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const t = useTranslations('profile');
  const { user, signOut } = useAuth();
  
  // Load real user statistics from API
  useEffect(() => {
    async function loadUserStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/user/progress');
        const data = await response.json();
        
        if (data.success) {
          const progress = data.user_progress;
          setUserStats({
            totalXP: progress.xp || 0,
            currentStreak: progress.streak_days || 0,
            totalQuestions: progress.total_questions || 0,
            accuracy: progress.accuracy || 0,
            displayName: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
          });
        } else {
          throw new Error(data.error || 'Failed to load user stats');
        }
      } catch (err) {
        console.error('Error loading user stats:', err);
        // Fallback to basic data
        setUserStats({
          totalXP: 0,
          currentStreak: 0,
          totalQuestions: 0,
          accuracy: 0,
          displayName: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadUserStats();
  }, [user]);

  const handleLanguageChange = (locale: string) => {
    // Will implement locale switching
    console.log('Switch to locale:', locale);
  };

  const handleExportData = () => {
    // Will implement data export
    console.log('Export user data');
  };

  const handleDeleteAccount = () => {
    // Will implement account deletion
    console.log('Delete account');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">{t('displayName')}</Label>
              <Input
                id="displayName"
                value={userStats?.displayName || ''}
                placeholder="Ihr Anzeigename"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t('language')}</Label>
              <Select onValueChange={handleLanguageChange} defaultValue="de">
                <SelectTrigger>
                  <SelectValue placeholder="Sprache auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">{t('german')}</SelectItem>
                  <SelectItem value="en">{t('english')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('statistics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center space-y-2">
                <Star className="h-6 w-6 mx-auto text-yellow-500" />
                <div className="text-xl font-bold">{(userStats?.totalXP || 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{t('totalXP')}</div>
              </div>

              <div className="text-center space-y-2">
                <Flame className="h-6 w-6 mx-auto text-orange-500" />
                <div className="text-xl font-bold">{userStats?.currentStreak || 0}</div>
                <div className="text-xs text-muted-foreground">{t('currentStreak')}</div>
              </div>

              <div className="text-center space-y-2">
                <Target className="h-6 w-6 mx-auto text-blue-500" />
                <div className="text-xl font-bold">{userStats?.totalQuestions || 0}</div>
                <div className="text-xs text-muted-foreground">{t('totalQuestions')}</div>
              </div>

              <div className="text-center space-y-2">
                <TrendingUp className="h-6 w-6 mx-auto text-green-500" />
                <div className="text-xl font-bold">{userStats?.accuracy || 0}%</div>
                <div className="text-xs text-muted-foreground">{t('accuracy')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button
              onClick={handleExportData}
              variant="outline"
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('exportData')}
            </Button>

            <Separator />

            <Button
              onClick={signOut}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>

            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              className="w-full justify-start"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('deleteAccount')}
            </Button>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="p-4">
            <p className="text-xs text-center text-muted-foreground">
              {t('deleteAccountWarning')}
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
