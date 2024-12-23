/** @format */
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SpinnerContextType {
  showSpinner: () => void;
  hideSpinner: () => void;
  isLoading: boolean;
}

const SpinnerContext = createContext<SpinnerContextType | undefined>(undefined);

export const SpinnerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const showSpinner = () => setIsLoading(true);
  const hideSpinner = () => setIsLoading(false);

  return (
    <SpinnerContext.Provider value={{ showSpinner, hideSpinner, isLoading }}>
      {children}
    </SpinnerContext.Provider>
  );
};

export const useSpinner = () => {
  const context = useContext(SpinnerContext);
  if (!context) {
    throw new Error("useSpinner must be used within a SpinnerProvider");
  }
  return context;
};
