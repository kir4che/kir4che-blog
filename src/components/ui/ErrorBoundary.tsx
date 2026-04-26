import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryTranslations {
  title: string;
  message: string;
  retry: string;
}

interface CustomErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  translations?: ErrorBoundaryTranslations;
  onReset?: () => void;
}

const DEFAULT_TRANSLATIONS: ErrorBoundaryTranslations = {
  title: 'Error',
  message: 'Something went wrong. Please refresh the page.',
  retry: 'Retry',
};

const DefaultFallback = ({
  error,
  resetErrorBoundary,
  translations = DEFAULT_TRANSLATIONS,
}: FallbackProps & { translations?: ErrorBoundaryTranslations }) => {
  const message = error instanceof Error ? error.message : translations.message;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 dark:text-red-200">{translations.title}</h3>
          <p className="mt-1 text-sm text-red-800 dark:text-red-300">{message}</p>
          <button
            onClick={resetErrorBoundary}
            className="mt-3 rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            {translations.retry}
          </button>
        </div>
      </div>
    </div>
  );
};

const ErrorBoundary = ({ children, fallback, translations, onReset }: CustomErrorBoundaryProps) => (
  <ReactErrorBoundary
    FallbackComponent={({ error, resetErrorBoundary }) =>
      fallback ? (
        <>{fallback}</>
      ) : (
        <DefaultFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          translations={translations}
        />
      )
    }
    onReset={onReset}
  >
    {children}
  </ReactErrorBoundary>
);

export default ErrorBoundary;
