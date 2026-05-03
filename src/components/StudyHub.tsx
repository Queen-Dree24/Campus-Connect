import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { StudyPost } from '../types';
import { Search, Plus, MessageSquare, Link as LinkIcon, Trash2, Filter, GraduationCap, X } from 'lucide-react';
import { format } from 'date-fns';

export default function StudyHub() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<StudyPost[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'help' | 'resource'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = 'study-hub';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudyPost)));
      setLoading(false);
    }, error => handleFirestoreError(error, OperationType.LIST, path));

    return unsubscribe;
  }, []);

  const handleAddPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const path = 'study-hub';
    
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        userName: user.displayName || 'Student',
        title: formData.get('title'),
        content: formData.get('content'),
        type: formData.get('type'),
        category: formData.get('category'),
        link: formData.get('link'),
        createdAt: Timestamp.now(),
      });
      setShowAddModal(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'study-hub', postId));
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, `study-hub/${postId}`);
    }
  };

  const filteredPosts = posts.filter(post => filter === 'all' || post.type === filter);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
      id="study-hub"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-zinc-900">Study Hub 📚</h1>
          <p className="text-zinc-500 mt-2">Connect with others for project help and share resources.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex p-1 bg-white rounded-2xl border border-zinc-100 shadow-sm">
            {(['all', 'help', 'resource'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-brand-primary text-white shadow-lg shadow-indigo-200' : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={20} /> Post Something
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  post.type === 'help' ? 'bg-orange-50 text-orange-600' : 'bg-brand-surface text-brand-primary'
                }`}>
                  {post.type} • {post.category}
                </div>
                {post.userId === user?.uid && (
                  <button onClick={() => handleDelete(post.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h3 className="text-2xl font-display font-bold text-zinc-900 mb-4 group-hover:text-brand-primary transition-colors">
                {post.title}
              </h3>
              
              <p className="text-zinc-500 leading-relaxed mb-8 flex-1">
                {post.content}
              </p>

              {post.link && (
                <a 
                  href={post.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-primary font-bold text-sm mb-8 bg-indigo-50 w-fit px-4 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all overflow-hidden max-w-full"
                >
                  <LinkIcon size={14} /> <span className="truncate">{post.link}</span>
                </a>
              )}

              <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-400">
                    {post.userName[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{post.userName}</p>
                    <p className="text-[10px] text-zinc-400">{format(post.createdAt.toDate(), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-50 text-zinc-500 font-bold text-xs hover:bg-zinc-900 hover:text-white transition-all">
                  <MessageSquare size={14} /> Respond
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="grid lg:grid-cols-2 gap-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-64 bg-white border border-zinc-100 rounded-[2.5rem] animate-pulse"></div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-black/20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute right-6 top-6 text-zinc-300 hover:text-zinc-900"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-display font-bold mb-2">Create a Post 📣</h2>
              <p className="text-zinc-500 mb-8">Share a resource or ask for help with school work.</p>

              <form onSubmit={handleAddPost} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                    <select name="type" className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium">
                      <option value="help">HELP REQ</option>
                      <option value="resource">RESOURCE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                    <select name="category" className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium">
                      <option value="homework">Homework</option>
                      <option value="project">Project</option>
                      <option value="exam">Exam Prep</option>
                      <option value="link">Online Link</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                  <input name="title" required placeholder="What's on your mind?" className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                  <textarea name="content" required rows={4} placeholder="Give some details..." className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium resize-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Resource Link (Optional)</label>
                  <input name="link" type="url" placeholder="https://..." className="w-full bg-zinc-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-brand-primary outline-none text-sm font-medium" />
                </div>

                <div className="pt-2 flex gap-4">
                  <button type="submit" className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
                    Publish Post
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-bold hover:bg-zinc-200 transition-all">
                    Discard
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
