import React from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Tv, Users, Film, Calendar } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color} text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const shows = db.getShows();
  const episodes = db.getEpisodes();
  const cast = db.getCast();
  const crew = db.getCrew();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 mt-1">Overview of your media database</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium border border-blue-100">
           Welcome, {user?.username}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Shows" value={shows.length} icon={<Tv size={24} />} color="bg-indigo-500" />
        <StatCard title="Episodes Aired" value={episodes.length} icon={<Film size={24} />} color="bg-rose-500" />
        <StatCard title="Cast Members" value={cast.length} icon={<Users size={24} />} color="bg-emerald-500" />
        <StatCard title="Crew Members" value={crew.length} icon={<Calendar size={24} />} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recently Added Shows</h3>
          <ul className="space-y-3">
            {shows.slice(-5).reverse().map(show => (
              <li key={show.Title} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <span className="font-medium text-slate-700">{show.Title}</span>
                <span className="text-xs text-slate-400 truncate max-w-[200px]">{show.Description}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Top Rated Episodes</h3>
          <ul className="space-y-3">
            {episodes.sort((a,b) => b.Rating - a.Rating).slice(0, 5).map(ep => (
              <li key={ep.EpisodeNumber} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold text-sm">
                        {ep.Rating}
                    </div>
                    <span className="font-medium text-slate-700">{ep.Episodetitle}</span>
                 </div>
                 <span className="text-xs text-slate-400">Ep #{ep.EpisodeNumber}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
