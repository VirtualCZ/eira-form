import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Settings } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function SettingsPopover({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation();

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
          onClick={onClear}
          className="w-full"
        >
          {t('form.buttons.clearForm')}
        </Button>
        <LanguageSwitcher />
      </PopoverContent>
    </Popover>
  );
}