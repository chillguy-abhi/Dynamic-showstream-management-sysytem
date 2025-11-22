import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { Trash2, Shield, User as UserIcon, ShieldCheck, ShieldAlert, ArrowUpCircle, ArrowDownCircle, Plus, X } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: UserRole.USER });

  const loadUsers = useCallback(() => {
    setUsers(db.getAllUsers());
  }, []);

  useEffect(() => {
    loadUsers();

    // Real-time: Listen for changes in other tabs
    const handleStorageChange = () => {
        loadUsers();
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUsers]);

  const handleDelete = (e: React.MouseEvent, username: string) => {
    e.stopPropagation(); // Prevent bubbling
    
    if (username === currentUser?.username) {
        alert("You cannot delete your own account.");
        return;
    }

    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        try {
            // 1. Perform DB Operation synchronously
            db.deleteUser(username);
            
            // 2. Reload data from DB to ensure UI matches real state
            loadUsers();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete user.");
            loadUsers(); // Revert state on error
        }
    }
  };

  const toggleRole = (username: string, currentRole: UserRole) => {
    if (username === currentUser?.username) {
        alert("You cannot change your own role.");
        return;
    }

    const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    
    try {
        // 1. Perform DB Operation
        db.updateUserRole(username, newRole);

        // 2. Reload to reflect changes
        loadUsers();
    } catch (err) {
        console.error("Role update failed", err);
        alert("Failed to update role.");
        loadUsers();
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newUser.username || !newUser.password) {
          alert("Username and password are required.");
          return;
      }

      // Trim username only on submit to allow typing spaces if needed
      const userToAdd = { ...newUser, username: newUser.username.trim() }; 

      try {
          // Actual DB Call (async because of password hashing)
          await db.registerUser(userToAdd.username, userToAdd.password, userToAdd.role);
          
          // Update UI
          setIsModalOpen(false);
          setNewUser({ username: '', password: '', role: UserRole.USER });
          
          // Reload to get fresh list
          loadUsers();
      } catch (err: any) {
          alert(err.message || "Failed to create user");
      }
  };

  if (currentUser?.role !== UserRole.ADMIN) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <ShieldAlert size={48} className="mb-4 text-red-500" />
              <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
              <p>You do not have permission to view this page.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system access and user roles</p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                <ShieldCheck size={18} />
                <span>Total Users: {users.length}</span>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
            >
                <Plus size={20} />
                <span>Add User</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Username</th>
              <th className="p-4 font-semibold text-slate-600">Role</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
                <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400 italic">No users found.</td>
                </tr>
            ) : users.map((u) => (
              <tr key={u.username} className="hover:bg-slate-50 transition">
                <td className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-full ${u.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                    {u.role === UserRole.ADMIN ? <Shield size={16} /> : <UserIcon size={16} />}
                  </div>
                  <span className="font-medium text-slate-700">{u.username}</span>
                  {u.username === currentUser?.username && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">You</span>}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.role === UserRole.ADMIN 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {u.username !== currentUser?.username && (
                    <div className="flex justify-end items-center gap-3">
                        <button 
                            onClick={() => toggleRole(u.username, u.role)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition ${
                                u.role === UserRole.ADMIN 
                                ? 'text-amber-600 hover:bg-amber-50' 
                                : 'text-indigo-600 hover:bg-indigo-50'
                            }`}
                            title={u.role === UserRole.ADMIN ? "Demote to User" : "Promote to Admin"}
                        >
                            {u.role === UserRole.ADMIN ? (
                                <><ArrowDownCircle size={16} /> Demote</>
                            ) : (
                                <><ArrowUpCircle size={16} /> Promote</>
                            )}
                        </button>
                        
                        <button 
                            onClick={(e) => handleDelete(e, u.username)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                            title="Delete User"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Add New User</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleAddUser} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                        <input 
                            required
                            type="text"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={newUser.username}
                            onChange={e => setNewUser({...newUser, username: e.target.value})}
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input 
                            required
                            type="password"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                            value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                            placeholder="Enter password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                        <select 
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white transition"
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                        >
                            <option value={UserRole.USER}>User</option>
                            <option value={UserRole.ADMIN}>Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-sm mt-2">
                        Create User
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;