import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, limit, orderBy, onSnapshot, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Calendar, FileText, Bell, Users, Plus, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Class, Assignment, CampusEvent, Announcement } from '../types';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Seed mock data if empty (for demo purposes)
  useEffect(() => {
    const seedData = async () => {
      const q = query(collection(db, 'classes'), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        // Seed some classes
        await addDoc(collection(db, 'classes'), {
          name: 'Computer Science 101',
          code: 'CS101',
          instructor: 'Dr. Smith',
          schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
          location: 'Building A, Room 302',
          description: 'Introduction to algorithms and data structures.'
        });
        await addDoc(collection(db, 'classes'), {
          name: 'Advanced Mathematics',
          code: 'MATH301',
          instructor: 'Prof. Johnson',
          schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
          location: 'Building B, Room 101',
          description: 'Multivariable calculus and linear algebra.'
        });

        // Seed announcements
        await addDoc(collection(db, 'announcements'), {
          title: 'Campus Career Fair 2026',
          content: 'Meet top employers at the Student Union this Friday!',
          createdAt: Timestamp.now(),
          author: 'Student Affairs'
        });

        // Seed assignments
        const classesSnap = await getDocs(collection(db, 'classes'));
        const firstClassId = classesSnap.docs[0].id;
        await addDoc(collection(db, 'assignments'), {
          classId: firstClassId,
          title: 'Final Project Phase 1',
          description: 'Submit your project proposal and initial architecture.',
          dueDate: Timestamp.fromDate(new Date(Date.now() + 86400000 * 3)),
          type: 'group'
        });
      }
    };
    seedData();
  }, []);

  useEffect(() => {
    if (!user) return;

    const pathClasses = 'classes';
    const unsubscribeClasses = onSnapshot(collection(db, pathClasses), (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class)));
    }, error => handleFirestoreError(error, OperationType.LIST, pathClasses));

    const pathAssignments = 'assignments';
    const unsubscribeAssignments = onSnapshot(
      query(collection(db, pathAssignments), orderBy('dueDate', 'asc'), limit(5)),
      (snapshot) => {
        setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
      },
      error => handleFirestoreError(error, OperationType.LIST, pathAssignments)
    );

    const pathAnnouncements = 'announcements';
    const unsubscribeAnnouncements = onSnapshot(
      query(collection(db, pathAnnouncements), orderBy('createdAt', 'desc'), limit(3)),
      (snapshot) => {
        setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement)));
      },
      error => handleFirestoreError(error, OperationType.LIST, pathAnnouncements)
    );

    setLoading(false);

    return () => {
      unsubscribeClasses();
      unsubscribeAssignments();
      unsubscribeAnnouncements();
    };
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      id="dashboard"
    >
      <header>
        <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-900">Welcome back, {user?.displayName}!</h1>
        <p className="text-zinc-500 mt-2">Here's what's happening at campus today.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Announcements */}
          <section className="bg-gradient-to-br from-brand-primary via-indigo-600 to-brand-secondary text-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={20} className="text-white/60" />
                <span className="text-sm font-bold uppercase tracking-widest text-white/60">Flash Announcement 📢</span>
              </div>
              {announcements.length > 0 ? (
                <div>
                  <h2 className="text-3xl font-display font-bold mb-3 leading-tight">{announcements[0].title}</h2>
                  <p className="text-indigo-50 leading-relaxed mb-6 line-clamp-2">{announcements[0].content}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-full border border-white/10">By {announcements[0].author}</p>
                </div>
              ) : (
                <p>No current announcements.</p>
              )}
            </div>
            {/* Visual background element */}
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl"></div>
          </section>

          {/* Today's Classes */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="font-display text-2xl font-bold text-zinc-900">Today's Energy ⚡️</h3>
                <p className="text-zinc-500 text-sm">Classes and catchups</p>
              </div>
              <Link to="/classes" className="text-sm font-bold text-brand-primary hover:text-indigo-700 flex items-center gap-1 group bg-indigo-50 px-4 py-2 rounded-full transition-colors">
                View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid gap-4">
              {classes.map((cls) => (
                <Link 
                  to={`/classes/${cls.id}`} 
                  key={cls.id}
                  className="bg-white p-6 rounded-[2rem] border border-zinc-100 hover:border-brand-primary/20 hover:shadow-xl hover:shadow-indigo-50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-brand-surface rounded-2xl flex items-center justify-center text-brand-primary font-black text-xl group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                      {cls.code.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-zinc-900">{cls.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                        <span className="flex items-center gap-1 font-medium"><Clock size={14} className="text-brand-primary" /> {cls.schedule.split(' ').slice(2).join(' ')}</span>
                        <span className="flex items-center gap-1 opacity-60">• {cls.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-brand-primary group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Upcoming Assignments */}
          <section className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
            <h3 className="font-display font-bold text-xl mb-6">Assignments</h3>
            <div className="space-y-6">
              {assignments.length > 0 ? assignments.map((task) => (
                <div key={task.id} className="flex gap-4">
                  <div className={`w-1 h-12 rounded-full ${task.type === 'group' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
                  <div>
                    <h4 className="font-semibold text-zinc-900">{task.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1">Due {format(task.dueDate.toDate(), 'MMM dd, h:mm a')}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-zinc-500">All caught up!</p>
              )}
            </div>
            <button className="w-full mt-8 py-3 rounded-2xl border-2 border-zinc-50 text-sm font-semibold hover:bg-zinc-50 transition-colors text-zinc-400">
              View All Tasks
            </button>
          </section>

          {/* Quick Actions or Events */}
          <section className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
            <h3 className="font-display font-bold text-indigo-900 text-xl mb-4">Discovery</h3>
            <p className="text-sm text-indigo-700 mb-6">Explore clubs, workshops, and extracurricular activities.</p>
            <Link to="/events" className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-center text-sm font-semibold hover:bg-indigo-700 transition-colors block">
              Discover Events
            </Link>
          </section>

          {/* Study Hub Promo */}
          <section className="bg-pink-50 p-6 rounded-[2rem] border border-pink-100">
            <h3 className="font-display font-bold text-pink-900 text-xl mb-4">Study Hub 📚</h3>
            <p className="text-sm text-pink-700 mb-6">Need help with a project? Or found a cool resource? Share it with everyone.</p>
            <Link to="/study-hub" className="w-full py-3 bg-pink-500 text-white rounded-2xl text-center text-sm font-semibold hover:bg-pink-600 transition-colors block">
              Enter Hub
            </Link>
          </section>

          {/* Journal Promo */}
          <section className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
            <h3 className="font-display font-bold text-emerald-900 text-xl mb-4">Mindful Check-in 🌿</h3>
            <p className="text-sm text-emerald-700 mb-6">Take a second to breathe and write down your thoughts.</p>
            <Link to="/journal" className="w-full py-3 bg-emerald-600 text-white rounded-2xl text-center text-sm font-semibold hover:bg-emerald-700 transition-colors block">
              Open Journal
            </Link>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
