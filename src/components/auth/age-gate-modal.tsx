'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Shield } from 'lucide-react';
import { LEGAL_CONFIG } from '@/lib/constants';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AgeGateModal({ isOpen, onConfirm, onCancel }: AgeGateModalProps) {
  const [isOver16, setIsOver16] = useState(false);
  const t = useTranslations();

  const handleConfirm = () => {
    if (isOver16) {
      onConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-500" />
            Altersüberprüfung
          </DialogTitle>
          <DialogDescription>
            Bevor Sie fortfahren, müssen wir Ihr Alter bestätigen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Wichtiger rechtlicher Hinweis:</strong> Gemäß Art. 8 DSGVO
              in Verbindung mit § 25 Abs. 1 KDG ist die Nutzung unserer App nur
              für Personen ab 16 Jahren erlaubt.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="age-verification"
                checked={isOver16}
                onCheckedChange={(checked) => setIsOver16(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="age-verification" className="text-sm font-medium cursor-pointer">
                  Ich bestätige, dass ich mindestens 16 Jahre alt bin.
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Diese App ist nicht für Kinder und Jugendliche unter 16 Jahren bestimmt.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Datenschutzrechtliche Folgen:
                </p>
                <ul className="text-blue-800 dark:text-blue-200 mt-2 space-y-1 text-xs">
                  <li>• Bei Bestätigung: Fortsetzung mit der Anmeldung</li>
                  <li>• Bei fehlender Bestätigung: Kein Zugriff auf die App möglich</li>
                  <li>• Keine Speicherung personenbezogener Daten von unter 16-Jährigen</li>
                  <li>• Sofortige Löschung bei nachträglichem Bekanntwerden</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isOver16}
              className="flex-1"
            >
              Fortfahren
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Bei Fragen zu unserer Datenschutzpraxis kontaktieren Sie uns bitte.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
