import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { FormData } from '@/schemas/formSchema';
import { calculateFormProgress } from '@/lib/formDataUtils';
import { getTabConfigs, type TabConfig } from '@/config/tabConfigs';

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

  const progress = useMemo(
    () => calculateFormProgress(formData, formErrors, visibleTabs),
    [visibleTabs, formData, formErrors]
  );

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
  }, [activeTab, formData, triggerValidation, scrollToTab, tabConfigs]);

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
  }, [canGoNext, activeTab, visibleTabs, currentIndex, triggerValidation, scrollToTab, tabConfigs]);

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
  }, [canGoPrevious, activeTab, visibleTabs, currentIndex, triggerValidation, scrollToTab, tabConfigs]);

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
