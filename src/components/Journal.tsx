import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { JournalEntry } from '../types';
import { Plus, Trash2, Heart, PenTool, Book, Info, ExternalLink, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export default function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [mood, setMood] = useState('😊');
  const [activeTab, setActiveTab] = useState<'journal' | 'resources'>('journal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}/journal`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry)));
    }, error => handleFirestoreError(error, OperationType.LIST, path));

    return unsubscribe;
  }, [user]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEntry.trim()) return;

    setIsSubmitting(true);
    const path = `users/${user.uid}/journal`;
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        content: newEntry,
        mood,
        createdAt: Timestamp.now()
      });
      setNewEntry('');
      setMood('😊');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!user || !confirm('Delete this memory?')) return;
    const path = `users/${user.uid}/journal/${entryId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const moods = ['😊', '🧘', '😔', '🤯', '😴', '✨', '🔥'];

  const campusResources = [
    { title: 'Student Counseling Center', contact: '(555) 123-4567', location: 'Health Building, Room 204', desc: 'Free confidential counseling for students.' },
    { title: 'Peer Support Network', contact: 'studentsupport@campus.edu', location: 'Student Union Lounge', desc: 'Connect with trained student mentors.' },
    { title: 'Crisis 24/7 Hotline', contact: '1-800-CAMPUS-SAFE', location: 'Available Everywhere', desc: 'Immediate emergency support.' },
  ];

  const onlineResources = [
    { title: 'BetterHelp Student Grant', link: 'https://www.betterhelp.com', desc: 'Online therapy with discounts for valid student IDs.' },
    { title: 'Headspace Student Plan', link: 'https://www.headspace.com', desc: 'Guided meditation and mindfulness exercises.' },
    { title: 'Crisis Text Line', link: 'https://www.crisistextline.org', desc: 'Text HOME to 741741 to connect with a crisis counselor.' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
      id="journal-page"
    >
      <header className="text-center space-y-4">
        <div className="inline-block bg-brand-surface p-4 rounded-[2rem] shadow-xl shadow-pink-100 border border-brand-secondary/10">
          <Heart className="text-brand-secondary fill-brand-secondary" size={32} />
        </div>
        <h1 className="font-display text-4xl font-black text-zinc-900 tracking-tight">Mindful Space 🌿</h1>
        <p className="text-zinc-500 max-w-sm mx-auto">A private corner for your thoughts and well-being resources.</p>
      </header>

      <div className="flex gap-2 p-1 bg-white rounded-2xl w-fit mx-auto border border-zinc-100 shadow-sm">
        <button 
          onClick={() => setActiveTab('journal')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'journal' ? 'bg-brand-secondary text-white shadow-lg shadow-pink-100' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <PenTool size={16} /> Private Journal
        </button>
        <button 
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'resources' ? 'bg-brand-secondary text-white shadow-lg shadow-pink-100' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <ShieldCheck size={16} /> Support Hub
        </button>
      </div>

      <main>
        {activeTab === 'journal' ? (
          <div className="space-y-12">
            {/* New Entry Form */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
              <form onSubmit={handleAddEntry} className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  {moods.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${mood === m ? 'bg-brand-secondary text-white scale-110 shadow-lg shadow-pink-100' : 'bg-zinc-50 hover:bg-pink-50'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  placeholder="How are you feeling today? Take a moment..."
                  className="w-full bg-zinc-50 border-none rounded-3xl py-6 px-6 focus:ring-2 focus:ring-brand-secondary outline-none text-zinc-700 leading-relaxed min-h-[160px] resize-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newEntry.trim()}
                  className="w-full py-4 bg-brand-secondary text-white rounded-2xl font-bold shadow-xl shadow-pink-100 hover:bg-pink-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : <><Plus size={20} /> Save Entry</>}
                </button>
              </form>
            </section>

            {/* Entries List */}
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white p-8 rounded-[2.25rem] border border-zinc-100 shadow-sm relative group overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl grayscale-[0.5] group-hover:grayscale-0 transition-all">{entry.mood}</span>
                        <div className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                          {format(entry.createdAt.toDate(), 'MMMM dd, HH:mm')}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(entry.id)} className="text-zinc-200 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-zinc-600 leading-relaxed relative z-10 whitespace-pre-wrap">{entry.content}</p>
                    
                    {/* Visual flourish */}
                    <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-pink-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Campus Resources */}
            <section className="space-y-6">
              <h3 className="font-display text-2xl font-bold flex items-center gap-3 text-zinc-900">
                <Book className="text-brand-primary" /> Campus Resources
              </h3>
              <div className="space-y-4">
                {campusResources.map((res, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
                    <h4 className="font-bold text-lg mb-1">{res.title}</h4>
                    <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-3">{res.contact}</p>
                    <p className="text-sm text-zinc-500 mb-4">{res.desc}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 bg-zinc-50 w-fit px-3 py-1 rounded-full">
                      <Info size={12} /> {res.location}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Online Resources */}
            <section className="space-y-6">
              <h3 className="font-display text-2xl font-bold flex items-center gap-3 text-zinc-900">
                <ExternalLink className="text-brand-secondary" /> Online Support
              </h3>
              <div className="space-y-4">
                {onlineResources.map((res, i) => (
                  <a 
                    key={i} 
                    href={res.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:border-brand-secondary hover:shadow-pink-50 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg">{res.title}</h4>
                      <ExternalLink size={16} className="text-zinc-200 group-hover:text-brand-secondary transition-colors" />
                    </div>
                    <p className="text-sm text-zinc-500">{res.desc}</p>
                  </a>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </motion.div>
  );
}
