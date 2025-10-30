import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { FormData } from '@/schemas/formSchema';
import { hasFieldData } from '@/lib/formDataUtils';

export interface TabConfig {
  id: string;
  label: string;
  fields: (keyof FormData)[];
  isVisible: (data: Partial<FormData>) => boolean;
  isComplete: (data: Partial<FormData>, errors: any) => boolean;
}

export interface TabNavigationState {
  activeTab: string;
  tabs: TabConfig[];
  visibleTabs: TabConfig[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  progress: number;
}

export interface TabNavigationActions {
  goToTab: (tabId: string) => Promise<boolean>;
  goNext: () => Promise<boolean>;
  goPrevious: () => Promise<boolean>;
  scrollToTab: (tabId: string) => void;
  scrollTabs: (direction: 'left' | 'right') => void;
}

const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'personalInformation',
    label: 'form.tabs.personalInformation',
    fields: [
      'titleBeforeName', 'titleAfterName', 'honorific', 'firstName', 'lastName', 'birthSurname',
      'dateOfBirth', 'sex', 'placeOfBirth', 'maritalStatus', 'foreigner', 'birthNumber',
      'foreignBirthNumber', 'insuranceBirthNumber', 'passportNumber', 'passportIssuedBy',
      'citizenship', 'nationality', 'bankingInstitutionName', 'bankAccountNumber',
      'bankCode', 'healthInsurance', 'insuranceRegistrationNumber'
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['honorific', 'firstName', 'lastName', 'dateOfBirth', 'sex', 'placeOfBirth', 'maritalStatus', 'foreigner', 'birthNumber'];
      return requiredFields.every(field => data[field as keyof FormData] && !errors[field]);
    }
  },
  {
    id: 'addresses',
    label: 'form.tabs.addresses',
    fields: [
      'permanentStreet', 'permanentHouseNumber', 'permanentOrientationNumber', 'permanentCity',
      'permanentPostalCode', 'permanentCountry', 'contactSameAsPermanentAddress',
      'contactStreet', 'contactHouseNumber', 'contactOrientationNumber', 'contactCity',
      'contactPostalCode', 'contactCountry'
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['permanentStreet', 'permanentHouseNumber', 'permanentCity', 'permanentPostalCode', 'permanentCountry', 'contactSameAsPermanentAddress'];
      return requiredFields.every(field => data[field as keyof FormData] && !errors[field]);
    }
  },
  {
    id: 'contacts',
    label: 'form.tabs.contacts',
    fields: ['email', 'phone', 'dataBoxId'],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['email', 'phone'];
      return requiredFields.every(field => data[field as keyof FormData] && !errors[field]);
    }
  },
  {
    id: 'foreigners',
    label: 'form.tabs.foreigners',
    fields: [
      'foreignPermanentAddress', 'residencePermitNumber', 'residencePermitValidityFrom',
      'residencePermitValidityUntil', 'residencePermitType', 'residencePermitPurpose'
    ],
    isVisible: (data) => data.foreigner === 'yes',
    isComplete: (data, errors) => {
      if (data.foreigner !== 'yes') return true;
      const requiredFields = ['foreignPermanentAddress', 'residencePermitNumber'];
      return requiredFields.every(field => data[field as keyof FormData] && !errors[field]);
    }
  },
  {
    id: 'employment',
    label: 'form.tabs.employment',
    fields: [
      'employmentClassification', 'jobPosition', 'firstJobInCz', 'lastEmployer',
      'lastJobType', 'lastJobPeriodFrom', 'lastJobPeriodTo'
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const baseRequired = ['firstJobInCz'];
      const extraIfNo = ['lastEmployer', 'lastJobType', 'lastJobPeriodFrom', 'lastJobPeriodTo'];
      const requiredFields = data.firstJobInCz === 'no' ? [...baseRequired, ...extraIfNo] : baseRequired;
      return requiredFields.every(field => data[field as keyof FormData] && !errors[field]);
    }
  },
  {
    id: 'educationAndLanguages',
    label: 'form.tabs.educationAndLanguages',
    fields: [
      'highestEducation', 'highestEducationSchool', 'fieldOfStudy',
      'graduationYear', 'studyCity', 'languageSkills'
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['highestEducation', 'highestEducationSchool', 'fieldOfStudy', 'graduationYear', 'studyCity'];
      return requiredFields.every(field => data[field as keyof FormData] && !errors[field]);
    }
  },
  {
    id: 'healthAndSocialInfo',
    label: 'form.tabs.healthAndSocialInfo',
    fields: [
      'hasDisability', 'disabilityType', 'disabilityDecisionDate', 'receivesPension',
      'pensionType', 'pensionDecisionDate'
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const baseRequired = ['hasDisability', 'receivesPension'];
      const extraDisability = ['disabilityType', 'disabilityDecisionDate'];
      const extraPension = ['pensionType', 'pensionDecisionDate'];
      const requiredWhenYes: string[] = [];
      if (data.hasDisability === 'yes') requiredWhenYes.push(...extraDisability);
      if (data.receivesPension === 'yes') requiredWhenYes.push(...extraPension);
      const requiredFields = [...baseRequired, ...requiredWhenYes];
      return requiredFields.every(field => data[field as keyof FormData] && !errors[field]);
    }
  },
  {
    id: 'legalInfo',
    label: 'form.tabs.legalInfo',
    fields: [
      'activityBan', 'bannedActivity', 'hasWageDeductions', 'wageDeductionDetails', 'wageDeductionDate'
    ],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['activityBan', 'hasWageDeductions'];
      return requiredFields.every(field => data[field as keyof FormData] && !errors[field]);
    }
  },
  {
    id: 'familyAndChildren',
    label: 'form.tabs.familyAndChildren',
    fields: ['claimChildTaxRelief', 'childrenInfo'],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['claimChildTaxRelief'];
      return requiredFields.every(field => data[field as keyof FormData] && !errors[field]);
    }
  },
  {
    id: 'documents',
    label: 'form.tabs.documents',
    fields: [
      'visaPassport', 'travelDocumentCopy', 'residencePermitCopy', 'highestEducationDocument',
      'childBirthCertificate1', 'childBirthCertificate2', 'childBirthCertificate3', 'childBirthCertificate4',
      'childTaxReliefConfirmation', 'pensionDecision', 'employmentConfirmation'
    ],
    isVisible: () => true,
    isComplete: (data, _errors) => {
      // Documents are conditionally required based on other fields
      if (data.foreigner === 'yes' && (!data.visaPassport || data.visaPassport.length === 0)) return false;
      if (data.receivesPension === 'yes' && (!data.pensionDecision || data.pensionDecision.length === 0)) return false;
      if (data.claimChildTaxRelief === 'yes') {
        const numChildren = data.childrenInfo?.length || 0;
        if (numChildren > 0) {
          // Check if at least the first certificate is uploaded
          const hasChildCertificate = (data.childBirthCertificate1?.length ?? 0) > 0;
          if (!hasChildCertificate) return false;
        }
      }
      return true;
    }
  },
  {
    id: 'agreements',
    label: 'form.tabs.agreements',
    fields: ['confirmationReadEmployeeDeclaration', 'confirmationReadEmailAddressDeclaration'],
    isVisible: () => true,
    isComplete: (data, errors) => {
      const requiredFields = ['confirmationReadEmployeeDeclaration', 'confirmationReadEmailAddressDeclaration'];
      return requiredFields.every(field => data[field as keyof FormData] === true && !errors[field]);
    }
  }
];

export const useTabNavigation = (
  formData: Partial<FormData>,
  formErrors: any,
  triggerValidation: (fields: (keyof FormData)[]) => Promise<boolean>
) => {
  const [activeTab, setActiveTab] = useState('personalInformation');
  const [canScroll, setCanScroll] = useState({ left: false, right: true });
  const tabsListRef = useRef<HTMLDivElement>(null);

  const visibleTabs = useMemo(() => 
    TAB_CONFIGS.filter(tab => tab.isVisible(formData)),
    [formData]
  );

  const progress = useMemo(() => {
    // Build a unique list of enabled fields across visible tabs, including conditional extras
    const enabled = new Set<keyof FormData>();

    visibleTabs.forEach(tab => {
      tab.fields.forEach(f => enabled.add(f));
    });

    // Conditional fields across tabs
    if (formData.firstJobInCz === 'no') {
      (['lastEmployer','lastJobType','lastJobPeriodFrom','lastJobPeriodTo'] as (keyof FormData)[]).forEach(f => enabled.add(f));
    }
    if (formData.hasDisability === 'yes') {
      (['disabilityType','disabilityDecisionDate'] as (keyof FormData)[]).forEach(f => enabled.add(f));
    }
    if (formData.receivesPension === 'yes') {
      (['pensionType','pensionDecisionDate'] as (keyof FormData)[]).forEach(f => enabled.add(f));
    }
    if (formData.activityBan === 'yes') {
      (['bannedActivity'] as (keyof FormData)[]).forEach(f => enabled.add(f));
    }
    if (formData.hasWageDeductions === 'yes') {
      (['wageDeductionDetails','wageDeductionDate'] as (keyof FormData)[]).forEach(f => enabled.add(f));
    }
    if (formData.foreigner === 'yes') {
      (['visaPassport'] as (keyof FormData)[]).forEach(f => enabled.add(f));
    }
    if (formData.receivesPension === 'yes') {
      (['pensionDecision'] as (keyof FormData)[]).forEach(f => enabled.add(f));
    }
    if (formData.claimChildTaxRelief === 'yes') {
      (['childBirthCertificate1'] as (keyof FormData)[]).forEach(f => enabled.add(f));
    }

    // Exclude meta fields
    enabled.delete('givenCode' as keyof FormData);
    enabled.delete('_timestamp' as keyof FormData);

    const total = enabled.size;
    if (total === 0) return 0;

    let validCount = 0;
    enabled.forEach((field) => {
      const value = (formData as any)[field];
      const hasData = hasFieldData(value);
      const hasError = Boolean(formErrors?.[field as string]);
      if (hasData && !hasError) validCount++;
    });

    return Math.round((validCount / total) * 100);
  }, [visibleTabs, formData, formErrors]);

  const currentIndex = useMemo(() => 
    visibleTabs.findIndex(tab => tab.id === activeTab),
    [visibleTabs, activeTab]
  );

  const canGoNext = useMemo(() => 
    currentIndex < visibleTabs.length - 1,
    [currentIndex, visibleTabs.length]
  );

  const canGoPrevious = useMemo(() => 
    currentIndex > 0,
    [currentIndex]
  );

  const scrollToTab = useCallback((tabId: string) => {
    setTimeout(() => {
      const tabElement = document.querySelector(`[data-value="${tabId}"]`);
      if (tabElement) {
        tabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    }, 200);
  }, []);

  const scrollTabs = useCallback((direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      const scrollAmount = 120;
      tabsListRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

  const goToTab = useCallback(async (tabId: string): Promise<boolean> => {
    const targetTab = TAB_CONFIGS.find(tab => tab.id === tabId);
    if (!targetTab || !targetTab.isVisible(formData)) return false;

    // Always allow tab switching, but trigger validation to show errors
    const currentTab = TAB_CONFIGS.find(tab => tab.id === activeTab);
    if (currentTab) {
      await triggerValidation(currentTab.fields);
    }

    setActiveTab(tabId);
    scrollToTab(tabId);
    return true;
  }, [activeTab, formData, triggerValidation, scrollToTab]);

  const goNext = useCallback(async (): Promise<boolean> => {
    if (!canGoNext) return false;
    
    const currentTab = TAB_CONFIGS.find(tab => tab.id === activeTab);
    if (currentTab) {
      await triggerValidation(currentTab.fields);
    }

    const nextTab = visibleTabs[currentIndex + 1];
    setActiveTab(nextTab.id);
    scrollToTab(nextTab.id);
    return true;
  }, [canGoNext, activeTab, visibleTabs, currentIndex, triggerValidation, scrollToTab]);

  const goPrevious = useCallback(async (): Promise<boolean> => {
    if (!canGoPrevious) return false;
    
    const currentTab = TAB_CONFIGS.find(tab => tab.id === activeTab);
    if (currentTab) {
      await triggerValidation(currentTab.fields);
    }

    const prevTab = visibleTabs[currentIndex - 1];
    setActiveTab(prevTab.id);
    scrollToTab(prevTab.id);
    return true;
  }, [canGoPrevious, activeTab, visibleTabs, currentIndex, triggerValidation, scrollToTab]);

  // Update scroll state
  useEffect(() => {
    const container = tabsListRef.current;
    if (!container) return;

    const checkScroll = () => {
      const canScrollLeft = container.scrollLeft > 0;
      const canScrollRight = container.scrollLeft + container.clientWidth < container.scrollWidth;
      setCanScroll({ left: canScrollLeft, right: canScrollRight });
    };

    container.addEventListener('scroll', checkScroll);
    checkScroll();

    return () => container.removeEventListener('scroll', checkScroll);
  }, []);

  const state: TabNavigationState = {
    activeTab,
    tabs: TAB_CONFIGS,
    visibleTabs,
    canGoNext,
    canGoPrevious,
    progress
  };

  const actions: TabNavigationActions = {
    goToTab,
    goNext,
    goPrevious,
    scrollToTab,
    scrollTabs
  };

  return {
    state,
    actions,
    tabsListRef,
    canScroll
  };
};
