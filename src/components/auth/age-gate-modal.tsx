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
import { Info, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AgeGateModal({ isOpen, onConfirm, onCancel }: AgeGateModalProps) {
  const [isOver16, setIsOver16] = useState(false);
  const t = useTranslations('legal.ageGate');
  const tc = useTranslations('common');

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
              <strong>{t('legalNoticeTitle')}</strong> {t('legalNotice')}
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
                  {t('confirmAge')}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('confirmAgeDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {t('privacyConsequencesTitle')}
                </p>
                <div className="text-blue-800 dark:text-blue-200 mt-2 space-y-1 text-xs whitespace-pre-line">
                  {t('privacyConsequences')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              {tc('cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!isOver16}
              className="flex-1"
            >
              {t('proceed')}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {t('contactNote')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
