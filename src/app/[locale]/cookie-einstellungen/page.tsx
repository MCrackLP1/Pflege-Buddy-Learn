'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { LEGAL_CONFIG } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Settings, Save } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieEinstellungenPage({ params }: { params: { locale: string } }) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem('cookiePreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({ ...parsed, essential: true }); // Essential always true
      } catch (error) {
        console.error('Failed to parse cookie preferences:', error);
      }
    }
  }, []);

  const handlePreferenceChange = (category: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save to localStorage
      localStorage.setItem('cookiePreferences', JSON.stringify(preferences));

      // Here you would also send to your backend for server-side tracking
      // await saveCookieConsent(preferences);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save cookie preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectAll = () => {
    setPreferences({
      essential: true, // Essential always true
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Cookie-Einstellungen</h1>
        </div>
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Cookie-Präferenzen • Version {LEGAL_CONFIG.versions.cookie}
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
          <CardDescription>
            Mit einem Klick alle Cookies akzeptieren oder ablehnen
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={handleAcceptAll} variant="default">
            Alle akzeptieren
          </Button>
          <Button onClick={handleRejectAll} variant="outline">
            Nur essenzielle Cookies
          </Button>
        </CardContent>
      </Card>

      {/* Cookie Categories */}
      <div className="space-y-6">
        {Object.entries(LEGAL_CONFIG.cookieCategories).map(([key, category]) => (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  {category.required && (
                    <Badge variant="secondary">Erforderlich</Badge>
                  )}
                </div>
                <Switch
                  checked={preferences[key as keyof CookiePreferences]}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange(key as keyof CookiePreferences, checked)
                  }
                  disabled={category.required}
                />
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Anbieter:</Label>
                <p className="text-sm text-muted-foreground">
                  {category.providers.join(', ') || 'Keine'}
                </p>
              </div>

              {category.required && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Erforderlich:</strong> Diese Cookies sind für den Betrieb der Website
                    unbedingt notwendig und können nicht deaktiviert werden.
                  </p>
                </div>
              )}

              {!category.required && (
                <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Optional:</strong> Diese Cookies verbessern Ihr Nutzererlebnis,
                    sind aber nicht zwingend erforderlich.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Ihre Einstellungen werden lokal in Ihrem Browser gespeichert.
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>Speichere...</>
          ) : isSaved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Gespeichert
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Einstellungen speichern
            </>
          )}
        </Button>
      </div>

      {/* Additional Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 text-sm">
            <p>
              <strong>Änderungen wirksam:</strong> Ihre neuen Einstellungen werden sofort
              wirksam. Bereits gesetzte Cookies werden beim nächsten Besuch entfernt,
              wenn Sie die entsprechende Kategorie deaktiviert haben.
            </p>
            <p>
              <strong>Browser-Einstellungen:</strong> Zusätzlich zu diesen Einstellungen
              können Sie Cookies auch in Ihrem Browser verwalten oder blockieren.
            </p>
            <p>
              <strong>Rechtsgrundlage:</strong> Die Verwendung nicht-essentieller Cookies
              erfolgt nur mit Ihrer ausdrücklichen Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
