import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <div className="flex gap-2">
      <Button
        variant={currentLanguage === 'cs' ? 'default' : 'outline'}
        size="sm"
        onClick={() => i18n.changeLanguage('cs')}
      >
        Čeština
      </Button>
      <Button
        variant={currentLanguage === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => i18n.changeLanguage('en')}
      >
        English
      </Button>
    </div>
  );
}