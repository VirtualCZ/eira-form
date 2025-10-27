import { useEffect, useCallback, useRef } from 'react';

export interface AccessibilityConfig {
  announceChanges?: boolean;
  announceValidation?: boolean;
  announceNavigation?: boolean;
  focusManagement?: boolean;
}

export const useAccessibility = (config: AccessibilityConfig = {}) => {
  const {
    announceChanges = true,
    announceValidation = true,
    announceNavigation = true,
    focusManagement = true
  } = config;

  const announcerRef = useRef<HTMLDivElement | null>(null);

  // Create live region for announcements
  useEffect(() => {
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
        announcerRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;
    }
  }, []);

  const announceFieldChange = useCallback((fieldName: string, value: any) => {
    if (!announceChanges) return;
    
    const message = `${fieldName} updated to ${value}`;
    announce(message);
  }, [announce, announceChanges]);

  const announceValidationResult = useCallback((isValid: boolean, errors?: string[]) => {
    if (!announceValidation) return;
    
    if (isValid) {
      announce('Form validation passed');
    } else {
      const errorCount = errors?.length || 0;
      announce(`Form validation failed with ${errorCount} error${errorCount !== 1 ? 's' : ''}`, 'assertive');
    }
  }, [announce, announceValidation]);

  const announceTabNavigation = useCallback((fromTab: string, toTab: string) => {
    if (!announceNavigation) return;
    
    const message = `Navigated from ${fromTab} to ${toTab}`;
    announce(message);
  }, [announce, announceNavigation]);

  const announceProgressUpdate = useCallback((progress: number) => {
    if (!announceChanges) return;
    
    announce(`Form progress: ${progress}% complete`);
  }, [announce, announceChanges]);

  const manageFocus = useCallback((element: HTMLElement | null) => {
    if (!focusManagement || !element) return;
    
    element.focus();
    
    // Ensure element is visible
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    });
  }, [focusManagement]);

  const setFocusToFirstError = useCallback((errorFields: string[]) => {
    if (!focusManagement || errorFields.length === 0) return;
    
    const firstErrorField = errorFields[0];
    const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
    manageFocus(element);
  }, [focusManagement, manageFocus]);

  const setFocusToTab = useCallback((tabId: string) => {
    if (!focusManagement) return;
    
    const tabElement = document.querySelector(`[data-value="${tabId}"]`) as HTMLElement;
    manageFocus(tabElement);
  }, [focusManagement, manageFocus]);

  const setFocusToNextTab = useCallback((currentTabId: string, nextTabId: string) => {
    if (!focusManagement) return;
    
    // Announce navigation
    announceTabNavigation(currentTabId, nextTabId);
    
    // Focus on the new tab
    setTimeout(() => {
      setFocusToTab(nextTabId);
    }, 100);
  }, [focusManagement, announceTabNavigation, setFocusToTab]);

  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    // Handle Escape key to close modals
    if (event.key === 'Escape') {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        const closeButton = modal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
        closeButton?.click();
      }
    }

    // Handle Enter key on form elements
    if (event.key === 'Enter') {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        return; // Let default behavior handle button clicks
      }
      
      // For other elements, prevent default and trigger click if it's interactive
      if (target.getAttribute('tabindex') === '0' || target.getAttribute('role') === 'tab') {
        event.preventDefault();
        target.click();
      }
    }
  }, []);

  // Set up keyboard navigation
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  return {
    announce,
    announceFieldChange,
    announceValidation: announceValidationResult,
    announceNavigation: announceTabNavigation,
    announceProgress: announceProgressUpdate,
    manageFocus,
    setFocusToFirstError,
    setFocusToTab,
    setFocusToNextTab
  };
};

// Hook for managing ARIA attributes
export const useAriaAttributes = () => {
  const setAriaDescribedBy = useCallback((element: HTMLElement, descriptionId: string) => {
    element.setAttribute('aria-describedby', descriptionId);
  }, []);

  const setAriaInvalid = useCallback((element: HTMLElement, isInvalid: boolean) => {
    element.setAttribute('aria-invalid', isInvalid.toString());
  }, []);

  const setAriaRequired = useCallback((element: HTMLElement, isRequired: boolean) => {
    element.setAttribute('aria-required', isRequired.toString());
  }, []);

  const setAriaExpanded = useCallback((element: HTMLElement, isExpanded: boolean) => {
    element.setAttribute('aria-expanded', isExpanded.toString());
  }, []);

  const setAriaSelected = useCallback((element: HTMLElement, isSelected: boolean) => {
    element.setAttribute('aria-selected', isSelected.toString());
  }, []);

  return {
    setAriaDescribedBy,
    setAriaInvalid,
    setAriaRequired,
    setAriaExpanded,
    setAriaSelected
  };
};