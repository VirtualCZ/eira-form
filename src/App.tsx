import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ModalProvider } from '@/components/ModalSystem';
import { ProgressBar } from '@/components/ProgressIndicator';
import { StickyNavigation } from '@/components/StickyNavigation';
import { useFormState } from '@/hooks/useFormState';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useAccessibility } from '@/hooks/useAccessibility';
import { createEiraSubmissionService } from '@/services/FormSubmissionService';
import { useModal } from '@/components/ModalSystem';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isValidCode, MAX_CODE_LENGTH } from '@/lib/codeUtils';

// Lazy load tab components for better performance
const PersonalInformationTab = React.lazy(() => import('@/tabs/PersonalInformationTab').then(m => ({ default: m.PersonalInformationTab })));
const AddressesTab = React.lazy(() => import('@/tabs/AddressesTab').then(m => ({ default: m.AddressesTab })));
const ContactsTab = React.lazy(() => import('@/tabs/ContactsTab').then(m => ({ default: m.ContactsTab })));
const ForeignersTab = React.lazy(() => import('@/tabs/ForeignersTab').then(m => ({ default: m.ForeignersTab })));
const EmploymentTab = React.lazy(() => import('@/tabs/EmploymentTab').then(m => ({ default: m.EmploymentTab })));
const EducationAndLanguagesTab = React.lazy(() => import('@/tabs/EducationAndLanguagesTab').then(m => ({ default: m.EducationAndLanguagesTab })));
const HealthAndSocialInfoTab = React.lazy(() => import('@/tabs/HealthAndSocialInfoTab').then(m => ({ default: m.HealthAndSocialInfoTab })));
const LegalInfoTab = React.lazy(() => import('@/tabs/LegalInfoTab').then(m => ({ default: m.LegalInfoTab })));
const FamilyAndChildrenTab = React.lazy(() => import('@/tabs/FamilyAndChildrenTab').then(m => ({ default: m.FamilyAndChildrenTab })));
const DocumentsTab = React.lazy(() => import('@/tabs/DocumentsTab').then(m => ({ default: m.DocumentsTab })));
const AgreementsTab = React.lazy(() => import('@/tabs/AgreementsTab').then(m => ({ default: m.AgreementsTab })));

const TabContent: React.FC<{ tabId: string; form: any }> = ({ tabId, form }) => {
  const tabComponents = {
    personalInformation: PersonalInformationTab,
    addresses: AddressesTab,
    contacts: ContactsTab,
    foreigners: ForeignersTab,
    employment: EmploymentTab,
    educationAndLanguages: EducationAndLanguagesTab,
    healthAndSocialInfo: HealthAndSocialInfoTab,
    legalInfo: LegalInfoTab,
    familyAndChildren: FamilyAndChildrenTab,
    documents: DocumentsTab,
    agreements: AgreementsTab
  };

  const TabComponent = tabComponents[tabId as keyof typeof tabComponents];
  
  if (!TabComponent) {
    return <div>Tab not found</div>;
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <TabComponent control={form.control} errors={form.formState.errors} />
    </Suspense>
  );
};

const FormTabsTrigger: React.FC<{
  value: string;
  label: string;
  error?: boolean;
  disabled?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}> = ({ value, label, error, disabled, isActive, onClick }) => {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
        "hover:bg-gray-100 focus:outline-none",
        isActive && "bg-gray-900 text-white hover:bg-gray-800",
        error && !isActive && "bg-red-50 text-red-700 hover:bg-red-100",
        error && isActive && "bg-red-600 text-white hover:bg-red-700",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      data-value={value}
      disabled={disabled}
      onClick={onClick}
      aria-current={isActive ? "true" : "false"}
      aria-describedby={error ? `${value}-error` : undefined}
    >
      {label}
      {error && <AlertCircle className="w-4 h-4" aria-hidden="true" />}
    </button>
  );
};

const MainApp: React.FC = () => {
  const { t } = useTranslation();
  const { form, formState, actions, setIsSubmitting, clearKey } = useFormState();
  const { getValidationResult, formatErrorMessage } = useFormValidation();
  const { showError, showSuccess, showLoading, showValidationErrors, hideModal } = useModal();
  const submissionService = createEiraSubmissionService();
  const [showCodeModal, setShowCodeModal] = React.useState(false);
  const [codeInput, setCodeInput] = React.useState('');
  
  const {
    state: navState,
    actions: navActions,
    tabsListRef,
    canScroll
  } = useTabNavigation(
    form.watch(),
    form.formState.errors,
    form.trigger
  );

  const {
    announceValidation,
    announceProgress,
    setFocusToFirstError
  } = useAccessibility();

  // Calculate validation state
  const validationResult = getValidationResult(
    form.formState.errors,
    navState.tabs.reduce((acc, tab) => {
      acc[tab.id] = tab.fields;
      return acc;
    }, {} as Record<string, string[]>)
  );

  const errorTabs = Object.entries(validationResult.tabErrors)
    .filter(([, errors]) => errors.length > 0)
    .map(([tabId]) => tabId);

  // Handle form submission
  const handleSubmit = async (data: any) => {
    const loadingId = showLoading(
      t('form.modal.sending'),
      t('form.modal.sendingMessage')
    );

    try {
      setIsSubmitting(true);
      
      // Validate form before submission
      const validation = await submissionService.validateForm(data);
      if (!validation.success) {
        hideModal(loadingId);
        showValidationErrors(validation.errors || [], t('form.modal.validationErrorTitle'));
        return;
      }

      // Submit form
      const result = await submissionService.submitForm(data);
      
      hideModal(loadingId);
      
      if (result.success) {
        actions.clear();
        showSuccess(
          t('form.modal.success'),
          t('form.modal.submitSuccessMessage')
        );
        announceProgress(100);
      } else {
        showError(
          t('form.modal.error'),
          result.message
        );
      }
    } catch (error) {
      hideModal(loadingId);
      showError(
        t('form.modal.error'),
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvalid = (errors: any) => {
    // Create tab fields map for error grouping
    const tabFieldsMap = navState.tabs.reduce((acc, tab) => {
      acc[tab.id] = tab.fields;
      return acc;
    }, {} as Record<string, string[]>);
    
    const validationResult = getValidationResult(errors, tabFieldsMap);
    
    // Format errors with tab information
    const errorMessages = validationResult.errors.map(error => {
      // Find which tab this error belongs to
      const tabId = Object.entries(tabFieldsMap).find(([, fields]) =>
        fields.some(field => error.field.startsWith(field))
      )?.[0];
      
      const formattedMessage = formatErrorMessage(error);
      
      if (tabId) {
        const tabLabel = t(navState.tabs.find(t => t.id === tabId)?.label || tabId);
        return `${tabLabel}: ${formattedMessage}`;
      }
      
      return formattedMessage;
    });
    
    showValidationErrors(errorMessages, t('form.modal.validationErrorTitle'));
    announceValidation(false, errorMessages);
    
    // Focus on first error field
    if (errorMessages.length > 0) {
      const firstErrorField = validationResult.errors[0]?.field;
      if (firstErrorField) {
        setFocusToFirstError([firstErrorField]);
      }
    }
  };

  const handleTabChange = async (tabId: string) => {
    const success = await navActions.goToTab(tabId);
    if (success) {
      announceProgress(formState.progress);
    }
  };

  const handleNext = async () => {
    const success = await navActions.goNext();
    if (success) {
      announceProgress(formState.progress);
    }
  };

  const handlePrevious = async () => {
    const success = await navActions.goPrevious();
    if (success) {
      announceProgress(formState.progress);
    }
  };

  const handleExport = () => {
    actions.exportData();
    showSuccess('Export Successful', 'Form data has been exported to your downloads folder.');
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      actions.importData(data);
      showSuccess('Import Successful', 'Form data has been imported successfully.');
    } catch (error) {
      showError('Import Failed', 'Invalid file format. Please select a valid JSON file.');
    }
  };

  // Check for code in URL or localStorage on mount
  React.useEffect(() => {
    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    
    if (isValidCode(codeFromUrl || undefined)) {
      // Load data for the code from URL - loadDataForCode will set the code field
      actions.loadDataForCode(codeFromUrl as string).catch(err => console.error('Error loading data for code:', err));
    } else {
      // Check if code exists in localStorage
      const lastCode = localStorage.getItem('eira-form-last-code');
      if (isValidCode(lastCode || undefined)) {
        // Load data for the last used code - loadDataForCode will set the code field
        actions.loadDataForCode(lastCode as string).catch(err => console.error('Error loading data for code:', err));
      } else {
        // No code found - show modal
        setShowCodeModal(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleCodeSubmit = async () => {
    const trimmedCode = codeInput.trim();
    if (isValidCode(trimmedCode)) {
      // Load data for the entered code - loadDataForCode will set the code field
      await actions.loadDataForCode(trimmedCode).catch(err => console.error('Error loading data for code:', err));
      setShowCodeModal(false);
      setCodeInput('');
    }
  };

  // Handle code change from settings popover
  const handleCodeChange = async (newCode: string) => {
    if (isValidCode(newCode)) {
      const currentCode = form.getValues('givenCode');
      
      // Only switch if code actually changed
      if (newCode !== currentCode) {
        // IMPORTANT: Save current data to old code BEFORE reloading
        if (isValidCode(currentCode)) {
          await actions.saveDataForCode(currentCode).catch(err => console.error('Error saving data for current code:', err));
        }
        
        // Update URL with new code and reload the page
        const url = new URL(window.location.href);
        url.searchParams.set('code', newCode);
        window.location.href = url.toString();
      } else {
        // Code is the same - just update URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.set('code', newCode);
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('app.title')}
                </h1>
          
          <div className="flex items-center gap-4 mb-4">
            <ProgressBar progress={navState.progress} className="flex-1" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {navState.progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto p-4">
        <Form {...form} key={clearKey}>
          <form onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}>
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                  <button
                    type="button"
                  onClick={() => navActions.scrollTabs('left')}
                    disabled={!canScroll.left}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  aria-label={t('app.ariaLabels.scrollTabsLeft')}
                  >
                  <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div
                    ref={tabsListRef}
                  className="flex-1 overflow-x-auto scrollbar-hide px-2"
                  role="tablist"
                  aria-label={t('app.ariaLabels.formSections')}
                  >
                  <div className="flex gap-2 min-w-max py-1">
                    {navState.visibleTabs.map((tab) => (
                        <FormTabsTrigger
                        key={tab.id}
                        value={tab.id}
                        label={t(tab.label)}
                        error={errorTabs.includes(tab.id)}
                        disabled={tab.id === 'foreigners' && form.watch('foreigner') !== 'yes'}
                        isActive={navState.activeTab === tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        />
                      ))}
                  </div>
                  </div>

                  <button
                    type="button"
                  onClick={() => navActions.scrollTabs('right')}
                    disabled={!canScroll.right}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                  aria-label={t('app.ariaLabels.scrollTabsRight')}
                  >
                  <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 pb-20">
              <TabContent tabId={navState.activeTab} form={form} />
            </div>
          </div>
            </form>
          </Form>
      </div>

      {/* Sticky Navigation */}
      <StickyNavigation
        canGoPrevious={navState.canGoPrevious}
        canGoNext={navState.canGoNext}
        isSubmitting={formState.isSubmitting}
        isLastPage={navState.activeTab === 'agreements'}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        onClear={actions.clear}
        onExport={handleExport}
        onImport={handleImport}
        onCodeChange={handleCodeChange}
        formControl={form.control}
        setValue={form.setValue}
      />
      
      {/* Code Entry Modal */}
      <Dialog open={showCodeModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('form.labels.givenCode')}</DialogTitle>
            <DialogDescription>
              {t('form.modal.givenCodeDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder={t('form.placeholders.givenCode')}
              value={codeInput}
              maxLength={MAX_CODE_LENGTH}
              onChange={(e) => setCodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isValidCode(codeInput.trim())) {
                  handleCodeSubmit();
                }
              }}
            />
            <Button
              className="w-full"
              onClick={handleCodeSubmit}
              disabled={!isValidCode(codeInput.trim())}
            >
              {t('form.buttons.submitCode')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ModalProvider>
        <MainApp />
      </ModalProvider>
    </ErrorBoundary>
  );
};

export default App;
