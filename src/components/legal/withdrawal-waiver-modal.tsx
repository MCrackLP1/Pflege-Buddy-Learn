'use client';

import { useState } from 'react';
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
import { Info, CheckCircle } from 'lucide-react';
import { LEGAL_CONFIG } from '@/lib/constants';

interface WithdrawalWaiverModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WithdrawalWaiverModal({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false
}: WithdrawalWaiverModalProps) {
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);

  const canProceed = consent1 && consent2;

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-500" />
            Widerrufsverzicht für digitale Inhalte
          </DialogTitle>
          <DialogDescription>
            Bevor Sie mit dem Kauf fortfahren, müssen Sie den folgenden rechtlichen Hinweisen zustimmen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Wichtig:</strong> Bei digitalen Inhalten (wie virtuellen Hinweisen) erlischt
              Ihr 14-tägiges Widerrufsrecht, wenn die Ausführung des Vertrags mit Ihrer Zustimmung
              vor Ablauf der Widerrufsfrist beginnt (§ 356 Abs. 5 BGB).
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent1"
                checked={consent1}
                onCheckedChange={(checked) => setConsent1(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="consent1" className="text-sm font-medium cursor-pointer">
                  Ich stimme zu, dass mit der Ausführung des Vertrags vor Ablauf der
                  Widerrufsfrist begonnen wird.
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Die virtuellen Gegenstände werden sofort nach Zahlungseingang Ihrem Konto gutgeschrieben.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent2"
                checked={consent2}
                onCheckedChange={(checked) => setConsent2(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="consent2" className="text-sm font-medium cursor-pointer">
                  Mir ist bekannt, dass ich dadurch mein Widerrufsrecht verliere.
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Nach Beginn der Ausführung besteht kein Anspruch auf Rückerstattung mehr.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Rechtliche Folgen:
                </p>
                <ul className="text-blue-800 dark:text-blue-200 mt-2 space-y-1">
                  <li>• Die virtuellen Gegenstände werden sofort nach Kauf verfügbar</li>
                  <li>• Sie können danach nicht mehr zurückgegeben werden</li>
                  <li>• Eine Erstattung ist nur bei Mängeln oder gesetzlichen Ausnahmen möglich</li>
                  <li>• Diese Zustimmung wird versioniert gespeichert ({LEGAL_CONFIG.versions.withdrawal})</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canProceed || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Verarbeitung...' : 'Zustimmen & Kaufen'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Weitere Informationen finden Sie in unserer{' '}
            <a
              href="/widerruf"
              className="underline hover:no-underline"
              target="_blank"
              rel="noopener"
            >
              Widerrufsbelehrung
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
