import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Settings } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { Input } from '@/components/ui/input';
import { useRef, useState, useEffect } from 'react';
import { Control, useWatch, UseFormSetValue } from 'react-hook-form';
import { FormData } from '@/schemas/formSchema';
import { Label } from '@/components/ui/label';
import { isValidCode, MAX_CODE_LENGTH } from '@/lib/codeUtils';

export default function SettingsPopover({ onClear, onExportJSON, onExportAPI, onImportJSON, onCodeChange, formControl, setValue }: {
  onClear: () => void,
  onExportJSON: () => void
  onExportAPI?: () => void
  onImportJSON: (file: File) => void
  onCodeChange?: (value: string) => void
  formControl: Control<FormData>
  setValue: UseFormSetValue<FormData>
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null)
  const code = useWatch({ control: formControl, name: 'givenCode' });
  const [isOpen, setIsOpen] = useState(false);
  const [localCodeInput, setLocalCodeInput] = useState('');
  const [lastValidCode, setLastValidCode] = useState('');
  
  // Sync local input with form code when popover opens/closes
  useEffect(() => {
    if (isOpen) {
      // When opening, initialize with current code and remember last valid code
      setLocalCodeInput(code || '');
      setLastValidCode(isValidCode(code) ? code : '');
    }
  }, [isOpen, code]);
  
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handlePopoverOpenChange = (open: boolean) => {
    if (!open) {
      // Popover is closing - validate and handle code
      const trimmedCode = localCodeInput.trim();
      
      if (isValidCode(trimmedCode)) {
        // Valid code - trigger change (will load new data and save)
        if (onCodeChange) {
          onCodeChange(trimmedCode);
        }
      } else {
        // Invalid code - revert to last valid code (don't trigger load)
        if (isValidCode(lastValidCode)) {
          // Revert form value to last valid code without loading
          setValue('givenCode', lastValidCode);
        }
      }
    }
    setIsOpen(open);
  }

  return (
    <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 flex flex-col gap-2">
        <Button
          variant="destructive"
          onClick={onClear}
          className="w-full"
        >
          {t('form.buttons.clearForm')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleImportClick}
        >
          {t('form.buttons.importJSON')}
        </Button>
        <Input
          type="file"
          ref={fileInputRef}
          accept=".json"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0] && onImportJSON) {
              onImportJSON(e.target.files[0])
            }
          }}
        />
        <Button
          variant="outline"
          onClick={onExportJSON}
          className="w-full"
        >
          {t('form.buttons.exportJSON')}
        </Button>
        {onExportAPI && (
          <Button
            variant="outline"
            onClick={onExportAPI}
            className="w-full"
          >
            {t('form.buttons.exportAPI')}
          </Button>
        )}
        <div>
          <Label className="text-sm font-medium mb-1 block">{t('form.labels.givenCode')}</Label>
          <Input
            type="text"
            placeholder={t('form.placeholders.givenCode')}
            value={localCodeInput}
            maxLength={MAX_CODE_LENGTH}
            onChange={(e) => {
              setLocalCodeInput(e.target.value);
            }}
          />
        </div>
        <LanguageSwitcher />
      </PopoverContent>
    </Popover>
  );
}