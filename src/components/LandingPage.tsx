import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { GraduationCap, ArrowRight, BookOpen, MessageSquare, Calendar, FileText } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function LandingPage() {
  const { signIn, user } = useAuth();

  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-brand-surface relative overflow-hidden" id="landing-page">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-brand-primary text-white p-2.5 rounded-2xl shadow-xl shadow-indigo-200">
            <GraduationCap size={24} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-zinc-900">CampusConnect</span>
        </div>
        <button
          onClick={signIn}
          className="bg-white text-zinc-900 border border-zinc-100 px-6 py-2.5 rounded-full font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          Sign In
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block bg-brand-primary/10 text-brand-primary font-bold text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-8"
            >
              The Next Gen Student Hub
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-7xl md:text-8xl font-black tracking-tight text-zinc-900 leading-[0.85] mb-8"
            >
              Stay <span className="text-brand-primary">Lively.</span> <br />
              Stay <span className="text-brand-secondary">Linked.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-zinc-500 mb-12 leading-relaxed max-w-lg"
            >
              Organize your academic life with a burst of color. Schedules, 
              assignments, and campus vibes—all in one place.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={signIn}
              className="flex items-center gap-4 bg-brand-primary text-white px-10 py-5 rounded-[2rem] text-xl font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 group"
            >
              Start Your Journey
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-6 relative">
            {[
              { icon: BookOpen, title: 'Class Flow 🎓', color: 'bg-indigo-500 text-white', shadow: 'shadow-indigo-200' },
              { icon: FileText, title: 'Tasks 📝', color: 'bg-orange-400 text-white', shadow: 'shadow-orange-100' },
              { icon: MessageSquare, title: 'Study Hub 📚', color: 'bg-pink-500 text-white', shadow: 'shadow-pink-100' },
              { icon: Calendar, title: 'Events 🎉', color: 'bg-amber-400 text-white', shadow: 'shadow-amber-100' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                className={`bg-white p-8 rounded-[2.5rem] shadow-xl ${feature.shadow} flex flex-col items-center text-center group cursor-default hover:-translate-y-2 transition-all`}
              >
                <div className={`${feature.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg group-hover:rotate-6 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="font-display font-black text-xl text-zinc-900">{feature.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
