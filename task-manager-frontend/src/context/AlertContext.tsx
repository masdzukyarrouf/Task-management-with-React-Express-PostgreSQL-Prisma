import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Alert {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AlertContextType {
  addAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = Date.now() + Math.random();
    const newAlert: Alert = { id, message, type };
    
    setAlerts(prev => [...prev, newAlert]);
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 4000);
  };

  const alertConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      icon: '✅',
      title: 'Success'
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      icon: '❌',
      title: 'Error'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      icon: '⚠️',
      title: 'Warning'
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: 'ℹ️',
      title: 'Info'
    }
  };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      {children}
      
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {alerts.map(alert => {
          const config = alertConfig[alert.type];
          
          return (
            <div
              key={alert.id}
              className={`${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-lg p-4 shadow-lg transition-all duration-300`}
            >
              <div className="flex items-start">
                <span className="text-lg mr-2">{config.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{config.title}</p>
                  <p className="text-sm mt-1">{alert.message}</p>
                </div>
                <button
                  onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="ml-4 text-white hover:text-gray-200 transition-colors text-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AlertContext.Provider>
  );
};