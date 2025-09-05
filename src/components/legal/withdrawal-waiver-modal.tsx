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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('legal.withdrawal');
  const tc = useTranslations('common');

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
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Wichtig:</strong> {t('importantNotice')}
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
                  {t('consent1')}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('consent1Desc')}
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
                  {t('consent2')}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('consent2Desc')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {t('legalConsequencesTitle')}
                </p>
                <div className="text-blue-800 dark:text-blue-200 mt-2 space-y-1 text-sm whitespace-pre-line">
                  {t('legalConsequences', { version: LEGAL_CONFIG.versions.withdrawal })}
                </div>
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
              {tc('cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canProceed || isLoading}
              className="flex-1"
            >
              {isLoading ? t('processing') : t('agreeAndBuy')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t('moreInfo')}{' '}
            <a
              href="/widerruf"
              className="underline hover:no-underline"
              target="_blank"
              rel="noopener"
            >
              {t('withdrawalPolicyLink')}
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
