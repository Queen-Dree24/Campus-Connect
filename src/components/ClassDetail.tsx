import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, Timestamp, deleteDoc, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Class, ForumMessage, ClassAlarm } from '../types';
import { Send, MapPin, Clock, Book, MessageSquare, Info, Bell, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ClassDetail() {
  const { classId } = useParams();
  const { user } = useAuth();
  const [classData, setClassData] = useState<Class | null>(null);
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [activeAlarms, setActiveAlarms] = useState<ClassAlarm[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'forum'>('info');
  const [showAlarmForm, setShowAlarmForm] = useState(false);

  useEffect(() => {
    if (!classId || !user) return;

    const fetchClass = async () => {
      const docRef = doc(db, 'classes', classId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setClassData({ id: snapshot.id, ...snapshot.data() } as Class);
      }
    };
    fetchClass();

    // Forum messages
    const forumPath = `classes/${classId}/forum`;
    const qForum = query(collection(db, forumPath), orderBy('createdAt', 'desc'));
    const unsubscribeForum = onSnapshot(qForum, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumMessage)));
    }, error => handleFirestoreError(error, OperationType.LIST, forumPath));

    // User alarms for this class
    const alarmPath = `users/${user.uid}/alarms`;
    const qAlarms = query(collection(db, alarmPath), where('classId', '==', classId));
    const unsubscribeAlarms = onSnapshot(qAlarms, (snapshot) => {
      setActiveAlarms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassAlarm)));
    }, error => handleFirestoreError(error, OperationType.LIST, alarmPath));

    return () => {
      unsubscribeForum();
      unsubscribeAlarms();
    };
  }, [classId, user]);

  const handleSetAlarm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !classData) return;
    
    const formData = new FormData(e.currentTarget);
    const alarmTimeStr = formData.get('alarmTime') as string;
    const leadTime = parseInt(formData.get('leadTime') as string) || 0;

    if (!alarmTimeStr) return;

    const alarmPath = `users/${user.uid}/alarms`;
    try {
      await addDoc(collection(db, alarmPath), {
        classId: classData.id,
        className: classData.name,
        alarmTime: Timestamp.fromDate(new Date(alarmTimeStr)),
        leadTimeMinutes: leadTime
      });
      setShowAlarmForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, alarmPath);
    }
  };

  const handleDeleteAlarm = async (alarmId: string) => {
    if (!user) return;
    const docRef = doc(db, `users/${user.uid}/alarms`, alarmId);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docRef.path);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, text?: string) => {
    if (e) e.preventDefault();
    if (!text && !newMessage.trim()) return;
    if (!user || !classId) return;

    const forumPath = `classes/${classId}/forum`;
    try {
      await addDoc(collection(db, forumPath), {
        userId: user.uid,
        userName: user.displayName || 'Anon',
        content: text || newMessage,
        createdAt: Timestamp.now()
      });
      if (!text) setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, forumPath);
    }
  };

  const QUICK_EMOJIS = ['🚀', '💡', '📝', '✅', '📚', '🤔', '🔥', '🎉', '🙌'];

  if (!classData) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto space-y-8"
      id="class-detail"
    >
      <header className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-zinc-900 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
              {classData.code}
            </div>
            <span className="text-sm font-medium text-zinc-500">Instructor: {classData.instructor}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6">
            {classData.name}
          </h1>
          
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 text-zinc-600 bg-zinc-50 px-4 py-2 rounded-full">
              <Clock size={16} /> <span>{classData.schedule}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 bg-zinc-50 px-4 py-2 rounded-full">
              <MapPin size={16} /> <span>{classData.location}</span>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-zinc-50 rounded-full"></div>
      </header>

      <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl w-fit mx-auto mb-8">
        <button 
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'info' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <Info size={18} /> Course Info
        </button>
        <button 
          onClick={() => setActiveTab('forum')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'forum' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
        >
          <MessageSquare size={18} /> Discussion Forum
        </button>
      </div>

      <main className="min-h-[400px]">
        {activeTab === 'info' ? (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2 space-y-8">
              <section className="bg-white p-8 rounded-[2rem] border border-zinc-100">
                <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <Book size={20} className="text-zinc-400" /> Syllabus Overview
                </h3>
                <p className="text-zinc-600 leading-relaxed italic">
                  "{classData.description}"
                </p>
                <div className="mt-8 pt-8 border-t border-zinc-50">
                  <h4 className="font-bold mb-4 uppercase text-[10px] tracking-widest text-zinc-400">Learning Objectives</h4>
                  <ul className="space-y-4">
                    {['Understand core concepts', 'Practical application of theory', 'Collaboration on group projects'].map((item, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="w-5 h-5 rounded-full bg-zinc-900 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-zinc-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <div className="bg-zinc-900 text-white p-8 rounded-[2rem] shadow-xl">
                 <h3 className="font-bold mb-2">Class Alarm</h3>
                 <p className="text-zinc-400 text-sm mb-6">Never miss a class. Set an early reminder.</p>
                 
                 {activeAlarms.length > 0 && (
                   <div className="space-y-3 mb-6">
                     {activeAlarms.map(alarm => (
                       <div key={alarm.id} className="flex items-center justify-between bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                         <div className="flex items-center gap-3">
                           <Bell size={14} className="text-emerald-400" />
                           <span className="text-xs font-mono">{format(alarm.alarmTime.toDate(), 'MMM dd, HH:mm')}</span>
                         </div>
                         <button onClick={() => handleDeleteAlarm(alarm.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                           <Trash2 size={14} />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}

                 {showAlarmForm ? (
                   <form onSubmit={handleSetAlarm} className="space-y-4 bg-zinc-800 p-4 rounded-2xl border border-zinc-700">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Class Time</label>
                        <input name="alarmTime" type="datetime-local" required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Reminder (mins before)</label>
                        <select name="leadTime" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs outline-none">
                          <option value="5">5 mins</option>
                          <option value="15">15 mins</option>
                          <option value="30">30 mins</option>
                          <option value="60">1 hour</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 py-3 bg-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700">Save</button>
                        <button type="button" onClick={() => setShowAlarmForm(false)} className="px-4 py-3 bg-zinc-700 rounded-xl text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                      </div>
                   </form>
                 ) : (
                   <button 
                    onClick={() => setShowAlarmForm(true)}
                    className="w-full py-4 bg-zinc-800 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                   >
                     <Plus size={16} /> Set Alarm
                   </button>
                 )}
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-zinc-100">
                 <h3 className="font-bold text-zinc-900 mb-2">Office Hours</h3>
                 <p className="text-zinc-500 text-sm mb-4">Dr. {classData.instructor.split(' ').pop()}</p>
                 <div className="text-2xl font-display font-medium tracking-tight mb-6">{classData.schedule.includes('FRI') ? 'FRI 14:00' : 'MON 11:00'}</div>
                 <button className="w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors">
                    Book Session
                 </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-[600px] bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length > 0 ? messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.userId === user?.uid ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500 uppercase mt-1">
                    {msg.userName[0]}
                  </div>
                  <div className={`max-w-[80%] ${msg.userId === user?.uid ? 'items-end text-right' : ''} flex flex-col`}>
                    <p className="text-[10px] font-bold text-zinc-400 mb-1 px-1 uppercase tracking-wider">{msg.userName}</p>
                    <div className={`p-4 rounded-3xl text-sm leading-relaxed ${msg.userId === user?.uid ? 'bg-zinc-900 text-white rounded-tr-none' : 'bg-zinc-50 text-zinc-700 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                    <p className="text-[8px] text-zinc-300 mt-1 px-1">{format(msg.createdAt.toDate(), 'HH:mm')}</p>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                   <MessageSquare size={48} strokeWidth={1} />
                   <p className="text-sm italic">No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-6 border-t border-zinc-100 bg-white">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {QUICK_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSendMessage(undefined, emoji)}
                    className="flex-shrink-0 w-10 h-10 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center text-xl hover:scale-110 hover:bg-brand-surface transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share a thought or ask a question..."
                  className="w-full bg-white border border-zinc-200 rounded-full py-4 pl-6 pr-16 focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-900 text-white p-3 rounded-full hover:bg-zinc-800 disabled:opacity-50 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
