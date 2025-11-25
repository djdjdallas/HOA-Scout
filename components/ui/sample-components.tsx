// Sample Component Library for HOA Scout
// Using Tailwind CSS and shadcn/ui patterns

import React, { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils'; // Utility for merging Tailwind classes
import * as Icons from 'lucide-react';

// ============================================
// Button Component
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    disabled,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-600',
      secondary: 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus-visible:ring-gray-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600',
      ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus-visible:ring-gray-400',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && 'relative text-transparent pointer-events-none',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {icon && !loading && <span className="mr-2">{icon}</span>}
        {children}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icons.Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================
// Score Display Component
// ============================================

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  maxScore = 10,
  size = 'md',
  showLabel = true,
  className
}) => {
  const percentage = (score / maxScore) * 100;

  const getColor = () => {
    if (score >= 8.5) return 'text-green-600 stroke-green-600';
    if (score >= 7) return 'text-green-500 stroke-green-500';
    if (score >= 5.5) return 'text-yellow-600 stroke-yellow-600';
    if (score >= 4) return 'text-orange-600 stroke-orange-600';
    return 'text-red-600 stroke-red-600';
  };

  const getLabel = () => {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 5.5) return 'Fair';
    if (score >= 4) return 'Poor';
    return 'Critical';
  };

  const sizes = {
    sm: { container: 'w-16 h-16', text: 'text-xl', label: 'text-xs' },
    md: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-sm' },
    lg: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-base' },
    xl: { container: 'w-40 h-40', text: 'text-4xl', label: 'text-lg' },
  };

  const sizeConfig = sizes[size];
  const strokeDasharray = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className={cn('relative inline-block', className)}>
      <svg className={sizeConfig.container} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          className={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(sizeConfig.text, 'font-bold', getColor())}>
          {score.toFixed(1)}
        </span>
        {showLabel && (
          <span className={cn(sizeConfig.label, 'text-gray-600')}>
            {getLabel()}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================
// Flag Card Component
// ============================================

interface FlagCardProps {
  type: 'danger' | 'warning' | 'success';
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export const FlagCard: React.FC<FlagCardProps> = ({
  type,
  title,
  description,
  icon,
  className
}) => {
  const styles = {
    danger: {
      border: 'border-l-4 border-red-500',
      background: 'bg-red-50',
      icon: <Icons.XCircle className="h-5 w-5 text-red-600" />,
      titleColor: 'text-gray-900'
    },
    warning: {
      border: 'border-l-4 border-yellow-500',
      background: 'bg-yellow-50',
      icon: <Icons.AlertTriangle className="h-5 w-5 text-yellow-600" />,
      titleColor: 'text-gray-900'
    },
    success: {
      border: 'border-l-4 border-green-500',
      background: 'bg-green-50',
      icon: <Icons.CheckCircle className="h-5 w-5 text-green-600" />,
      titleColor: 'text-gray-900'
    }
  };

  const style = styles[type];

  return (
    <div className={cn(
      'p-4 rounded-r-lg',
      style.border,
      style.background,
      className
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {icon || style.icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={cn('font-medium text-sm', style.titleColor)}>
            {title}
          </p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// Data Card Component
// ============================================

interface DataCardProps {
  label: string;
  value: string | number;
  unit?: string;
  source?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  confidence?: 'high' | 'medium' | 'low';
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({
  label,
  value,
  unit,
  source,
  trend,
  trendValue,
  confidence,
  className
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <Icons.TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <Icons.TrendingDown className="h-4 w-4 text-red-600" />;
    return <Icons.Minus className="h-4 w-4 text-gray-400" />;
  };

  const getConfidenceIndicator = () => {
    const dots = ['high', 'medium', 'low'].map((level, index) => (
      <span
        key={level}
        className={cn(
          'inline-block w-1.5 h-1.5 rounded-full mr-1',
          confidence && ['high', 'medium', 'low'].indexOf(confidence) >= index
            ? 'bg-blue-600'
            : 'bg-gray-300'
        )}
      />
    ));
    return <div className="flex items-center">{dots}</div>;
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-4', className)}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        {confidence && getConfidenceIndicator()}
      </div>

      <div className="flex items-baseline">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="ml-1 text-base text-gray-600">{unit}</span>}
      </div>

      {(trend || trendValue) && (
        <div className="flex items-center mt-2 space-x-2">
          {trend && getTrendIcon()}
          {trendValue && (
            <span className={cn(
              'text-sm',
              trend === 'up' ? 'text-green-600' :
              trend === 'down' ? 'text-red-600' :
              'text-gray-600'
            )}>
              {trendValue}
            </span>
          )}
        </div>
      )}

      {source && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Source: {source}</span>
        </div>
      )}
    </div>
  );
};

// ============================================
// Search Input Component
// ============================================

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  loading?: boolean;
  suggestions?: string[];
  error?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  loading,
  suggestions = [],
  error,
  className,
  ...props
}) => {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    setShowSuggestions(false);
    if (onSearch) onSearch(suggestion);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <Icons.Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
          }}
          className={cn(
            'w-full pl-12 pr-12 py-3 text-base border-2 rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            'placeholder:text-gray-400'
          )}
          {...props}
        />
        {loading && (
          <Icons.Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600 animate-spin" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-center">
                <Icons.MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <Icons.AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </form>
  );
};

// ============================================
// Expandable Section Component
// ============================================

interface ExpandableSectionProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  badge?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  subtitle,
  defaultExpanded = false,
  badge,
  icon,
  children,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center">
          {icon && <span className="mr-3">{icon}</span>}
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
          </div>
          {badge && (
            <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              {badge}
            </span>
          )}
        </div>
        <Icons.ChevronDown
          className={cn(
            'h-5 w-5 text-gray-500 transition-transform duration-200',
            isExpanded && 'transform rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[2000px]' : 'max-h-0'
        )}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================
// Progress Steps Component
// ============================================

interface ProgressStep {
  label: string;
  description?: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

interface ProgressStepsProps {
  steps: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  orientation = 'vertical',
  className
}) => {
  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'complete':
        return <Icons.CheckCircle className="h-6 w-6 text-green-600" />;
      case 'loading':
        return <Icons.Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
      case 'error':
        return <Icons.XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className={cn(
      orientation === 'horizontal' ? 'flex items-center' : 'space-y-4',
      className
    )}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            'flex items-start',
            orientation === 'horizontal' && 'flex-1'
          )}
        >
          <div className="flex-shrink-0">
            {getStepIcon(step.status)}
          </div>
          <div className={cn(
            'ml-3',
            orientation === 'horizontal' ? 'flex-1' : 'pb-4'
          )}>
            <p className={cn(
              'font-medium',
              step.status === 'complete' ? 'text-green-900' :
              step.status === 'loading' ? 'text-blue-900' :
              step.status === 'error' ? 'text-red-900' :
              'text-gray-500'
            )}>
              {step.label}
            </p>
            {step.description && (
              <p className="text-sm text-gray-600 mt-0.5">
                {step.description}
              </p>
            )}
          </div>
          {orientation === 'horizontal' && index < steps.length - 1 && (
            <div className="flex-1 h-0.5 bg-gray-200 mx-4 mt-3" />
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================
// Alert Component
// ============================================

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  description,
  action,
  dismissible = false,
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const styles = {
    info: {
      background: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Icons.Info className="h-5 w-5 text-blue-600" />,
      titleColor: 'text-blue-900',
      descColor: 'text-blue-800'
    },
    success: {
      background: 'bg-green-50',
      border: 'border-green-200',
      icon: <Icons.CheckCircle className="h-5 w-5 text-green-600" />,
      titleColor: 'text-green-900',
      descColor: 'text-green-800'
    },
    warning: {
      background: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <Icons.AlertTriangle className="h-5 w-5 text-yellow-600" />,
      titleColor: 'text-yellow-900',
      descColor: 'text-yellow-800'
    },
    error: {
      background: 'bg-red-50',
      border: 'border-red-200',
      icon: <Icons.XCircle className="h-5 w-5 text-red-600" />,
      titleColor: 'text-red-900',
      descColor: 'text-red-800'
    }
  };

  const style = styles[type];

  return (
    <div className={cn(
      'rounded-lg border p-4',
      style.background,
      style.border,
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={cn('text-sm font-medium', style.titleColor)}>
            {title}
          </h3>
          {description && (
            <p className={cn('text-sm mt-2', style.descColor)}>
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-3 text-sm font-medium underline',
                style.titleColor
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="ml-auto pl-3"
          >
            <Icons.X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

// Export all components
export default {
  Button,
  ScoreDisplay,
  FlagCard,
  DataCard,
  SearchInput,
  ExpandableSection,
  ProgressSteps,
  Alert
};