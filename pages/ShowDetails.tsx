import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { TVShowSeason, UserRole } from '../types';
import { Plus, Trash2, Calendar, ArrowLeft } from 'lucide-react';

const ShowDetails: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const { user } = useAuth();
  const [seasons, setSeasons] = useState<TVShowSeason[]>([]);
  const decodedTitle = decodeURIComponent(title || '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSeason, setNewSeason] = useState<Partial<TVShowSeason>>({
    SeasonNumber: 1,
    SeasonDescription: '',
    DateStarted: '',
    DateEnded: ''
  });

  useEffect(() => {
    if (decodedTitle) {
        setSeasons(db.getSeasons().filter(s => s.Title === decodedTitle));
    }
  }, [decodedTitle]);

  const handleDelete = (e: React.MouseEvent, id: number) => {
      e.preventDefault();
      if(window.confirm('Delete this season? All episodes must be deleted first.')) {
          try {
              db.deleteSeason(id);
              setSeasons(db.getSeasons().filter(s => s.Title === decodedTitle));
          } catch(err: any) {
              alert(err.message);
          }
      }
  }

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const id = Math.floor(Math.random() * 100000); // Simple Mock ID
          db.addSeason({
              SeasonID: id,
              SeasonNumber: Number(newSeason.SeasonNumber),
              SeasonDescription: newSeason.SeasonDescription || '',
              DateStarted: newSeason.DateStarted || '',
              DateEnded: newSeason.DateEnded || '',
              Title: decodedTitle
          });
          setSeasons(db.getSeasons().filter(s => s.Title === decodedTitle));
          setIsModalOpen(false);
          setNewSeason({ SeasonNumber: (seasons.length + 2), SeasonDescription: '', DateStarted: '', DateEnded: '' });
      } catch(err: any) {
          alert(err.message);
      }
  }

  return (
    <div className="space-y-6">
        <Link to="/shows" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition">
            <ArrowLeft size={16} className="mr-1" /> Back to Shows
        </Link>
        
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-800">{decodedTitle}</h1>
            <p className="text-slate-500 mt-2">Manage seasons for this show</p>
        </div>

        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-700">Seasons</h2>
            {user?.role === UserRole.ADMIN && (
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <Plus size={18} /> Add Season
                </button>
            )}
        </div>

        <div className="space-y-4">
            {seasons.length === 0 && <p className="text-slate-400 italic">No seasons found.</p>}
            {seasons.sort((a,b) => a.SeasonNumber - b.SeasonNumber).map(season => (
                <Link 
                    key={season.SeasonID}
                    to={`/seasons/${season.SeasonID}`}
                    className="block bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition group relative"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition">Season {season.SeasonNumber}</h3>
                            <p className="text-slate-500 text-sm mt-1">{season.SeasonDescription}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {season.DateStarted || 'TBA'} - {season.DateEnded || 'TBA'}</span>
                                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">ID: {season.SeasonID}</span>
                            </div>
                        </div>
                        {user?.role === UserRole.ADMIN && (
                            <button onClick={(e) => handleDelete(e, season.SeasonID)} className="text-slate-300 hover:text-red-500 transition p-2">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </Link>
            ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                    <h3 className="text-xl font-bold mb-4">Add Season</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input 
                            type="number" placeholder="Season Number" required 
                            className="w-full p-3 border rounded-lg"
                            value={newSeason.SeasonNumber}
                            onChange={e => setNewSeason({...newSeason, SeasonNumber: Number(e.target.value)})}
                        />
                        <textarea 
                            placeholder="Description" maxLength={200}
                            className="w-full p-3 border rounded-lg"
                            value={newSeason.SeasonDescription}
                            onChange={e => setNewSeason({...newSeason, SeasonDescription: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500">Start Date</label>
                                <input type="date" required className="w-full p-2 border rounded-lg" onChange={e => setNewSeason({...newSeason, DateStarted: e.target.value})}/>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">End Date</label>
                                <input type="date" required className="w-full p-2 border rounded-lg" onChange={e => setNewSeason({...newSeason, DateEnded: e.target.value})}/>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                            <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default ShowDetails;
