import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Building2, 
  Hash, 
  GraduationCap, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../utils/cn';

const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    displayName: '',
    trainerNumber: '',
    institutionName: '',
    institutionLogo: '',
    level: 'Level 3'
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        trainerNumber: profile.trainerNumber || '',
        institutionName: profile.institutionName || '',
        institutionLogo: profile.institutionLogo || '',
        level: profile.level || 'Level 3'
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: new Date()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Please sign in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          
          <div className="relative">
            <div className="w-32 h-32 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-200 dark:shadow-none overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.displayName?.[0] || user.email?.[0] || 'U'
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2 relative z-10">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{user.displayName || 'Trainer Profile'}</h1>
            <div className="flex items-center justify-center md:justify-start gap-3 text-slate-500 dark:text-slate-400 font-bold">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30">
              {profile?.subscription || 'Free'} Account
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Personal Details
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600" />
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="input-field pl-14 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Trainer Number</label>
                <div className="relative">
                  <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600" />
                  <input 
                    type="text" 
                    value={formData.trainerNumber}
                    onChange={(e) => setFormData({ ...formData, trainerNumber: e.target.value })}
                    className="input-field pl-14 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder="e.g. TR-2024-001"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 space-y-8">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Professional Info
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Institution Name</label>
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600" />
                  <input 
                    type="text" 
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    className="input-field pl-14 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder="Enter your institution"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Institution Logo URL</label>
                <div className="relative">
                  <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600" />
                  <input 
                    type="text" 
                    value={formData.institutionLogo}
                    onChange={(e) => setFormData({ ...formData, institutionLogo: e.target.value })}
                    className="input-field pl-14 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    placeholder="Paste logo image URL"
                  />
                </div>
                {formData.institutionLogo && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                    <img 
                      src={formData.institutionLogo} 
                      alt="Logo Preview" 
                      className="max-h-16 object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Default Level</label>
                <div className="relative">
                  <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600" />
                  <select 
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="input-field pl-14 appearance-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="Level 3">Level 3</option>
                    <option value="Level 4">Level 4</option>
                    <option value="Level 5">Level 5</option>
                    <option value="Level 6">Level 6</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col items-center gap-6">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-bold border border-rose-100 dark:border-rose-900/30 w-full max-w-md">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isSaving}
              className={cn(
                "btn-primary w-full max-w-md py-6 text-lg dark:shadow-none",
                saveSuccess && "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 dark:shadow-none"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Saving Changes...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Profile Updated!
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
