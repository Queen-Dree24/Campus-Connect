import { useAuth } from '../hooks/useAuth';
import { Search, Bell, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10" id="navbar">
      <div className="flex-1 max-w-xl relative hidden md:block group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-brand-primary transition-colors" size={18} />
        <input
          type="text"
          placeholder="Search classes, events, students..."
          className="w-full bg-zinc-50/50 border-2 border-transparent rounded-[1.25rem] py-3 pl-12 pr-4 focus:bg-white focus:border-indigo-100 focus:ring-0 transition-all text-sm font-medium"
          id="search-input"
        />
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={logout}
          className="hidden sm:flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={16} /> Sign Out
        </button>

        <button className="p-3 bg-zinc-50 text-zinc-400 hover:text-brand-primary hover:bg-indigo-50 rounded-2xl transition-all relative group" id="notifications-button">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-secondary rounded-full border-2 border-white shadow-sm shadow-pink-200"></span>
        </button>
        
        <div className="flex items-center gap-4 pl-6 border-l border-zinc-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-zinc-900 leading-none">{user?.displayName}</p>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mt-1">Student</p>
          </div>
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg shadow-zinc-200 object-cover ring-2 ring-indigo-50" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand-primary border-2 border-white shadow-lg">
              <User size={24} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
