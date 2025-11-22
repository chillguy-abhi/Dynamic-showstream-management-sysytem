import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { generateDescription } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { TVShow, UserRole } from '../types';
import { Plus, Search, Trash2, Wand2, ArrowRight } from 'lucide-react';

const TVShows: React.FC = () => {
  const { user } = useAuth();
  const [shows, setShows] = useState<TVShow[]>([]);
  const [search, setSearch] = useState('');
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShow, setNewShow] = useState<TVShow>({ Title: '', Description: '' });
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    setShows(db.getShows());
  }, []);

  const filteredShows = shows.filter(s => s.Title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (e: React.MouseEvent, title: string) => {
    e.preventDefault(); // Prevent Link navigation
    if (window.confirm(`Delete ${title}? This will fail if Seasons exist.`)) {
        try {
            db.deleteShow(title);
            setShows(db.getShows());
        } catch (err: any) {
            alert(err.message);
        }
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        db.addShow(newShow);
        setShows(db.getShows());
        setIsModalOpen(false);
        setNewShow({ Title: '', Description: '' });
    } catch (err: any) {
        alert(err.message);
    }
  };

  const handleGenerateDesc = async () => {
      if(!newShow.Title) return alert("Enter a title first");
      setLoadingAi(true);
      const desc = await generateDescription(newShow.Title, 'Show');
      setNewShow(prev => ({ ...prev, Description: desc }));
      setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">TV Shows</h1>
        {user?.role === UserRole.ADMIN && (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
                <Plus size={20} />
                <span>New Show</span>
            </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
            type="text" 
            placeholder="Search shows..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShows.map(show => (
            <Link 
                key={show.Title} 
                to={`/shows/${encodeURIComponent(show.Title)}`}
                className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
            >
                <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-700 p-6 flex items-center justify-center">
                     <h3 className="text-xl font-bold text-white text-center">{show.Title}</h3>
                </div>
                <div className="p-6">
                    <p className="text-slate-600 text-sm line-clamp-3 mb-4 min-h-[3.75rem]">{show.Description}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:underline">
                            View Details <ArrowRight size={16} />
                        </span>
                        {user?.role === UserRole.ADMIN && (
                            <button 
                                onClick={(e) => handleDelete(e, show.Title)}
                                className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </Link>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Add New Show</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
                </div>
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title (Unique)</label>
                        <input 
                            required
                            maxLength={128}
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newShow.Title}
                            onChange={e => setNewShow({...newShow, Title: e.target.value})}
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                             <label className="block text-sm font-medium text-slate-700">Description</label>
                             <button 
                                type="button"
                                onClick={handleGenerateDesc}
                                disabled={loadingAi}
                                className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                             >
                                <Wand2 size={12} />
                                {loadingAi ? 'Generating...' : 'Generate with AI'}
                             </button>
                        </div>
                        <textarea 
                            required
                            maxLength={200}
                            rows={3}
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newShow.Description}
                            onChange={e => setNewShow({...newShow, Description: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition">
                        Create Show
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default TVShows;
