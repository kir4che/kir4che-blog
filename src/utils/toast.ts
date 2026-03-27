export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export const showToast = (message: string, variant: ToastVariant = 'error') => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('toast', {
      detail: { message, variant },
    })
  );
};
