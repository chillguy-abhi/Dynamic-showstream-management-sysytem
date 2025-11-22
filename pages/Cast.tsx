import React, { useState } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Plus, User } from 'lucide-react';

const CastPage: React.FC = () => {
  const { user } = useAuth();
  const [cast, setCast] = useState(db.getCast());
  const [newActor, setNewActor] = useState({ FirstName: '', LastName: '' });

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const id = Math.floor(Math.random() * 100000);
      db.addCast({
          ActorID: id,
          ActorsFirstName: newActor.FirstName,
          ActorsLastName: newActor.LastName
      });
      setCast(db.getCast());
      setNewActor({ FirstName: '', LastName: '' });
  };

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold text-slate-800">Cast Database</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cast.map(actor => (
                    <div key={actor.ActorID} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                            <User size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{actor.ActorsFirstName} {actor.ActorsLastName}</p>
                            <p className="text-xs text-slate-400">ID: {actor.ActorID}</p>
                        </div>
                    </div>
                ))}
            </div>

            {user?.role === UserRole.ADMIN && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-blue-500" /> Add Actor
                    </h3>
                    <form onSubmit={handleAdd} className="space-y-3">
                        <input 
                            placeholder="First Name" required 
                            className="w-full p-3 border rounded-lg"
                            value={newActor.FirstName}
                            onChange={e => setNewActor({...newActor, FirstName: e.target.value})}
                        />
                        <input 
                            placeholder="Last Name" required 
                            className="w-full p-3 border rounded-lg"
                            value={newActor.LastName}
                            onChange={e => setNewActor({...newActor, LastName: e.target.value})}
                        />
                        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add to Database</button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
};

export default CastPage;
