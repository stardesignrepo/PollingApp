import React from 'react';
import { 
  Vote, 
  BarChart3, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  MapPin,
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';
import { Candidate, Poll } from '../types/index.ts';

interface HomeViewProps {
  poll: Poll | null;
  candidates: Candidate[];
  onNavigate: (tab: string) => void;
  onSelectCandidateToVote: (candidateId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  poll,
  candidates,
  onNavigate,
  onSelectCandidateToVote,
}) => {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-xl border border-slate-800">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>2026 Milton Mayoral Public Opinion Poll</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight">
              An Independent Voice for Milton's Civic Future.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Participate in an open, privacy-protected community public-opinion poll. Explore candidate perspectives, cast your anonymous opinion, and monitor live verified trends across Halton.
            </p>

            {/* Non-Affiliation Disclaimer Badge in Hero */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-start gap-2.5 max-w-xl">
              <Info className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
              <span>
                <strong>Independent Public Opinion Research:</strong> Not affiliated with the Town of Milton or any election authority. Designed to measure community sentiment with multi-tier verification.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => onNavigate('vote')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
              >
                <Vote className="w-4 h-4" />
                <span>Cast Your Anonymous Opinion</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('results')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Live Verified Results</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              The Privacy Shield
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your candidate selection is completely decoupled from your personal identity. Ballots are stored anonymously without names or emails attached.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Multi-Tier Human Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every vote begins as an anonymous submission. Participants can optionally strengthen their vote credibility via Google or SMS verification to defeat automated bots.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Geographic & Ward Analytics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Filter results by Milton wards, Halton Region, or neighboring GTA communities. Approximate IP geolocation is used for abuse detection without retaining raw IP logs.
            </p>
          </div>
        </div>
      </section>

      {/* Candidate Presentation Preview (Equal Prominence) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <span>Neutral Candidate Roster</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Mayoral Candidates
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Presented with equal formatting and prominence in official registered ballot order.
            </p>
          </div>

          <button
            onClick={() => onNavigate('candidates')}
            className="self-start sm:self-auto text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View Full Candidate Profiles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <img
                  src={cand.photoUrl}
                  alt={cand.name}
                  className="w-full h-44 object-cover rounded-xl bg-slate-100 mb-4"
                  loading="lazy"
                />
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                  <span>Ballot #{cand.ballotOrder}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {cand.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                  {cand.neutralStatement}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectCandidateToVote(cand.id)}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors text-center"
                >
                  Vote for {cand.name.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verification Explanation Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              The Three-Tier Verification Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why We Segment Verified and Unverified Responses
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Online polls are often vulnerable to automated bots, VPN swarms, or repeat ballot stuffing. Our multi-tier architecture solves this transparently without requiring intrusive personal identity checks:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs font-bold text-slate-400 block mb-1">1. Unverified</span>
                <p className="text-xs text-slate-300">
                  Default anonymous response. Screened with invisible bot challenges and IP rate limiters.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <span className="text-xs font-bold text-indigo-300 block mb-1">2. Google Verified</span>
                <p className="text-xs text-slate-300">
                  Optional 1-click verification. Cryptographic hash prevents same Google account from multi-voting.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-xs font-bold text-emerald-300 block mb-1">3. Phone Verified</span>
                <p className="text-xs text-slate-300">
                  Optional SMS OTP code. Proves unique physical device ownership without saving contact records.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 pt-2">
              Note: Verification confirms unique human participation. It does not certify legal voter registration or citizenship under Ontario election laws.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
