import React, { useState } from 'react';
import { useDealStore } from '../../store/useDealStore';

interface IngestListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const IngestListingModal: React.FC<IngestListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addDeal, setSelectedDealId, setCurrentView, selectedModel, openRouterApiKey } = useDealStore();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepMessage, setStepMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleIngest = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    setLoading(true);
    setError(null);
    setStepMessage('Connecting to Firecrawl scraper & extracting listing DOM...');

    setTimeout(() => {
      setStepMessage(`Prompting ${selectedModel} for structured property JSON & HOA estimates...`);
    }, 700);

    setTimeout(() => {
      setStepMessage('Querying RentCast submarket ADR benchmarks & tax records...');
    }, 1400);

    try {
      const res = await fetch('/api/deals/ingest-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openrouter-api-key': openRouterApiKey || '',
          'x-openrouter-model': selectedModel || '',
        },
        body: JSON.stringify({
          url: targetUrl,
          model: selectedModel,
          openRouterApiKey,
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setLoading(false);
        if (data.deal) {
          addDeal(data.deal);
          setSelectedDealId(data.deal.id);
          setCurrentView('underwriter');
          onSuccess();
          onClose();
        } else {
          setError(data.error || 'Failed to extract property details.');
        }
      }, 1900);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Network error during ingestion.');
    }
  };

  const sampleLinks = [
    {
      title: 'Smoky Mountains Cabin (4-Bed)',
      url: 'https://www.zillow.com/homedetails/422-Alpine-Ridge-Trail-Gatlinburg-TN-37738/248190_zpid/',
    },
    {
      title: 'Scottsdale Luxury Villa (5-Bed)',
      url: 'https://www.redfin.com/AZ/Scottsdale/6810-E-Desert-Cove-Ave-85254/home/1129384',
    },
    {
      title: 'Gulf Shores Beachfront (6-Bed)',
      url: 'https://www.realtor.com/realestateandhomes-detail/1840-West-Beach-Blvd-Gulf-Shores-AL-36542',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#141413] text-[#111110] dark:text-[#F4F3EF] rounded-2xl border border-[#E5E4DF] dark:border-[#262624] shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E4DF] dark:border-[#262624]">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#92400E] dark:text-[#F59E0B] font-bold block">
              FIRECRAWL + GEMINI EXTRACTION PIPELINE
            </span>
            <h3 className="font-serif text-xl font-bold text-[#111110] dark:text-[#F4F3EF]">
              Ingest Listing URL
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#E5E4DF] dark:hover:bg-[#252522] text-[#8F8D88] dark:text-[#9A9893] hover:text-[#111110] dark:hover:text-[#F4F3EF] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 bg-[#FEF2F2] dark:bg-[#7F1D1D]/30 border border-[#FECACA] dark:border-[#991B1B] rounded-lg text-xs font-mono text-[#991B1B] dark:text-[#FCA5A5]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <svg className="w-4.5 h-4.5 animate-spin text-[#8B5CF6]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 8C13.5 11 11 13.5 8 13.5C5 13.5 2.5 11 2.5 8C2.5 5 5 2.5 8 2.5C10 2.5 12 3.8 13 5.6M13.5 2.5V6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div className="space-y-1">
              <p className="font-serif font-bold text-sm text-[#111110] dark:text-[#F4F3EF]">
                Autonomous Underwriting Pipeline Active
              </p>
              <p className="font-mono text-xs text-[#666562] dark:text-[#9A9893] animate-pulse">
                {stepMessage}
              </p>
            </div>
          </div>
        ) : (
          <div className="my-6 space-y-4">
            <div>
              <label className="text-xs font-mono text-[#8F8D88] dark:text-[#9A9893] uppercase block mb-1.5">
                Paste Zillow, Redfin, or Brokerage URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://www.zillow.com/homedetails/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-[#FAF9F6] dark:bg-[#1E1E1C] border border-[#E5E4DF] dark:border-[#2E2E2B] rounded-lg px-3.5 py-2 text-xs font-mono text-[#111110] dark:text-[#F4F3EF] focus:outline-none focus:border-[#111110] dark:focus:border-[#F4F3EF]"
                />
                <button
                  onClick={() => handleIngest(url)}
                  disabled={!url.trim()}
                  className="px-5 py-2 bg-[#111110] dark:bg-[#F4F3EF] text-white dark:text-[#111110] rounded-lg text-xs font-mono font-bold hover:bg-black dark:hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Ingest &amp; Pencil
                </button>
              </div>
            </div>

            {/* Quick Test Samples */}
            <div className="pt-4 border-t border-[#E5E4DF] dark:border-[#262624]">
              <span className="text-[10px] font-mono text-[#8F8D88] dark:text-[#9A9893] uppercase block mb-2">
                Or select 1-click verified test listing:
              </span>
              <div className="space-y-2">
                {sampleLinks.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUrl(sample.url);
                      handleIngest(sample.url);
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-[#FAF9F6] dark:bg-[#1A1A18] hover:bg-[#EBEAE6] dark:hover:bg-[#252522] border border-[#E5E4DF] dark:border-[#262624] transition-colors flex items-center justify-between text-xs font-mono cursor-pointer"
                  >
                    <span className="font-semibold text-[#111110] dark:text-[#F4F3EF]">{sample.title}</span>
                    <span className="text-[#8F8D88] dark:text-[#7A7874] text-[10px] truncate max-w-xs ml-2">
                      {sample.url}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
