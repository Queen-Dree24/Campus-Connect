import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CampusEvent } from '../types';
import { Calendar, MapPin, Tag, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

export default function EventList() {
  const [events, setEvents] = useState<CampusEvent[]>([]);

  // Seed mock events if empty
  useEffect(() => {
    const seedEvents = async () => {
      const q = query(collection(db, 'events'), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        await addDoc(collection(db, 'events'), {
          title: 'Spring Festival 2026',
          description: 'A day of music, food, and celebration on the main quad.',
          date: Timestamp.fromDate(new Date(Date.now() + 86400000 * 5)),
          location: 'Main Quad',
          category: 'Social'
        });
        await addDoc(collection(db, 'events'), {
          title: 'Hackathon: Code for Good',
          description: '48 hours of building innovative solutions for local non-profits.',
          date: Timestamp.fromDate(new Date(Date.now() + 86400000 * 12)),
          location: 'Engineering Hall',
          category: 'Academic'
        });
        await addDoc(collection(db, 'events'), {
          title: 'Guest Lecture: AI & Ethics',
          description: 'Special session with industry leading experts on the future of AI.',
          date: Timestamp.fromDate(new Date(Date.now() + 86400000 * 2)),
          location: 'Auditorium C',
          category: 'Academic'
        });
      }
    };
    seedEvents();
  }, []);

  useEffect(() => {
    const path = 'events';
    const q = query(collection(db, path), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CampusEvent)));
    }, error => handleFirestoreError(error, OperationType.LIST, path));

    return unsubscribe;
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
      id="event-list"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-900">Campus Events</h1>
          <p className="text-zinc-500 mt-2">Discover what's happening around you.</p>
        </div>
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">
           {['All', 'Social', 'Academic', 'Sports'].map(cat => (
             <button key={cat} className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
               {cat}
             </button>
           ))}
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event, i) => (
          <div 
            key={event.id}
            className={`group rounded-[2.5rem] border border-white/20 p-1 transition-all hover:scale-[1.02] ${
              i % 3 === 0 ? 'bg-indigo-50 shadow-indigo-100' : 
              i % 3 === 1 ? 'bg-pink-50 shadow-pink-100' : 
              'bg-amber-50 shadow-amber-100'
            }`}
          >
            <div className="bg-white rounded-[2.25rem] p-8 flex flex-col h-full shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl text-white ${
                  i % 3 === 0 ? 'bg-brand-primary' : 
                  i % 3 === 1 ? 'bg-brand-secondary' : 
                  'bg-brand-accent'
                }`}>
                  <Calendar size={24} />
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-black/5 ${
                  i % 3 === 0 ? 'text-brand-primary bg-indigo-50' : 
                  i % 3 === 1 ? 'text-brand-secondary bg-pink-50' : 
                  'text-brand-accent bg-amber-50'
                }`}>
                  {event.category}
                </div>
              </div>

              <h3 className="text-2xl font-display font-bold text-zinc-900 mb-3 leading-tight group-hover:text-brand-primary transition-colors">
                {event.title}
              </h3>
              
              <p className="text-sm text-zinc-400 leading-relaxed mb-6 line-clamp-3">
                {event.description}
              </p>

              <div className="space-y-3 pt-6 border-t border-zinc-50 mt-auto">
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <Calendar size={14} className="text-zinc-300" />
                  <span>{format(event.date.toDate(), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  <MapPin size={14} className="text-zinc-300" />
                  <span>{event.location}</span>
                </div>
              </div>

              <button className={`w-full mt-8 py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                i % 3 === 0 ? 'bg-indigo-50 text-brand-primary hover:bg-brand-primary hover:text-white' : 
                i % 3 === 1 ? 'bg-pink-50 text-brand-secondary hover:bg-brand-secondary hover:text-white' : 
                'bg-amber-50 text-brand-accent hover:bg-brand-accent hover:text-white'
              }`}>
                Join Event <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
