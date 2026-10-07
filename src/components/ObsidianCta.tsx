import React, { useState } from 'react';

export const ObsidianCta: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 3500);
  };

  return (
    <section className="max-w-[1360px] w-full mx-auto px-6 md:px-10 pb-20">
      <div className="bg-[#121214] text-white rounded-2xl p-8 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-neutral-800 shadow-2xl">
        {/* Ambient Warm Amber Glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#D97706]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-xl z-10">
          <span className="text-xs font-sans font-semibold text-[#D97706] uppercase tracking-wider block mb-2">
            Institutional Access
          </span>
          <h3 className="font-serif text-2xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight">
            Tour your next short-term rental with sovereign conviction.
          </h3>
          <p className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">
            Stop losing out to hedge funds and syndicated operators. Access the institutional deal terminal today.
          </p>
        </div>

        {/* Integrated Email Input Field */}
        <div className="z-10 w-full md:w-auto shrink-0">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 bg-neutral-900/90 p-1.5 rounded-lg border border-neutral-700 w-full sm:w-[440px]"
          >
            <input
              className="w-full bg-transparent px-3 py-2 text-white placeholder-neutral-400 text-xs font-mono focus:outline-none"
              placeholder="Enter your work email..."
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitted}
            />
            <button
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center font-mono text-xs font-bold uppercase tracking-wider bg-[#D97706] text-[#111110] px-5 py-2.5 rounded hover:bg-[#D97706]/90 transition-all font-semibold cursor-pointer whitespace-nowrap"
              type="submit"
              disabled={submitted}
            >
              {submitted ? 'Terminal Invite Sent' : 'Get Early Access →'}
            </button>
          </form>
          {submitted && (
            <p className="text-[11px] font-mono text-[#059669] mt-2 text-center sm:text-left">
              Invitation dispatched to {email}. Check your inbox for terminal credentials.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
