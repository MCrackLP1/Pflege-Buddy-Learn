'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/components/providers/auth-provider';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogOut, Download, Trash2, Star, Flame, Target, TrendingUp, RotateCcw, Shield, FileText, Cookie, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { LEGAL_CONFIG } from '@/lib/constants';
import { createLocalizedPath } from '@/lib/navigation';
import { useRouter } from 'next/navigation';

interface UserStats {
  totalXP: number;
  currentStreak: number;
  totalQuestions: number;
  accuracy: number;
  displayName: string;
}

export function ProfilePage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [, setLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const t = useTranslations('profile');
  const locale = useLocale();
  const { user, signOut } = useAuth();
  const router = useRouter();
  
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

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Clear local storage and cache
        localStorage.clear();
        sessionStorage.clear();

        // Clear any cached data
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }

        // Show success message
        alert(t('deleteAccountSuccess'));

        // Sign out user manually since API couldn't do it due to permission restrictions
        try {
          await signOut();
        } catch (signOutError) {
          console.error('Error during manual sign out:', signOutError);
          // Continue anyway - user will be redirected
        }

        // Redirect to home
        router.push('/');
      } else {
        throw new Error(data.error || 'Unbekannter Fehler');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError(t('deleteAccountError'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetQuiz = async () => {
    if (!user) return;

    try {
      setResetLoading(true);
      const response = await fetch('/api/user/reset-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Reload user stats after reset
        const statsResponse = await fetch('/api/user/progress');
        const statsData = await statsResponse.json();

        if (statsData.success) {
          const progress = statsData.user_progress;
          setUserStats({
            totalXP: progress.xp || 0,
            currentStreak: progress.streak_days || 0,
            totalQuestions: progress.total_questions || 0,
            accuracy: progress.accuracy || 0,
            displayName: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
          });
        }

        setShowResetDialog(false);
        // Optional: Show success message
        alert('Quiz-Versuche erfolgreich zurückgesetzt!');
      } else {
        throw new Error(data.error || 'Fehler beim Zurücksetzen');
      }
    } catch (error) {
      console.error('Error resetting quiz:', error);
      alert('Fehler beim Zurücksetzen der Quiz-Versuche. Bitte versuchen Sie es erneut.');
    } finally {
      setResetLoading(false);
    }
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

        {/* Legal & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Rechtliches & Datenschutz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href={createLocalizedPath(locale, 'datenschutz')} className="block">
                <Button variant="outline" className="w-full justify-start h-auto p-3">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Datenschutz</div>
                    <div className="text-xs text-muted-foreground">v{LEGAL_CONFIG.versions.privacy}</div>
                  </div>
                </Button>
              </Link>

              <Link href={createLocalizedPath(locale, 'agb')} className="block">
                <Button variant="outline" className="w-full justify-start h-auto p-3">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-medium">AGB</div>
                    <div className="text-xs text-muted-foreground">v{LEGAL_CONFIG.versions.terms}</div>
                  </div>
                </Button>
              </Link>

              <Link href={createLocalizedPath(locale, 'cookie-einstellungen')} className="block">
                <Button variant="outline" className="w-full justify-start h-auto p-3">
                  <Cookie className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Cookies</div>
                    <div className="text-xs text-muted-foreground">Einstellungen</div>
                  </div>
                </Button>
              </Link>

              <Link href={createLocalizedPath(locale, 'impressum')} className="block">
                <Button variant="outline" className="w-full justify-start h-auto p-3">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Impressum</div>
                    <div className="text-xs text-muted-foreground">Angaben</div>
                  </div>
                </Button>
              </Link>
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

            <Button
              onClick={() => setShowResetDialog(true)}
              variant="outline"
              className="w-full justify-start"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Quiz zurücksetzen
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
              onClick={() => setShowDeleteDialog(true)}
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

      {/* Reset Quiz Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Quiz zurücksetzen</h3>
            <p className="text-muted-foreground mb-6">
              Sind Sie sicher, dass Sie alle Quiz-Versuche zurücksetzen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden und alle Ihre
              bisherigen Antworten sowie der Fortschritt gehen verloren.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowResetDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={resetLoading}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleResetQuiz}
                variant="destructive"
                className="flex-1"
                disabled={resetLoading}
              >
                {resetLoading ? 'Zurücksetzen...' : 'Zurücksetzen'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-red-600">{t('deleteAccountConfirmTitle')}</h3>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                {t('deleteAccountConfirmMessage')}
              </p>

              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <pre className="text-sm text-red-800 whitespace-pre-line">
                  {t('deleteAccountDataList')}
                </pre>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {t('deleteAccountStripeNote')}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="deleteConfirmation" className="text-sm font-medium">
                  {t('deleteAccountPlaceholder')}
                </Label>
                <Input
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={t('deleteAccountTypeDelete')}
                  className="font-mono"
                />
              </div>

              {deleteError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {deleteError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation('');
                  setDeleteError(null);
                }}
                variant="outline"
                className="flex-1"
                disabled={deleteLoading}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleDeleteAccount}
                variant="destructive"
                className="flex-1"
                disabled={deleteLoading || deleteConfirmation !== t('deleteAccountTypeDelete')}
              >
                {deleteLoading ? t('deleteAccountDeleting') : t('deleteAccount')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
