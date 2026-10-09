import React, { useState } from 'react';
import { Candidate } from '../types/index.ts';
import { 
  ExternalLink, 
  Vote, 
  Shuffle, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  ShieldCheck,
  Building,
  Target
} from 'lucide-react';

interface CandidatesViewProps {
  candidates: Candidate[];
  onSelectCandidateToVote: (candidateId: string) => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  candidates,
  onSelectCandidateToVote,
}) => {
  const [isRandomized, setIsRandomized] = useState(false);
  const [randomSeed, setRandomSeed] = useState(0);

  // Present candidates neutrally: either standard official ballot order or randomized to remove positioning bias
  const displayCandidates = React.useMemo(() => {
    const list = [...candidates];
    if (isRandomized) {
      let seed = randomSeed;
      return list.sort(() => Math.sin(seed++) - 0.5);
    }
    return list.sort((a, b) => a.ballotOrder - b.ballotOrder);
  }, [candidates, isRandomized, randomSeed]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header and Neutrality Charter */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Neutral Candidate Directory</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              2026 Milton Mayoral Candidates
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl">
              Candidates are presented with strictly equal prominence and standardized formatting. Platform priorities and biographical information are drawn from candidate statements and public registrations.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => {
                setIsRandomized(!isRandomized);
                setRandomSeed(prev => prev + 1);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm transition-colors"
              title="Toggle randomized view to counter ballot position bias"
            >
              <Shuffle className="w-3.5 h-3.5 text-slate-500" />
              <span>{isRandomized ? 'Reset to Ballot Order' : 'Randomize Display Order'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 mb-8 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-amber-900">
          <p className="font-semibold">Neutral Information Notice:</p>
          <p className="text-amber-800 mt-0.5">
            This poll does not endorse any candidate or political organization. Candidate biographies are standardized placeholders or verified candidate submissions. If you are an authorized campaign representative wishing to update verified official links, please contact the independent research administrator.
          </p>
        </div>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {displayCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {/* Top Candidate Banner & Photo */}
            <div className="p-6 border-b border-slate-100 flex items-start gap-4">
              <img
                src={candidate.photoUrl}
                alt={candidate.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-100 border-2 border-slate-100 shadow-inner shrink-0"
                loading="lazy"
                onError={(e) => {
                  // Fallback avatar
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=4f46e5&color=fff&size=200`;
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Ballot Position #{candidate.ballotOrder}
                  </span>
                  {candidate.campaignStatus && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {candidate.campaignStatus}
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 truncate">
                  {candidate.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  Candidate for Mayor • Town of Milton
                </p>
              </div>
            </div>

            {/* Profile Body */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Candidate Summary
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {candidate.bio}
                </p>
              </div>

              {/* Platform Priorities */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  Stated Priorities
                </h3>
                <ul className="space-y-2">
                  {candidate.platformPriorities.map((priority, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{priority}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Neutral Statement Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                "{candidate.neutralStatement}"
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                {candidate.websiteUrl ? (
                  <a
                    href={candidate.websiteUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors py-2 px-1"
                  >
                    <span>Campaign Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Public profile</span>
                )}

                <button
                  onClick={() => onSelectCandidateToVote(candidate.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-sm transition-all"
                >
                  <Vote className="w-4 h-4" />
                  <span>Vote for {candidate.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
