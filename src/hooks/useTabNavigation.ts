import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { FormData } from '@/schemas/formSchema';
import { hasFieldData, isFieldVisible as isFormFieldVisible } from '@/lib/formDataUtils';
import { getTabConfigs, type TabConfig } from '@/config/tabConfigs';
import { isIcuk } from '@/config/formVariants';

export type { TabConfig };

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

export const useTabNavigation = (
  formData: Partial<FormData>,
  formErrors: any,
  triggerValidation: (fields: string[] | readonly string[]) => Promise<boolean>
) => {
  const [activeTab, setActiveTab] = useState('personalInformation');
  const [canScroll, setCanScroll] = useState({ left: false, right: true });
  const tabsListRef = useRef<HTMLDivElement>(null);

  const tabConfigs = useMemo(() => getTabConfigs(), []);

  const visibleTabs = useMemo(
    () => tabConfigs.filter((tab) => tab.isVisible(formData)),
    [formData, tabConfigs]
  );

  const progress = useMemo(() => {
    // Helper to check if a field is visible based on conditional logic
    const isFieldVisible = (field: keyof FormData): boolean => isFormFieldVisible(field, formData);

    // Helper to check if a field is conditionally required (becomes required based on other fields)
    const isConditionallyRequiredField = (field: keyof FormData): boolean => {
      // Contact address fields - required when contactSameAsPermanentAddress === 'no'
      const contactFields = ['contactStreet', 'contactHouseNumber', 'contactCity', 'contactPostalCode', 'contactCountry'];
      if (contactFields.includes(field as string)) {
        return formData.contactSameAsPermanentAddress === 'no';
      }
      
      // Last job fields - required when firstJobInCz === 'no'
      const lastJobFields = ['lastEmployer', 'lastJobType', 'lastJobPeriodFrom', 'lastJobPeriodTo'];
      if (lastJobFields.includes(field as string)) {
        return formData.firstJobInCz === 'no';
      }

      if (isIcuk()) {
        if ((field === 'idCardNumber' || field === 'idCardIssuedBy') && formData.foreigner === 'no') return true;
        if ((field === 'otherEmployerName' || field === 'otherEmployerSeat') && formData.hasOtherEmployment === 'yes') {
          return true;
        }
      }
      
      // languageExamType - required when languageProficiency is set and not 'none' or 'native'
      if (field === 'languageExamType' && formData.languageSkills) {
        // Check if any language skill has proficiency that requires exam type
        const skills = formData.languageSkills as any[];
        return skills.some((skill: any) => 
          skill?.languageProficiency && 
          skill.languageProficiency !== 'none' && 
          skill.languageProficiency !== 'native'
        );
      }
      
      return false;
    };

    // Optional fields that are ALWAYS optional (never required)
    // These are fields marked as .optional() or .nullable().optional() in the schema
    // AND never become required through .when() conditions
    const alwaysOptionalFields = new Set([
      'titleBeforeName', 'titleAfterName', 'birthSurname',
      'foreignBirthNumber', 'insuranceBirthNumber', 'passportNumber', 'passportIssuedBy', 'passportValidityUntil',
      'citizenship', 'nationality', 
      'permanentOrientationNumber', 'contactOrientationNumber',
      'dataBoxId',
      'residencePermitValidityFrom', 'residencePermitValidityUntil', 'residencePermitType', 'residencePermitPurpose',
      'jobPosition',
      'childrenInfo',
      'travelDocumentCopy', 'residencePermitCopy', 'highestEducationDocument',
      'childBirthCertificate2', 'childBirthCertificate3', 'childBirthCertificate4',
      'childTaxReliefConfirmation', 'employmentConfirmation',
      ...(isIcuk() ? ['spouseFullName'] : []),
    ]);

    // Helper to check if a document field is conditionally required
    const isDocumentRequired = (field: keyof FormData): boolean => {
      if (field === 'visaPassport' && formData.foreigner === 'yes') return true;
      if (field === 'pensionDecision' && formData.receivesPension === 'yes') return true;
      if (field === 'childBirthCertificate1' && formData.claimChildTaxRelief === 'yes') {
        const numChildren = (formData.childrenInfo as any[])?.length || 0;
        return numChildren > 0;
      }
      if (isIcuk()) {
        if (
          field === 'highestEducationDocument' ||
          field === 'employmentConfirmation' ||
          field === 'criminalRecordExtract'
        ) {
          return true;
        }
        if (field === 'travelDocumentCopy' || field === 'residencePermitCopy') {
          return formData.foreigner === 'yes';
        }
        if (field === 'childTaxReliefConfirmation' && formData.claimChildTaxRelief === 'yes') return true;
        if (field === 'laborOfficeEvidenceConfirmation' && formData.registeredAtLaborOffice === 'yes') return true;
        if (field === 'studyConfirmation' && formData.isStudent === 'yes') return true;
      }
      return false;
    };

    // Build a unique list of enabled fields across visible tabs
    const enabled = new Set<keyof FormData>();
    
    visibleTabs.forEach(tab => {
      tab.fields.forEach(f => {
        if (isFieldVisible(f)) {
          const value = (formData as any)[f];
          const isAlwaysOptional = alwaysOptionalFields.has(f as string);
          const isConditionallyReq = isConditionallyRequiredField(f) || isDocumentRequired(f);
          const isRequiredBySchema = !isAlwaysOptional; // If not always optional, it's required by schema
          const hasData = hasFieldData(value);
          
          // Include field in progress calculation if:
          // 1. It's always required by schema (not in always optional list), OR
          // 2. It's conditionally required (becomes required based on other fields), OR
          // 3. It's always optional AND has data (only count optional fields if they're filled)
          // 
          // This ensures:
          // - Required fields are always counted
          // - Conditionally required fields are counted when their condition is met
          // - Optional fields are only counted if they have data
          if (isRequiredBySchema || isConditionallyReq || (isAlwaysOptional && hasData)) {
            enabled.add(f);
          }
        }
      });
    });

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
    const targetTab = tabConfigs.find(tab => tab.id === tabId);
    if (!targetTab || !targetTab.isVisible(formData)) return false;

    // Always allow tab switching, but trigger validation to show errors
    const currentTab = tabConfigs.find(tab => tab.id === activeTab);
    if (currentTab) {
      await triggerValidation(currentTab.fields);
    }

    setActiveTab(tabId);
    scrollToTab(tabId);
    return true;
  }, [activeTab, formData, triggerValidation, scrollToTab]);

  const goNext = useCallback(async (): Promise<boolean> => {
    if (!canGoNext) return false;
    
    const currentTab = tabConfigs.find(tab => tab.id === activeTab);
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
    
    const currentTab = tabConfigs.find(tab => tab.id === activeTab);
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
    tabs: tabConfigs,
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
