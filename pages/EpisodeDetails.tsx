import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ArrowLeft, Clock, User, UserPlus } from 'lucide-react';

const EpisodeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const epId = Number(id);
  const { user } = useAuth();
  const [details, setDetails] = useState<any>(null);
  const [actors, setActors] = useState(db.getCast()); // For selection
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New Screentime Form
  const [stForm, setStForm] = useState({
      StartTime: '',
      EndTime: '',
      RoleName: '',
      RoleType: '',
      ActorIds: [] as number[]
  });

  const fetchDetails = () => {
      setDetails(db.getDetailedEpisode(epId));
  };

  useEffect(() => {
      fetchDetails();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epId]);

  const handleAddScreenTime = (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const newId = Math.floor(Math.random() * 1000000);
          db.addScreenTime({
              ScreenTimeID: newId,
              StartTime: stForm.StartTime,
              EndTime: stForm.EndTime,
              RoleName: stForm.RoleName,
              RoleType: stForm.RoleType
          }, epId, stForm.ActorIds);
          fetchDetails();
          setIsModalOpen(false);
      } catch(err: any) {
          alert(err.message);
      }
  };

  const toggleActorSelection = (aid: number) => {
      setStForm(prev => {
          if (prev.ActorIds.includes(aid)) {
              return { ...prev, ActorIds: prev.ActorIds.filter(id => id !== aid) };
          }
          return { ...prev, ActorIds: [...prev.ActorIds, aid] };
      });
  };

  if (!details) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-8">
        <button onClick={() => window.history.back()} className="inline-flex items-center text-slate-500 hover:text-blue-600 transition">
            <ArrowLeft size={16} className="mr-1" /> Back to Season
        </button>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{details.Episodetitle}</h1>
                    <p className="text-slate-500 mt-2">{details.EpisodeDescription}</p>
                    <div className="mt-4 flex gap-4 text-sm text-slate-600">
                        <span>Rating: {details.Rating}/10</span>
                        <span>Aired: {details.DatePublished}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">EP #{details.EpisodeNumber}</span>
                </div>
            </div>
        </div>

        {/* ScreenTime & Cast Section */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Cast Appearances (Screentime)</h2>
                {user?.role === UserRole.ADMIN && (
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                        <UserPlus size={18} /> Log Appearance
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {details.screenTimes.length === 0 && <p className="text-slate-400 italic">No appearances logged yet.</p>}
                {details.screenTimes.map((st: any) => (
                    <div key={st.ScreenTimeID} className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                                <Clock size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700">{new Date(st.StartTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    <span className="text-slate-400">-</span>
                                    <span className="font-bold text-slate-700">{new Date(st.EndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-sm text-slate-500">{st.RoleType}: <span className="font-medium text-slate-800">{st.RoleName}</span></p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap justify-end">
                            {st.actors.map((actor: any) => (
                                <span key={actor.ActorID} className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                                    <User size={12} /> {actor.ActorsFirstName} {actor.ActorsLastName}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Add Screentime Modal */}
        {isModalOpen && (
             <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4">Log Cast Appearance</h3>
                    <form onSubmit={handleAddScreenTime} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500">Start Time</label>
                                <input required type="datetime-local" className="w-full p-2 border rounded" onChange={e => setStForm({...stForm, StartTime: e.target.value})} />
                            </div>
                             <div>
                                <label className="text-xs text-slate-500">End Time</label>
                                <input required type="datetime-local" className="w-full p-2 border rounded" onChange={e => setStForm({...stForm, EndTime: e.target.value})} />
                            </div>
                        </div>
                        <input required placeholder="Role Name (e.g. Commander Shepard)" className="w-full p-3 border rounded" onChange={e => setStForm({...stForm, RoleName: e.target.value})} />
                        <select className="w-full p-3 border rounded bg-white" onChange={e => setStForm({...stForm, RoleType: e.target.value})}>
                            <option value="Main">Main Character</option>
                            <option value="Guest">Guest Appearance</option>
                            <option value="Background">Background</option>
                        </select>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Select Actors</label>
                            <div className="h-32 overflow-y-auto border rounded p-2 space-y-1">
                                {actors.map(a => (
                                    <label key={a.ActorID} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={stForm.ActorIds.includes(a.ActorID)}
                                            onChange={() => toggleActorSelection(a.ActorID)}
                                        />
                                        <span className="text-sm">{a.ActorsFirstName} {a.ActorsLastName}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Log Appearance</button>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="w-full py-2 text-slate-500">Cancel</button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default EpisodeDetails;
