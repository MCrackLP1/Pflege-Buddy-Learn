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
import { clearStorage } from '@/lib/utils/safe-storage';
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

interface UserProfile {
  user_id: string;
  display_name: string | null;
  role: string;
  locale: string;
}

export function ProfilePage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const tComponents = useTranslations('components');
  const tErrors = useTranslations('errors');
  const tValidation = useTranslations('validation');
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

  // Load user profile from API
  useEffect(() => {
    async function loadUserProfile() {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();

        if (data.success) {
          setUserProfile(data.data);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
      }
    }

    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Update tempDisplayName when userProfile changes
  useEffect(() => {
    if (userProfile?.display_name) {
      setTempDisplayName(userProfile.display_name);
    }
  }, [userProfile]);

  const handleLanguageChange = async (locale: string) => {
    if (!user) return;

    try {
      setProfileLoading(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale: locale,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserProfile(data.data);
        // Set cookie for immediate locale change
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 30}`;
        // Redirect to the same page with new locale
        const currentPath = window.location.pathname.replace(/^\/(de|en)/, '');
        window.location.href = `/${locale}${currentPath}`;
      } else {
        throw new Error(data.error || 'Failed to update language');
      }
    } catch (error) {
      console.error('Error updating language:', error);
      alert('Fehler beim Aktualisieren der Sprache');
    } finally {
      setProfileLoading(false);
    }
  };

  const startEditingDisplayName = () => {
    setTempDisplayName(userProfile?.display_name || '');
    setEditingDisplayName(true);
  };

  const cancelEditingDisplayName = () => {
    setTempDisplayName('');
    setEditingDisplayName(false);
  };

  const saveDisplayName = async () => {
    if (!user || !tempDisplayName.trim()) return;

    try {
      setProfileLoading(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: tempDisplayName.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserProfile(data.data);
        // Also update userStats for consistency
        if (userStats) {
          setUserStats({
            ...userStats,
            displayName: tempDisplayName.trim(),
          });
        }
        setEditingDisplayName(false);
        setTempDisplayName('');
      } else {
        throw new Error(data.error || 'Failed to update display name');
      }
    } catch (error) {
      console.error('Error updating display name:', error);
      alert('Fehler beim Aktualisieren des Anzeigenamens');
    } finally {
      setProfileLoading(false);
    }
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
        clearStorage();
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            window.sessionStorage.clear();
          } catch (error) {
            console.warn('Could not clear sessionStorage:', error);
          }
        }

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
        throw new Error(data.error || tErrors('unknownError'));
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
            displayName: userProfile?.display_name || user?.user_metadata?.name || user?.email?.split('@')[0] || '',
          });
        }

        setShowResetDialog(false);
        // Optional: Show success message
        alert(tComponents('successReset'));
      } else {
        throw new Error(data.error || tErrors('resetQuizFailed'));
      }
    } catch (error) {
      console.error('Error resetting quiz:', error);
      alert(tErrors('resetQuiz'));
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
              {editingDisplayName ? (
                <div className="flex gap-2">
                  <Input
                    id="displayName"
                    value={tempDisplayName}
                    placeholder={tComponents('placeholderName')}
                    onChange={(e) => setTempDisplayName(e.target.value)}
                    disabled={profileLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={saveDisplayName}
                    disabled={profileLoading || !tempDisplayName.trim()}
                    size="sm"
                  >
                    {profileLoading ? '...' : 'Speichern'}
                  </Button>
                  <Button
                    onClick={cancelEditingDisplayName}
                    variant="outline"
                    disabled={profileLoading}
                    size="sm"
                  >
                    Abbrechen
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="displayName"
                    value={userProfile?.display_name || ''}
                    placeholder={tComponents('placeholderName')}
                    readOnly
                    className="cursor-pointer"
                    onClick={startEditingDisplayName}
                  />
                  <Button
                    onClick={startEditingDisplayName}
                    variant="outline"
                    size="sm"
                  >
                    Bearbeiten
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t('language')}</Label>
              <Select onValueChange={handleLanguageChange} value={userProfile?.locale || 'de'}>
                <SelectTrigger>
                  <SelectValue placeholder={tComponents('selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">{t('german')}</SelectItem>
                  <SelectItem value="en">{t('english')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Gaming Statistics Hub */}
        <Card className="relative overflow-hidden border-2 border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-800 dark:via-blue-900/10 dark:to-green-900/10">
          {/* Background Gaming Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5 opacity-50" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Star className="h-4 w-4 text-white" />
              </div>
              🏆 Gamer-Statistiken
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-2 gap-6">
              {/* XP Stats - Main Achievement */}
              <div className="col-span-2 text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-200/50 dark:border-yellow-700/50">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  {(userStats?.totalXP || 0).toLocaleString()}
                </div>
                <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">{t('totalXP')}</div>
                <div className="w-full h-2 bg-yellow-200 dark:bg-yellow-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((userStats?.totalXP || 0) / 10000 * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Level {Math.floor((userStats?.totalXP || 0) / 1000) + 1}
                </div>
              </div>

              {/* Streak Achievement */}
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200/50 dark:border-orange-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Flame className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  {userStats?.currentStreak || 0}
                </div>
                <div className="text-xs font-semibold text-orange-700 dark:text-orange-300">{t('currentStreak')}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[...Array(Math.min(userStats?.currentStreak || 0, 7))].map((_, i) => (
                    <div key={i} className="w-1 h-3 bg-orange-400 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Accuracy Performance */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200/50 dark:border-green-700/50">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {userStats?.accuracy || 0}%
                </div>
                <div className="text-xs font-semibold text-green-700 dark:text-green-300">{t('accuracy')}</div>
                <div className="w-full h-1.5 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${userStats?.accuracy || 0}%` }}
                  />
                </div>
              </div>

              {/* Total Questions Quest Counter */}
              <div className="col-span-2 text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {userStats?.totalQuestions || 0}
                    </div>
                    <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">{t('totalQuestions')}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(Math.floor((userStats?.totalQuestions || 0) / 50), 10))].map((_, i) => (
                      <div key={i} className="w-2 h-6 bg-blue-400 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badges Row */}
            <div className="mt-6 flex items-center justify-center gap-3">
              {userStats?.currentStreak && userStats.currentStreak >= 7 && (
                <div className="px-3 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Flame className="w-3 h-3" />
                  Streak Master
                </div>
              )}
              {userStats?.accuracy && userStats.accuracy >= 80 && (
                <div className="px-3 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                  <TrendingUp className="w-3 h-3" />
                  Precision Pro
                </div>
              )}
              {userStats?.totalXP && userStats.totalXP >= 5000 && (
                <div className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3" />
                  XP Legend
                </div>
              )}
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
              <Link href={createLocalizedPath(locale, 'kontakt')} className="block">
                <Button variant="outline" className="w-full justify-start h-auto p-3">
                  <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Kontakt</div>
                    <div className="text-xs text-muted-foreground">Support & Fragen</div>
                  </div>
                </Button>
              </Link>

              <Link href={createLocalizedPath(locale, 'ueber-uns')} className="block">
                <Button variant="outline" className="w-full justify-start h-auto p-3">
                  <Shield className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Über uns</div>
                    <div className="text-xs text-muted-foreground">Mission & Team</div>
                  </div>
                </Button>
              </Link>

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
                {tCommon('cancel')}
              </Button>
              <Button
                onClick={handleResetQuiz}
                variant="destructive"
                className="flex-1"
                disabled={resetLoading}
              >
                {resetLoading ? tComponents('resetting') : tComponents('resetting2')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('deleteAccountConfirmTitle')}</h3>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {t('deleteAccountConfirmMessage')}
              </p>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <pre className="text-sm text-red-800 dark:text-red-200 whitespace-pre-line">
                  {t('deleteAccountDataList')}
                </pre>
              </div>


              <div className="space-y-2">
                <Label htmlFor="deleteConfirmation" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('deleteAccountPlaceholder')}
                </Label>
                <Input
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={t('deleteAccountTypeDelete')}
                  className="font-mono text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>

              {deleteError && (
                <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
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
                {tCommon('cancel')}
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
