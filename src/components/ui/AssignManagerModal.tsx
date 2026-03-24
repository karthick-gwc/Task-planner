import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppRedux';
import {fetchAllUsers, assignManager } from '@/components/store/slices/authSlice';  
import { Input } from './Input';
import { Button } from './Button';
useAppDispatch
interface AssignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: any;
}

export function AssignManagerModal({ isOpen, onClose, employee }: AssignManagerModalProps) {
  const dispatch = useAppDispatch();
  const { users, user: currentUser } = useAppSelector((s) => s.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (isOpen && users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [isOpen, dispatch, users.length]);

  const managers = users.filter(u => u.role === 'manager');
  const filteredManagers = managers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedManager || !employee || !currentUser) return;

    setIsAssigning(true);
    try {
      await dispatch(assignManager({
        employee_id: employee.id,
        manager_id: selectedManager,
        assigned_by: currentUser.id,
      })).unwrap();

      toast.success(`Manager assigned successfully to ${employee.name}`);
      onClose();
    } catch (error) {
      toast.error('Failed to assign manager');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)]">Assign Manager</h3>
              <p className="text-sm text-[var(--text-muted)]">
                {employee ? `Assign manager to ${employee.name}` : 'Select an employee'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--surface-3)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Search */}
          <Input
            placeholder="Search managers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          {/* Manager List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredManagers.map((manager) => (
              <div
                key={manager.id}
                onClick={() => setSelectedManager(manager.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedManager === manager.id
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {manager.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text)] truncate">{manager.name}</p>
                    <p className="text-sm text-[var(--text-muted)] truncate">{manager.email}</p>
                  </div>
                  {selectedManager === manager.id && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredManagers.length === 0 && (
              <div className="text-center py-8 text-[var(--text-muted)]">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No managers found</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-[var(--border)]">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedManager || isAssigning}
            className="flex-1"
          >
            {isAssigning ? 'Assigning...' : 'Assign Manager'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}