import { NavLink } from 'react-router-dom';
import { Home, BookOpen, FileText, Calendar, LogOut, GraduationCap, MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { logout } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard 🏡' },
    { to: '/classes', icon: BookOpen, label: 'Classes 🎓' },
    { to: '/assignments', icon: FileText, label: 'Assignments 📝' },
    { to: '/school', icon: GraduationCap, label: 'Campus 🏛️' },
    { to: '/study-hub', icon: MessageSquare, label: 'Study Hub 📚' },
    { to: '/events', icon: Calendar, label: 'Events 🎉' },
    { to: '/journal', icon: Heart, label: 'Journal 🌿' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-zinc-100 hidden md:flex flex-col h-full" id="sidebar">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-brand-primary text-white p-2 rounded-xl shadow-lg shadow-indigo-200">
          <GraduationCap size={24} />
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-zinc-900">CampusConnect</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-xl shadow-indigo-200 scale-[1.02]'
                  : 'text-zinc-400 hover:bg-indigo-50 hover:text-brand-primary'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          id="logout-button"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
