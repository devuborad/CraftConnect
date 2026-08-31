import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-white text-stone-900 border-blue-200/80 shadow-xl';
        let icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-white text-stone-900 border-emerald-300 shadow-xl';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-white text-stone-900 border-red-300 shadow-xl';
          icon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-white text-stone-900 border-amber-300 shadow-xl';
          icon = <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`${bg} border p-4 rounded-2xl flex items-start space-x-3 pointer-events-auto shadow-2xl animate-in slide-in-from-top-5 sm:slide-in-from-right-5 duration-200 relative overflow-hidden`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 text-xs pr-4">
              <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{toast.title}</h4>
              {toast.message && <p className="text-stone-600 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
