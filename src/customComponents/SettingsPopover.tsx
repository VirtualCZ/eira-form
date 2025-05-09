import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Settings } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { Input } from '@/components/ui/input';
import { useRef } from 'react';
import FormInput from './FormInput';
import { Control } from 'react-hook-form';
import { FormData } from '@/schemas/formSchema';

export default function SettingsPopover({ onClear, onExportJSON, onImportJSON, formControl }: {
  onClear: () => void,
  onExportJSON: () => void
  onImportJSON: (file: File) => void
  formControl: Control<FormData>
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 flex flex-col gap-2">
        <Button
          variant="destructive"
          onClick={() => {
            onClear()
            onClear()
          }}
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
        <FormInput
          name="givenCode"
          formLabel={t('form.labels.givenCode')}
          formControl={formControl}
          formPlaceholder="XXXXX"
          inputType='number'
        />
        <LanguageSwitcher />
      </PopoverContent>
    </Popover>
  );
}