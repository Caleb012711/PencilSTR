import React, { useState } from 'react';

interface TrialModalProps {
  planName: string;
  price: string;
  onClose: () => void;
}

export const TrialModal: React.FC<TrialModalProps> = ({ planName, price, onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isActivated, setIsActivated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsActivated(true);
    setTimeout(() => {
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#141413] text-[#111110] dark:text-[#F4F3EF] rounded-xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 border-b border-[#E5E4DF] dark:border-[#262624] bg-[#F9F8F5] dark:bg-[#1A1A18] flex justify-between items-center">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#92400E] dark:text-[#FDE68A] block">
              14-DAY INSTITUTIONAL PASS
            </span>
            <h3 className="font-serif text-xl font-bold text-[#111110] dark:text-[#F4F3EF]">
              Start {planName} Trial
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#E5E4DF] dark:hover:bg-[#252522] text-[#666562] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {isActivated ? (
          <div className="p-8 text-center space-y-3">
            <span className="w-12 h-12 rounded-full bg-[#E8F5EE] dark:bg-[#064E3B]/40 text-[#059669] dark:text-[#34D399] flex items-center justify-center mx-auto text-2xl">
              <svg className="w-3.5 h-3.5 inline-block text-[#059669] dark:text-[#34D399]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h4 className="font-bold text-lg text-[#111110] dark:text-[#F4F3EF]">Trial License Activated!</h4>
            <p className="text-xs font-mono text-[#666562] dark:text-[#9A9893]">
              Welcome aboard, {name || 'Operator'}. Unlocking full MLS price radar and CC&amp;R AI scanning tools for {email}...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-mono">
            <div className="p-3 rounded bg-[#F9F8F5] dark:bg-[#1A1A18] border border-[#E5E4DF] dark:border-[#262624] flex justify-between items-center">
              <div>
                <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] uppercase block">Selected Tier</span>
                <span className="font-bold text-[#111110] dark:text-[#F4F3EF]">{planName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#8F8D88] dark:text-[#9A9893] block">Price</span>
                <span className="font-bold text-[#0B3B24] dark:text-[#34D399]">{price}</span>
              </div>
            </div>

            <div>
              <label className="text-[#666562] dark:text-[#9A9893] block mb-1 font-semibold">Full Name / Fund Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Marcus Vance (Vance Capital)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F9F8F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded px-3 py-2 text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF]"
              />
            </div>

            <div>
              <label className="text-[#666562] dark:text-[#9A9893] block mb-1 font-semibold">Work / Deal Sourcing Email</label>
              <input
                type="email"
                required
                placeholder="operator@acquisitions.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F9F8F5] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded px-3 py-2 text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF]"
              />
            </div>

            <div className="pt-2 text-[11px] text-[#8F8D88] dark:text-[#9A9893] leading-relaxed">
              No credit card required for initial 14 days. Instant access to live MLS sweep radar and CC&amp;R zoning auditor.
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] font-bold uppercase tracking-wider hover:bg-black dark:hover:bg-white transition-all cursor-pointer shadow-sm text-center"
            >
              Activate 14-Day Free Access →
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
