import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetMyNotifications, useMarkNotificationAsRead } from '../hooks/useQueries';
import type { Notification } from '../backend';

export default function NotificationBanner() {
  const { data: notifications = [] } = useGetMyNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  useEffect(() => {
    // Find the most recent unread notification that hasn't been dismissed
    const unreadNotifications = notifications
      .filter((n) => !n.read && !dismissedIds.has(n.id))
      .sort((a, b) => Number(b.timestamp - a.timestamp));

    if (unreadNotifications.length > 0) {
      setCurrentNotification(unreadNotifications[0]);
    } else {
      setCurrentNotification(null);
    }
  }, [notifications, dismissedIds]);

  const handleDismiss = async (notificationId: string) => {
    setDismissedIds((prev) => new Set(prev).add(notificationId));
    setCurrentNotification(null);
    await markAsRead.mutateAsync(notificationId);
  };

  if (!currentNotification) return null;

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-primary/10 border-primary/20 text-primary-foreground';
      case 'reminder':
        return 'bg-warning/10 border-warning/20 text-warning-foreground';
      case 'announcement':
        return 'bg-accent/10 border-accent/20 text-accent-foreground';
      default:
        return 'bg-muted border-border';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'reminder':
        return '⏰';
      case 'announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top-5 duration-300">
      <div
        className={`rounded-lg border-2 shadow-lg p-4 ${getNotificationStyle(
          currentNotification.type
        )}`}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{getNotificationIcon(currentNotification.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{currentNotification.message}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={() => handleDismiss(currentNotification.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
