import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TVShows from './pages/TVShows';
import ShowDetails from './pages/ShowDetails';
import SeasonDetails from './pages/SeasonDetails';
import EpisodeDetails from './pages/EpisodeDetails';
import CastPage from './pages/Cast';
import CrewPage from './pages/Crew';
import AdminUsers from './pages/AdminUsers';
import { LogOut, LayoutDashboard, Tv, Users, Clapperboard, ShieldCheck } from 'lucide-react';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return <>{children}</>;

  const navClass = (path: string) => 
    `flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
      location.pathname.startsWith(path) 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
    }`;

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold tracking-tight text-blue-400">ShowStream</h1>
          <p className="text-xs text-slate-500 mt-1">Media Manager v1.0</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className={navClass('/dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/shows" className={navClass('/shows')}>
            <Tv size={20} />
            <span>TV Shows</span>
          </Link>
          <Link to="/cast" className={navClass('/cast')}>
            <Users size={20} />
            <span>Cast Database</span>
          </Link>
          <Link to="/crew" className={navClass('/crew')}>
            <Clapperboard size={20} />
            <span>Crew Registry</span>
          </Link>
          
          {user.role === UserRole.ADMIN && (
              <>
                <div className="my-4 border-t border-slate-800"></div>
                <Link to="/admin/users" className={navClass('/admin/users')}>
                  <ShieldCheck size={20} />
                  <span>User Management</span>
                </Link>
              </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-white">{user.username}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-slate-900"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/shows" element={<PrivateRoute><TVShows /></PrivateRoute>} />
            <Route path="/shows/:title" element={<PrivateRoute><ShowDetails /></PrivateRoute>} />
            <Route path="/seasons/:id" element={<PrivateRoute><SeasonDetails /></PrivateRoute>} />
            <Route path="/episodes/:id" element={<PrivateRoute><EpisodeDetails /></PrivateRoute>} />
            <Route path="/cast" element={<PrivateRoute><CastPage /></PrivateRoute>} />
            <Route path="/crew" element={<PrivateRoute><CrewPage /></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute><AdminUsers /></PrivateRoute>} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;