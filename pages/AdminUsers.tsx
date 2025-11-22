import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { User, UserRole } from '../types';
import { Trash2, Shield, User as UserIcon, ShieldCheck, ShieldAlert } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(db.getAllUsers());
  };

  const handleDelete = (username: string) => {
    if (username === currentUser?.username) {
        alert("You cannot delete your own account.");
        return;
    }

    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        db.deleteUser(username);
        loadUsers();
    }
  };

  const toggleRole = (username: string, currentRole: UserRole) => {
    if (username === currentUser?.username) {
        alert("You cannot change your own role.");
        return;
    }

    const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    if (window.confirm(`Change role for "${username}" to ${newRole}?`)) {
        db.updateUserRole(username, newRole);
        loadUsers();
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
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
           <ShieldCheck size={18} />
           <span>Total Users: {users.length}</span>
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
            {users.map((u) => (
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
                <td className="p-4 text-right space-x-2">
                  {u.username !== currentUser?.username && (
                    <>
                        <button 
                            onClick={() => toggleRole(u.username, u.role)}
                            className="text-slate-400 hover:text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition text-sm font-medium"
                        >
                            {u.role === UserRole.ADMIN ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                        <button 
                            onClick={() => handleDelete(u.username)}
                            className="text-slate-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition"
                            title="Delete User"
                        >
                            <Trash2 size={18} />
                        </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;