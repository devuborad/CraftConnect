import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-stone-900 text-white border-stone-800';
        let icon = <Info className="w-4 h-4 text-blue-400" />;

        if (toast.type === 'success') {
          bg = 'bg-white text-stone-900 border-emerald-500/40 shadow-lg';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
        } else if (toast.type === 'error') {
          bg = 'bg-red-50 text-red-900 border-red-200 shadow-lg';
          icon = <XCircle className="w-5 h-5 text-red-600" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 text-amber-900 border-amber-200 shadow-lg';
          icon = <AlertCircle className="w-5 h-5 text-amber-600" />;
        }

        return (
          <div
            key={toast.id}
            className={`${bg} border p-3.5 rounded-2xl flex items-start space-x-3 pointer-events-auto shadow-xl animate-in slide-in-from-right duration-200`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-stone-900">{toast.title}</h4>
              {toast.message && <p className="text-stone-600 mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
