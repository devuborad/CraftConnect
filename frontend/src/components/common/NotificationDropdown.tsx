import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  Package, 
  MessageSquare, 
  Sparkles, 
  Tag, 
  Info,
  ExternalLink 
} from 'lucide-react';
import type { AppNotification } from '../../types';

export const NotificationDropdown: React.FC = () => {
  const { 
    role, 
    notifications, 
    unreadNotifCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearAllNotifications, 
    removeNotification 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-emerald-600" />;
      case 'inquiry':
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'price':
        return <Tag className="w-4 h-4 text-[#C85A32]" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeBadgeBg = (type: AppNotification['type']) => {
    switch (type) {
      case 'order':
        return 'bg-emerald-50 border-emerald-200';
      case 'inquiry':
        return 'bg-amber-50 border-amber-200';
      case 'ai':
        return 'bg-purple-50 border-purple-200';
      case 'price':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const roleLabel = role === 'BUYER' ? '🛍️ Buyer' : role === 'ARTISAN' ? '🎨 Artisan' : role === 'ADMIN' ? '🛡️ Admin' : 'Guest';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Toggle Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-stone-700 hover:text-[#C85A32] hover:bg-amber-50/80 transition-all border border-stone-200 bg-white shadow-xs focus:outline-hidden"
        title="Live Notifications"
        aria-label="Toggle notifications menu"
      >
        <Bell className="w-5 h-5 text-[#4A2E1B]" />
        {unreadNotifCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#C85A32] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
            {unreadNotifCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Window */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-stone-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Banner */}
          <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-display font-bold text-sm text-white">Notifications</h3>
                  <span className="bg-stone-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-stone-700">
                    {roleLabel}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400">
                  {unreadNotifCount > 0 ? `${unreadNotifCount} unread alert${unreadNotifCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Toolbar */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
              <button
                onClick={markAllNotificationsAsRead}
                disabled={unreadNotifCount === 0}
                className="text-stone-600 hover:text-[#4A2E1B] disabled:opacity-40 font-semibold flex items-center space-x-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark all read</span>
              </button>

              <button
                onClick={clearAllNotifications}
                className="text-red-600 hover:text-red-700 font-bold flex items-center space-x-1 transition-colors hover:bg-red-50 px-2 py-1 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* Notifications List with Smooth Vertical Scrollbar */}
          <div className="max-h-96 overflow-y-auto divide-y divide-stone-100 overscroll-contain pr-0.5">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 transition-colors relative group hover:bg-amber-50/40 flex items-start space-x-3 ${
                    !notif.isRead ? 'bg-amber-50/20' : 'bg-white'
                  }`}
                >
                  {/* Type Icon Badge */}
                  <div className={`p-2 rounded-xl border shrink-0 ${getTypeBadgeBg(notif.type)}`}>
                    {getTypeIcon(notif.type)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 space-y-1 pr-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-xs flex items-center space-x-1.5">
                        <span>{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#C85A32] inline-block" />
                        )}
                      </h4>
                      <span className="text-[10px] text-stone-400 shrink-0 font-medium">
                        {notif.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 font-normal leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#C85A32] hover:underline pt-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {/* Single Item Clear Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notif.id);
                    }}
                    title="Dismiss notification"
                    className="absolute top-3.5 right-3 text-stone-400 hover:text-red-500 p-1 rounded-lg hover:bg-stone-200/50 transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center space-y-3 bg-stone-50/50">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-[#C85A32] flex items-center justify-center mx-auto shadow-inner">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-800 text-sm">All notifications cleared!</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    You have no active alerts for your {roleLabel} account right now.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Notification Count & Scroll Info */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-stone-900 text-stone-400 text-[10px] text-center border-t border-stone-800 font-medium">
              Showing {notifications.length} live notification{notifications.length > 1 ? 's' : ''} • Scroll down to view all alerts
            </div>
          )}
        </div>
      )}
    </div>
  );
};
