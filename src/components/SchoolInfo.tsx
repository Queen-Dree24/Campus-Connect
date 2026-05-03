import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { School, UserProfile, Class } from '../types';
import { School as SchoolIcon, IdCard, Search, MapPin, Phone, User as UserIcon, Calendar, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function SchoolInfo() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [schoolCode, setSchoolCode] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schoolClasses, setSchoolClasses] = useState<Class[]>([]);

  useEffect(() => {
    if (userProfile?.schoolCode) {
      fetchSchoolData(userProfile.schoolCode);
    }
  }, [userProfile]);

  const fetchSchoolData = async (code: string) => {
    setLoading(true);
    try {
      const schoolDoc = await getDoc(doc(db, 'schools', code));
      if (schoolDoc.exists()) {
        setSchool({ id: schoolDoc.id, ...schoolDoc.data() } as School);
        
        // Also fetch classes for this school to show "General Schedule"
        const q = query(collection(db, 'classes'), where('schoolCode', '==', code));
        const classSnap = await getDocs(q);
        setSchoolClasses(classSnap.docs.map(d => ({ id: d.id, ...d.data() } as Class)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !schoolCode || !studentId) return;

    setLoading(true);
    setError('');

    try {
      // 1. Check if school exists
      const schoolDoc = await getDoc(doc(db, 'schools', schoolCode.toLowerCase()));
      if (!schoolDoc.exists()) {
        setError('School code not found. Try "MIT" or "STANFORD" (demo)');
        setLoading(false);
        return;
      }

      // 2. Update user profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        schoolCode: schoolCode.toLowerCase(),
        studentId: studentId
      });

      await refreshProfile();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !school) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-brand-primary" size={48} />
        <p className="text-zinc-500 font-bold animate-pulse">Fetching your campus vibes...</p>
      </div>
    );
  }

  if (!userProfile?.schoolCode) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-[3rem] p-12 border border-zinc-100 shadow-2xl shadow-indigo-100 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

          <div className="inline-block bg-brand-surface p-6 rounded-[2rem] shadow-xl shadow-indigo-100 mb-8">
            <SchoolIcon className="text-brand-primary" size={48} />
          </div>
          
          <h1 className="text-4xl font-display font-black text-zinc-900 mb-4">Connect Your School</h1>
          <p className="text-zinc-500 mb-10 leading-relaxed">Enter your credentials to unlock your official campus schedule, advisor info, and help desk.</p>

          <form onSubmit={handleConnect} className="space-y-6 text-left max-w-sm mx-auto">
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 ml-4">School Code</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                <input 
                  value={schoolCode}
                  onChange={e => setSchoolCode(e.target.value)}
                  placeholder="e.g. MIT, STANFORD"
                  required
                  className="w-full bg-zinc-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[1.5rem] py-4 pl-12 pr-4 outline-none transition-all font-bold text-zinc-900" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 ml-4">Student ID Number</label>
              <div className="relative">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                <input 
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  placeholder="e.g. 2024-8890"
                  required
                  className="w-full bg-zinc-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-[1.5rem] py-4 pl-12 pr-4 outline-none transition-all font-bold text-zinc-900" 
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 rounded-xl">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-primary text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-2"
            >
              Connect Now <ArrowRight size={20} />
            </button>
          </form>
          
          <p className="mt-8 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Connect with your official EDU mail</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
      id="school-info-page"
    >
      <header className="flex items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-brand-primary p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
               <SchoolIcon size={20} />
             </div>
             <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Verified Campus</span>
          </div>
          <h1 className="text-4xl font-display font-black text-zinc-900 tracking-tight">{school?.name} 🏛️</h1>
          <p className="text-zinc-500 mt-2 flex items-center gap-2"><MapPin size={16} /> {school?.location}</p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-white p-4 rounded-[1.5rem] border border-zinc-100 shadow-sm">
           <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-brand-primary">
             <Sparkles size={20} />
           </div>
           <div>
             <p className="text-[10px] font-black text-zinc-400 uppercase">Student ID</p>
             <p className="text-sm font-black text-zinc-900 tracking-wider">#{userProfile.studentId}</p>
           </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Schedule Column */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-black text-zinc-900 flex items-center gap-2">
                 <Calendar className="text-brand-primary" /> Personalized Schedule
              </h3>
              <span className="bg-indigo-50 text-brand-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Spring Term 2024</span>
            </div>

            <div className="space-y-4">
              {schoolClasses.length > 0 ? (
                schoolClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between bg-zinc-50/50 p-6 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-indigo-50 border border-transparent hover:border-indigo-100 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-lg text-zinc-900 shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all">
                        {cls.code.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">{cls.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-medium tracking-tight">
                           <span>{cls.schedule}</span>
                           <span>•</span>
                           <span className="flex items-center gap-1"><MapPin size={12} /> {cls.location}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-zinc-200 group-hover:text-brand-primary transition-colors" />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-zinc-50 rounded-[2rem]">
                  <p className="text-zinc-400 font-bold">No classes synced for your ID yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Info Column */}
        <div className="space-y-8">
          <section className="bg-brand-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden">
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <Phone size={24} className="text-white/60" />
                 <h3 className="text-lg font-display font-black">Campus Help Desk</h3>
               </div>
               <p className="text-indigo-100 text-sm leading-relaxed mb-6">Need technical support or campus assistance? The help desk is active 24/7 for you.</p>
               <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 font-black text-lg text-center tracking-widest shadow-xl">
                 {school?.helpDesk}
               </div>
             </div>
             <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
               <UserIcon size={24} className="text-brand-secondary" />
               <h3 className="text-lg font-display font-black text-zinc-900">Academic Advisor</h3>
             </div>
             <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-brand-secondary font-black">
                 {school?.advisorInfo?.[0] || 'A'}
               </div>
               <div>
                 <p className="text-sm font-black text-zinc-900">{school?.advisorInfo}</p>
                 <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Primary Advisor</p>
               </div>
             </div>
             <button className="w-full py-4 bg-zinc-50 text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all shadow-sm">
               Schedule Session
             </button>
          </section>

          <button 
            onClick={async () => {
              if (confirm('Disconnect from this school?')) {
                const userRef = doc(db, 'users', user?.uid || '');
                await updateDoc(userRef, { schoolCode: null, studentId: null });
                await refreshProfile();
              }
            }}
            className="w-full py-4 text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
          >
            Disconnect School Account
          </button>
        </div>
      </div>
    </motion.div>
  );
}
