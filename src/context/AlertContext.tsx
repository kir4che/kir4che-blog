'use client';

import { createContext, useContext } from 'react';
import { toast } from 'react-hot-toast';

type AlertContextType = {
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const showError = (message: string) => toast.error(message);
  const showSuccess = (message: string) => toast.success(message);

  return (
    <AlertContext.Provider value={{ showError, showSuccess }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within AlertProvider.');
  return context;
};
