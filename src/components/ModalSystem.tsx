import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalConfig {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'loading';
  actions?: ModalAction[];
  onClose?: () => void;
  closable?: boolean;
}

export interface ModalAction {
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick: () => void | Promise<void>;
  loading?: boolean;
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  showError: (title: string, description?: string, actions?: ModalAction[]) => void;
  showSuccess: (title: string, description?: string, actions?: ModalAction[]) => void;
  showLoading: (title: string, description?: string) => string;
  showValidationErrors: (errors: string[], title?: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const showModal = useCallback((config: ModalConfig) => {
    setModals(prev => [...prev.filter(m => m.id !== config.id), config]);
  }, []);

  const hideModal = useCallback((id: string) => {
    setModals(prev => {
      const modal = prev.find(m => m.id === id);
      modal?.onClose?.();
      return prev.filter(m => m.id !== id);
    });
  }, []);

  const hideAllModals = useCallback(() => {
    modals.forEach(modal => modal.onClose?.());
    setModals([]);
  }, [modals]);

  const showError = useCallback((title: string, description?: string, actions?: ModalAction[]) => {
    const modalId = `error-${Date.now()}`;
    showModal({
      id: modalId,
      title,
      description,
      type: 'error',
      actions: actions || [{ label: 'OK', onClick: () => hideModal(modalId) }],
      closable: true
    });
  }, [showModal, hideModal]);

  const showSuccess = useCallback((title: string, description?: string, actions?: ModalAction[]) => {
    const modalId = `success-${Date.now()}`;
    showModal({
      id: modalId,
      title,
      description,
      type: 'success',
      actions: actions || [{ label: 'OK', onClick: () => hideModal(modalId) }],
      closable: true
    });
  }, [showModal, hideModal]);

  const showLoading = useCallback((title: string, description?: string) => {
    const id = `loading-${Date.now()}`;
    showModal({
      id,
      title,
      description,
      type: 'loading',
      closable: false
    });
    return id;
  }, [showModal]);

  const showValidationErrors = useCallback((errors: string[], title = 'Validation Errors') => {
    const modalId = `validation-${Date.now()}`;
    showModal({
      id: modalId,
      title,
      description: (
        <ul className="list-disc pl-5 space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">{error}</li>
          ))}
        </ul>
      ) as any,
      type: 'error',
      actions: [{ label: 'OK', onClick: () => hideModal(modalId) }],
      closable: true
    });
  }, [showModal, hideModal]);

  const contextValue: ModalContextType = {
    showModal,
    hideModal,
    hideAllModals,
    showError,
    showSuccess,
    showLoading,
    showValidationErrors
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {modals.map(modal => (
        <Modal key={modal.id} config={modal} onClose={() => hideModal(modal.id)} />
      ))}
    </ModalContext.Provider>
  );
};

interface ModalProps {
  config: ModalConfig;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ config, onClose }) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleActionClick = async (action: ModalAction) => {
    if (action.loading) {
      setActionLoading(action.label);
    }
    
    try {
      await action.onClick();
    } finally {
      if (action.loading) {
        setActionLoading(null);
      }
    }
  };

  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case 'loading':
        return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getTitleColor = () => {
    switch (config.type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-orange-600';
      case 'loading':
        return 'text-blue-600';
      default:
        return 'text-gray-900';
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && config.closable !== false) {
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle className={cn('text-lg font-semibold', getTitleColor())}>
              {config.title}
            </DialogTitle>
          </div>
          {config.description && (
            <DialogDescription className="text-sm text-gray-600 max-h-[60vh] overflow-y-auto">
              {config.description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {config.actions && config.actions.length > 0 && (
          <div className="flex justify-end gap-2 mt-4">
            {config.actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={() => handleActionClick(action)}
                disabled={actionLoading === action.label}
                className="min-w-20"
              >
                {actionLoading === action.label ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

