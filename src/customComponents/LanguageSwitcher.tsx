import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        className="flex-1"
        variant={currentLanguage === 'cs' ? 'default' : 'outline'}
        size="sm"
        onClick={() => i18n.changeLanguage('cs')}
      >
        Čeština
      </Button>
      <Button
        className="flex-1"
        variant={currentLanguage === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => i18n.changeLanguage('en')}
      >
        English
      </Button>
    </div>
  );
}