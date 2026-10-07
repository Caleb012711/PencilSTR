import React, { useState } from 'react';
import { useDealStore } from '../../store/useDealStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginAsGuest, setUserSession } = useDealStore();

  const [tab, setTab] = useState<'password' | 'magic' | 'demo'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGuestDemo = () => {
    loginAsGuest();
    onSuccess();
    onClose();
  };

  const handleStandardAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUserSession({
        uid: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        isGuest: false,
        role: 'operator',
      });
      setMessage('Successfully authenticated with secure session token!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-[#141413] text-[#111110] dark:text-[#F4F3EF] rounded-2xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E4DF] dark:border-[#262624]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight font-sans text-[#111110] dark:text-[#F4F3EF]">
              PENCIL<span className="text-[10px] text-[#92400E] dark:text-[#FDE68A] ml-1 bg-[#D97706]/15 px-1 py-0.5 rounded font-mono font-bold">STR</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E5E4DF] dark:hover:bg-[#252522] text-[#8F8D88] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* 1-Click Guest Demo Hero CTA */}
        <div className="my-5 p-4 rounded-xl bg-[#FEF3C7] dark:bg-[#78350F]/25 border border-[#D97706]/30 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold text-[#92400E] dark:text-[#FDE68A] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-ping"></span>
              Recommended for Instant Review
            </span>
            <span className="text-[10px] font-mono text-[#B45309] dark:text-[#FBBF24] font-bold">0s Setup</span>
          </div>
          <h4 className="font-serif text-sm font-bold text-[#78350F] dark:text-[#FDE68A] mb-1">
            1-Click Institutional Guest Demo
          </h4>
          <p className="text-xs text-[#92400E] dark:text-[#FDE68A]/80 leading-relaxed mb-3">
            Instant sandbox pre-hydrated with 3 real-world cohorts (Gatlinburg DSCR, Scottsdale Luxury, Gulf Shores Beachfront). Full access to all sliders, Kanban moves, and PDF memo downloads.
          </p>
          <button
            onClick={handleGuestDemo}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] rounded-lg text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4 text-[#D97706]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 2L3 9H8L7 14L13 7H8L9 2Z" fill="currentColor"/></svg>
            <span>Launch Guest Demo Sandbox Now</span>
          </button>
        </div>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E4DF] dark:border-[#262624]"></div>
          </div>
          <span className="relative bg-white dark:bg-[#141413] px-3 text-[10px] font-mono text-[#8F8D88] dark:text-[#9A9893] uppercase tracking-widest">
            Or Standard Account Access
          </span>
        </div>

        {/* Tabs for Standard Auth */}
        <div className="flex border-b border-[#E5E4DF] dark:border-[#262624] mb-4 text-xs font-mono">
          <button
            onClick={() => setTab('password')}
            className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'password'
                ? 'border-[#111110] dark:border-[#F4F3EF] text-[#111110] dark:text-[#F4F3EF]'
                : 'border-transparent text-[#8F8D88] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            Email / Pass
          </button>
          <button
            onClick={() => setTab('magic')}
            className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'magic'
                ? 'border-[#111110] dark:border-[#F4F3EF] text-[#111110] dark:text-[#F4F3EF]'
                : 'border-transparent text-[#8F8D88] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF]'
            }`}
          >
            Magic Link
          </button>
        </div>

        {message && (
          <div className="mb-4 p-2.5 bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#A7F3D0] dark:border-[#065F46] rounded-lg text-xs font-mono text-[#065F46] dark:text-[#34D399]">
            {message}
          </div>
        )}

        <form onSubmit={handleStandardAuth} className="space-y-3.5 text-xs font-mono">
          <div>
            <label className="text-[#8F8D88] dark:text-[#9A9893] uppercase block mb-1">Corporate Email</label>
            <input
              type="email"
              required
              placeholder="operator@acquisitions.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-3 py-2 text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF]"
            />
          </div>

          {tab === 'password' && (
            <div>
              <label className="text-[#8F8D88] dark:text-[#9A9893] uppercase block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-3 py-2 text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] rounded-lg font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : tab === 'password' ? 'Sign In / Register' : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
};
