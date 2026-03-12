import { useContext, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getNotifications, markNotificationRead } from '../services/api';

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}

export default function NotificationDropdown() {
  const { currentPatient, currentDoctor } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const activeUser = currentDoctor || currentPatient;
  const userType = currentDoctor ? 'doctor' : currentPatient ? 'patient' : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!activeUser?.id || !userType) {
      setNotifications([]);
      return undefined;
    }

    let mounted = true;

    const loadNotifications = async (showSpinner) => {
      try {
        if (showSpinner) setLoading(true);
        const data = await getNotifications(activeUser.id, userType);
        if (mounted) {
          setNotifications(data);
        }
      } catch {
        if (mounted) {
          setNotifications([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications(true);
    const intervalId = setInterval(() => loadNotifications(false), 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [activeUser?.id, userType]);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  const handleToggle = async () => {
    setIsOpen((current) => !current);

    if (!isOpen && activeUser?.id && userType) {
      try {
        const data = await getNotifications(activeUser.id, userType);
        setNotifications(data);
      } catch {
        setNotifications([]);
      }
    }
  };

  const handleMarkRead = async (notificationId) => {
    try {
      const updated = await markNotificationRead(notificationId);
      setNotifications((current) => current.map((notification) => (
        notification.id === updated.id ? updated : notification
      )));
    } catch {
      // silent for now
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[var(--primary)]"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-40 w-[320px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-900/10">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
              <p className="text-xs text-gray-400">Unread: {unreadCount}</p>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet.</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-gray-100 px-4 py-3 last:border-b-0 ${notification.is_read ? 'bg-white' : 'bg-teal-50/60'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{notification.message}</p>
                      <p className="mt-2 text-xs text-gray-400">{formatTime(notification.created_at)}</p>
                    </div>
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="shrink-0 rounded-full p-1.5 text-teal-700 transition-colors hover:bg-teal-100"
                        title="Mark as read"
                      >
                        <CheckCheck size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}