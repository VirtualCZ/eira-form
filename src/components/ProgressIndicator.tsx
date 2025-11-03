import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabConfig } from '@/hooks/useTabNavigation';
// import { useTranslation } from 'react-i18next'; // Not used when progress is hidden

interface ProgressIndicatorProps {
  tabs: TabConfig[];
  activeTab: string;
  completedTabs: string[];
  errorTabs: string[];
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  tabs,
  activeTab,
  completedTabs,
  errorTabs,
  className
}) => {
  const getTabStatus = (tabId: string) => {
    if (errorTabs.includes(tabId)) return 'error';
    if (completedTabs.includes(tabId)) return 'completed';
    if (tabId === activeTab) return 'active';
    return 'pending';
  };

  const getTabIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'active':
        return <Circle className="h-4 w-4 text-gray-900 fill-current" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {tabs.map((tab, index) => {
          const status = getTabStatus(tab.id);
          const isLast = index === tabs.length - 1;
          
          return (
            <React.Fragment key={tab.id}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                  {
                    'bg-green-50 border-green-600': status === 'completed',
                    'bg-red-50 border-red-600': status === 'error',
                    'bg-gray-100 border-gray-900': status === 'active',
                    'bg-gray-50 border-gray-300': status === 'pending'
                  }
                )}>
                  {getTabIcon(status)}
                </div>
                <span className={cn(
                  'text-xs mt-1 text-center max-w-20',
                  {
                    'text-green-600 font-medium': status === 'completed',
                    'text-red-600 font-medium': status === 'error',
                    'text-gray-900 font-medium': status === 'active',
                    'text-gray-500': status === 'pending'
                  }
                )}>
                  {tab.label}
                </span>
              </div>
              {!isLast && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2 transition-colors',
                  {
                    'bg-green-600': completedTabs.includes(tab.id),
                    'bg-gray-300': !completedTabs.includes(tab.id)
                  }
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className
}) => {
  return (
    <div className={cn('w-full bg-gray-200 rounded-full h-2', className)}>
      <div
        className="bg-gray-900 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
};

interface FormStatusProps {
  hasUnsavedChanges: boolean;
  lastSaved?: Date;
  progress: number;
  className?: string;
}

export const FormStatus: React.FC<FormStatusProps> = () => {
  // Progress display hidden
  return null;
  
  // return (
  //   <div className={cn('flex items-center gap-2 text-sm', className)}>
  //     <span className="text-gray-600">{t('app.status.progress')}</span>
  //     <span className="font-medium text-gray-900">{progress}%</span>
  //   </div>
  // );
};
