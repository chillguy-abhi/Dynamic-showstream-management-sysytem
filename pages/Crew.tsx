import React, { useState } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Plus, Briefcase } from 'lucide-react';

const CrewPage: React.FC = () => {
  const { user } = useAuth();
  const [crew, setCrew] = useState(db.getCrew());
  const [newCrew, setNewCrew] = useState({ FirstName: '', LastName: '', Role: '' });

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      const id = Math.floor(Math.random() * 100000);
      db.addCrew({
          CrewID: id,
          FirstName: newCrew.FirstName,
          LastName: newCrew.LastName,
          PersonDefination: newCrew.Role
      });
      setCrew(db.getCrew());
      setNewCrew({ FirstName: '', LastName: '', Role: '' });
  };

  return (
    <div className="space-y-8">
        <h1 className="text-3xl font-bold text-slate-800">Crew Registry</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {crew.map(c => (
                    <div key={c.CrewID} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{c.FirstName} {c.LastName}</p>
                            <p className="text-sm text-slate-500">{c.PersonDefination}</p>
                        </div>
                    </div>
                ))}
            </div>

            {user?.role === UserRole.ADMIN && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-amber-500" /> Add Crew Member
                    </h3>
                    <form onSubmit={handleAdd} className="space-y-3">
                        <input 
                            placeholder="First Name" required 
                            className="w-full p-3 border rounded-lg"
                            value={newCrew.FirstName}
                            onChange={e => setNewCrew({...newCrew, FirstName: e.target.value})}
                        />
                        <input 
                            placeholder="Last Name" required 
                            className="w-full p-3 border rounded-lg"
                            value={newCrew.LastName}
                            onChange={e => setNewCrew({...newCrew, LastName: e.target.value})}
                        />
                         <input 
                            placeholder="Role Definition (e.g. Director)" required 
                            className="w-full p-3 border rounded-lg"
                            value={newCrew.Role}
                            onChange={e => setNewCrew({...newCrew, Role: e.target.value})}
                        />
                        <button className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">Add to Registry</button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
};

export default CrewPage;
