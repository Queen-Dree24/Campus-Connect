import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Assignment, Class } from '../types';
import { FileText, Calendar, Clock, CheckCircle2, Bell, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [reminderEditId, setReminderEditId] = useState<string | null>(null);

  useEffect(() => {
    const classPath = 'classes';
    const unsubscribeClasses = onSnapshot(collection(db, classPath), (snapshot) => {
      const classMap: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        classMap[doc.id] = (doc.data() as Class).name;
      });
      setClasses(classMap);
    }, error => handleFirestoreError(error, OperationType.LIST, classPath));

    const path = 'assignments';
    const q = query(collection(db, path), orderBy('dueDate', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
    }, error => handleFirestoreError(error, OperationType.LIST, path));

    return () => {
      unsubscribeClasses();
      unsubscribe();
    };
  }, []);

  const handleSetReminder = async (assignmentId: string, reminderDate: string) => {
    const docRef = doc(db, 'assignments', assignmentId);
    try {
      await updateDoc(docRef, {
        reminder: Timestamp.fromDate(new Date(reminderDate))
      });
      setReminderEditId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `assignments/${assignmentId}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
      id="assignment-list"
    >
      <header>
        <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-900">Assignments</h1>
        <p className="text-zinc-500 mt-2">Track your deadlines and stay on top of your coursework.</p>
      </header>

      <div className="grid gap-6">
        {assignments.length > 0 ? assignments.map((task) => (
          <div 
            key={task.id}
            className="group bg-white p-8 rounded-[2rem] border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg hover:shadow-zinc-100 transition-all"
          >
            <div className="flex gap-6 items-start">
              <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 shadow-lg ${task.type === 'group' ? 'bg-orange-400 text-white shadow-orange-100' : 'bg-brand-primary text-white shadow-indigo-100'}`}>
                <FileText />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary bg-indigo-50 px-3 py-1 rounded-full">
                    {classes[task.classId] || 'Loading...'}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${task.type === 'group' ? 'bg-orange-50 text-orange-600' : 'bg-pink-50 text-brand-secondary'}`}>
                    {task.type}
                  </span>
                </div>
                <h3 className="text-2xl font-display font-bold text-zinc-900 group-hover:text-brand-primary transition-colors">{task.title}</h3>
                <p className="text-sm text-zinc-500 mt-2 line-clamp-2 max-w-xl leading-relaxed">{task.description}</p>
                
                {/* Reminder Badge */}
                {task.reminder ? (
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 w-fit px-4 py-1.5 rounded-full border border-emerald-100">
                    <Bell size={12} />
                    Reminder set for {format(task.reminder.toDate(), 'MMM dd, HH:mm')}
                  </div>
                ) : (
                  <button 
                    onClick={() => setReminderEditId(task.id)}
                    className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-brand-primary transition-colors bg-zinc-50 px-4 py-1.5 rounded-full hover:bg-indigo-50"
                  >
                    <Plus size={12} /> Add Alarm
                  </button>
                )}

                {reminderEditId === task.id && (
                  <div className="mt-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <p className="text-xs font-bold text-zinc-500 mb-2 uppercase">Select Date & Time</p>
                    <div className="flex gap-2">
                      <input 
                        type="datetime-local" 
                        className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
                        onChange={(e) => handleSetReminder(task.id, e.target.value)}
                        id={`reminder-input-${task.id}`}
                      />
                      <button 
                        onClick={() => setReminderEditId(null)}
                        className="text-xs font-bold text-zinc-400 hover:text-zinc-900 px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-1 pl-14 md:pl-0">
               <div className="flex items-center gap-2 text-zinc-400 font-bold text-sm">
                  <Calendar size={14} />
                  <span>{format(task.dueDate.toDate(), 'EEE, MMM dd')}</span>
               </div>
               <div className="flex items-center gap-2 text-zinc-400 text-xs">
                  <Clock size={14} />
                  <span>{format(task.dueDate.toDate(), 'h:mm a')}</span>
               </div>
               <button className="mt-4 hidden md:flex items-center gap-2 px-6 py-2 rounded-full border-2 border-zinc-50 text-sm font-bold text-zinc-300 hover:text-green-600 hover:bg-green-50 hover:border-green-100 transition-all">
                  <CheckCircle2 size={16} /> Mark as Done
               </button>
            </div>
          </div>
        )) : (
          <div className="bg-zinc-50 rounded-[2rem] p-16 flex flex-col items-center justify-center text-zinc-400 space-y-4">
             <CheckCircle2 size={64} strokeWidth={1} />
             <p className="text-lg font-medium italic">All assignments cleared!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
