import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Class } from '../types';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, User } from 'lucide-react';

export default function ClassList() {
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    const path = 'classes';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
    }, error => handleFirestoreError(error, OperationType.LIST, path));

    return unsubscribe;
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
      id="class-list"
    >
      <header>
        <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-900">Your Classes</h1>
        <p className="text-zinc-500 mt-2">Browse and manage your academic courses.</p>
      </header>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <Link
            to={`/classes/${cls.id}`}
            key={cls.id}
            className="group block bg-white border border-zinc-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-zinc-200 transition-all duration-300 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-bold">
                  {cls.code.slice(0, 2)}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{cls.code}</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-zinc-900 mb-2 leading-tight group-hover:text-zinc-700 transition-colors">
                {cls.name}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
                <User size={14} />
                <span>{cls.instructor}</span>
              </div>

              <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {cls.schedule.split(' ')[0]} Schedule
                </div>
                <ArrowRight size={18} className="text-zinc-300 group-hover:text-zinc-900 transition-all group-hover:translate-x-1" />
              </div>
            </div>
            
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-bl-[100px] -z-0 group-hover:scale-110 transition-transform"></div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
