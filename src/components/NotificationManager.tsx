import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Assignment, ClassAlarm } from '../types';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, Clock } from 'lucide-react';
import { format } from 'date-fns';

type NotificationItem = {
  id: string;
  title: string;
  type: 'assignment' | 'class';
  time: Date;
};

export default function NotificationManager() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    // Listen for assignments
    const qAssignments = query(collection(db, 'assignments'));
    
    // Listen for class alarms
    const alarmPath = `users/${user.uid}/alarms`;
    const qAlarms = query(collection(db, alarmPath));
    
    const now = new Date();
    const halfHourAgo = new Date(now.getTime() - 1800000);

    const checkAndSet = (assignments: any[], alarms: any[]) => {
      const alerted: NotificationItem[] = [];
      const currentTime = new Date();
      const lookback = new Date(currentTime.getTime() - 1800000);

      assignments.forEach(doc => {
        if (doc.reminder) {
          const t = doc.reminder.toDate();
          if (t <= currentTime && t > lookback && !dismissedIds.has(doc.id)) {
            alerted.push({ id: doc.id, title: `Assignment Alert! 📝: ${doc.title}`, type: 'assignment', time: t });
          }
        }
      });

      alarms.forEach(doc => {
        if (doc.alarmTime) {
          const t = doc.alarmTime.toDate();
          // Adjust for lead time if present
          const actualAlarmTime = new Date(t.getTime() - (doc.leadTimeMinutes || 0) * 60000);
          
          if (actualAlarmTime <= currentTime && actualAlarmTime > lookback && !dismissedIds.has(doc.id)) {
            alerted.push({ 
              id: doc.id, 
              title: `Class Starting Soon! 🔔: ${doc.className}`, 
              type: 'class', 
              time: actualAlarmTime 
            });
          }
        }
      });

      setNotifications(alerted);
    };

    let currentAssignments: any[] = [];
    let currentAlarms: any[] = [];

    const unsubscribeAssignments = onSnapshot(qAssignments, (snapshot) => {
      currentAssignments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      checkAndSet(currentAssignments, currentAlarms);
    });

    const unsubscribeAlarms = onSnapshot(qAlarms, (snapshot) => {
      currentAlarms = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      checkAndSet(currentAssignments, currentAlarms);
    });

    const timer = setInterval(() => {
      checkAndSet(currentAssignments, currentAlarms);
    }, 30000);

    return () => {
      unsubscribeAssignments();
      unsubscribeAlarms();
      clearInterval(timer);
    };
  }, [user, dismissedIds]);

  const dismiss = (id: string) => {
    setDismissedIds(prev => new Set(prev).add(id));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 max-w-sm w-full pointer-events-none" id="notification-container">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`p-6 rounded-[2rem] shadow-2xl border pointer-events-auto flex gap-4 ${
              notif.type === 'class' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-900'
            }`}
          >
            <div className={`p-3 rounded-2xl h-fit ${notif.type === 'class' ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
              <Bell className={notif.type === 'class' ? 'text-emerald-400' : 'text-blue-500'} size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm mb-1">{notif.type === 'class' ? 'Class Alarm' : 'Assignment Reminder'}</h4>
              <p className={`text-sm line-clamp-2 ${notif.type === 'class' ? 'text-zinc-400' : 'text-zinc-500'}`}>{notif.title}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 opacity-50">
                   <Clock size={10} /> {format(notif.time, 'HH:mm')}
                </span>
                <button 
                  onClick={() => dismiss(notif.id)}
                  className="hover:opacity-70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
