import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Episode, UserRole } from '../types';
import { Plus, Trash2, Star, ArrowLeft, Film } from 'lucide-react';

const SeasonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const seasonId = Number(id);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  
  // Assuming we could fetch Season details to display header... skipping for brevity but easy to add
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEp, setNewEp] = useState<Partial<Episode>>({
      EpisodeNumber: 0, // Will require unique input
      Episodetitle: '',
      EpisodeDescription: '',
      Rating: 5,
      DatePublished: ''
  });

  useEffect(() => {
      setEpisodes(db.getEpisodes().filter(e => e.SeasonID === seasonId));
  }, [seasonId]);

  const handleDelete = (e: React.MouseEvent, epNum: number) => {
      e.preventDefault();
      if(window.confirm('Delete this episode?')) {
          try {
              db.deleteEpisode(epNum);
              setEpisodes(db.getEpisodes().filter(e => e.SeasonID === seasonId));
          } catch(err: any) {
              alert(err.message);
          }
      }
  };

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      try {
          db.addEpisode({
              EpisodeNumber: Number(newEp.EpisodeNumber),
              Episodetitle: newEp.Episodetitle || '',
              EpisodeDescription: newEp.EpisodeDescription || '',
              Rating: Number(newEp.Rating),
              DatePublished: newEp.DatePublished || '',
              SeasonID: seasonId
          });
          setEpisodes(db.getEpisodes().filter(e => e.SeasonID === seasonId));
          setIsModalOpen(false);
      } catch(err: any) {
          alert(err.message);
      }
  };

  return (
    <div className="space-y-6">
        <button onClick={() => window.history.back()} className="inline-flex items-center text-slate-500 hover:text-blue-600 transition">
            <ArrowLeft size={16} className="mr-1" /> Back to Season
        </button>

        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
                 <h1 className="text-2xl font-bold text-slate-800">Season {seasonId} Episodes</h1>
                 <p className="text-slate-500 text-sm">Manage individual episodes</p>
            </div>
            {user?.role === UserRole.ADMIN && (
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <Plus size={18} /> New Episode
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 gap-4">
            {episodes.map(ep => (
                <Link 
                    key={ep.EpisodeNumber} 
                    to={`/episodes/${ep.EpisodeNumber}`}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition flex justify-between items-center group"
                >
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                            <Film size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 group-hover:text-blue-600">{ep.Episodetitle}</h3>
                            <p className="text-xs text-slate-500 mb-1">Episode #{ep.EpisodeNumber}</p>
                            <p className="text-sm text-slate-600 line-clamp-1">{ep.EpisodeDescription}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1 text-yellow-500 font-medium">
                            <Star size={16} fill="currentColor" /> {ep.Rating}
                        </div>
                        {user?.role === UserRole.ADMIN && (
                            <button onClick={(e) => handleDelete(e, ep.EpisodeNumber)} className="text-slate-300 hover:text-red-500 p-2">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </Link>
            ))}
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                    <h3 className="text-xl font-bold mb-4">Add Episode</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <input 
                                type="number" placeholder="Episode ID (Unique)" required 
                                className="w-full p-3 border rounded-lg"
                                onChange={e => setNewEp({...newEp, EpisodeNumber: Number(e.target.value)})}
                            />
                             <input 
                                type="text" placeholder="Title" required 
                                className="w-full p-3 border rounded-lg"
                                onChange={e => setNewEp({...newEp, Episodetitle: e.target.value})}
                            />
                        </div>
                        <textarea 
                            placeholder="Description" maxLength={200}
                            className="w-full p-3 border rounded-lg"
                            onChange={e => setNewEp({...newEp, EpisodeDescription: e.target.value})}
                        />
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs text-slate-500">Rating (1-10)</label>
                                <input type="number" min="1" max="10" className="w-full p-2 border rounded-lg" value={newEp.Rating} onChange={e => setNewEp({...newEp, Rating: Number(e.target.value)})}/>
                             </div>
                             <div>
                                <label className="text-xs text-slate-500">Date Published</label>
                                <input type="date" required className="w-full p-2 border rounded-lg" onChange={e => setNewEp({...newEp, DatePublished: e.target.value})}/>
                            </div>
                        </div>
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg mt-2 hover:bg-blue-700">Create Episode</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-2 text-slate-500">Cancel</button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default SeasonDetails;
