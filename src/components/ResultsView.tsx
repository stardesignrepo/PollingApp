import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Users, 
  MapPin, 
  Filter, 
  RefreshCw, 
  Sparkles, 
  Info,
  CheckCircle2,
  TrendingUp,
  Smartphone,
  Globe2,
  PieChart
} from 'lucide-react';
import { Candidate, Poll } from '../types/index.ts';

interface ResultsViewProps {
  poll: Poll | null;
  candidates: Candidate[];
}

interface ResultsData {
  pollId: string;
  filtersApplied: {
    verification: string;
    location: string;
    selfReported: string;
  };
  totalResponses: number;
  verifiedResponses: number;
  unverifiedResponses: number;
  googleVerifiedResponses: number;
  phoneVerifiedResponses: number;
  filteredTotal: number;
  candidates: {
    candidateId: string;
    candidateName: string;
    ballotOrder: number;
    photoUrl: string;
    count: number;
    totalCandidateVotes: number;
    verifiedCandidateVotes: number;
    googleCandidateVotes: number;
    phoneCandidateVotes: number;
    unverifiedCandidateVotes: number;
    percentage: number;
  }[];
  geoBreakdown: {
    milton: number;
    halton: number;
    gtaHamilton: number;
    ontarioOther: number;
    canadaOther: number;
    international: number;
  };
  selfReportedBreakdown: Record<string, number>;
  topIssues: Record<string, number>;
  lastUpdated: string;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ poll, candidates }) => {
  // Default filter MUST emphasize verified responses as specified!
  const [verificationFilter, setVerificationFilter] = useState<'verified_only' | 'all' | 'google_only' | 'phone_only' | 'unverified_only'>('verified_only');
  const [locationFilter, setLocationFilter] = useState<'all' | 'milton' | 'halton' | 'gta_hamilton' | 'ontario' | 'canada'>('all');
  const [selfReportedFilter, setSelfReportedFilter] = useState<string>('all');

  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    if (!poll) return;
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        verification: verificationFilter,
        location: locationFilter,
        selfReported: selfReportedFilter,
      });

      const res = await fetch(`/api/poll/${poll.id}/results?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to load poll results');
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Could not fetch results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [poll?.id, verificationFilter, locationFilter, selfReportedFilter]);

  // Readable filter label description
  const getFilterDescription = () => {
    const verifLabel = {
      verified_only: 'Verified Responses (Primary Default)',
      all: 'All Responses (Verified + Unverified)',
      google_only: 'Google Verified Only',
      phone_only: 'Phone / SMS Verified Only',
      unverified_only: 'Unverified Responses Only',
    }[verificationFilter];

    const locLabel = {
      all: 'All Geographic Locations',
      milton: 'Milton (IP Geolocation)',
      halton: 'Halton Region (Milton, Oakville, Burlington, Halton Hills)',
      gta_hamilton: 'GTA & Hamilton Region',
      ontario: 'Ontario Province-Wide',
      canada: 'Canada-Wide',
    }[locationFilter];

    return { verifLabel, locLabel };
  };

  const { verifLabel, locLabel } = getFilterDescription();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title & Refresh */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Aggregated Opinion Gauge</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Milton Mayoral Poll Results
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600">
            Real-time public opinion analytics. Primary figures reflect verified participants with multi-tier geographic filtering.
          </p>
        </div>

        <button
          onClick={fetchResults}
          disabled={loading}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>TOTAL RESPONSES</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {results?.totalResponses.toLocaleString() ?? '...'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            All submitted ballots
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-extrabold uppercase">
            Primary Metric
          </div>
          <div className="flex items-center justify-between text-xs text-indigo-700 font-semibold mb-1">
            <span>VERIFIED RESPONSES</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-900">
            {results?.verifiedResponses.toLocaleString() ?? '...'}
          </div>
          <p className="text-[11px] text-indigo-600/80 mt-1 font-medium">
            {results?.totalResponses ? Math.round((results.verifiedResponses / results.totalResponses) * 100) : 0}% of all participants
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>GOOGLE VERIFIED</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {results?.googleVerifiedResponses.toLocaleString() ?? '...'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Authenticated Google identities
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>PHONE / SMS VERIFIED</span>
            <Smartphone className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {results?.phoneVerifiedResponses.toLocaleString() ?? '...'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            SMS OTP authenticated
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS BAR (Mandatory requirement) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Filter & Segment Results
            </h2>
          </div>
          <button
            onClick={() => {
              setVerificationFilter('verified_only');
              setLocationFilter('all');
              setSelfReportedFilter('all');
            }}
            className="text-xs text-indigo-600 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Filter 1: Verification Tier */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Verification Tier
            </label>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'verified_only', label: 'Verified Only (Default ⭐)' },
                { id: 'all', label: 'All Responses (Total)' },
                { id: 'google_only', label: 'Google Verified Only' },
                { id: 'phone_only', label: 'Phone / SMS Verified Only' },
                { id: 'unverified_only', label: 'Unverified Responses' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setVerificationFilter(tier.id as any)}
                  className={`text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                    verificationFilter === tier.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{tier.label}</span>
                  {verificationFilter === tier.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 2: IP-Derived Geographic Classification */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Geographic Region (IP)
            </label>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'all', label: 'All Locations' },
                { id: 'milton', label: 'Milton (IP Geolocation)' },
                { id: 'halton', label: 'Halton Region' },
                { id: 'gta_hamilton', label: 'GTA & Hamilton' },
                { id: 'ontario', label: 'Ontario' },
                { id: 'canada', label: 'Canada' },
              ].map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setLocationFilter(loc.id as any)}
                  className={`text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                    locationFilter === loc.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{loc.label}</span>
                  {locationFilter === loc.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 3: Self-Reported Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Self-Reported Community / Ward
            </label>
            <select
              value={selfReportedFilter}
              onChange={(e) => setSelfReportedFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Self-Reported Wards & Towns</option>
              <option value="Milton - Ward 1 (Old Milton, Dorset Park)">Milton - Ward 1 (Old Milton)</option>
              <option value="Milton - Ward 2 (Timberlea, Dempsey)">Milton - Ward 2 (Timberlea / Dempsey)</option>
              <option value="Milton - Ward 3 (Clarke, Beaty)">Milton - Ward 3 (Clarke / Beaty)</option>
              <option value="Milton - Ward 4 (Coates, Willmott, Ford)">Milton - Ward 4 (Coates / Willmott / Ford)</option>
              <option value="Milton - Rural & Nassagaweya">Milton - Rural & Nassagaweya</option>
              <option value="Oakville">Oakville</option>
              <option value="Burlington">Burlington</option>
              <option value="Halton Hills (Georgetown / Acton)">Halton Hills</option>
              <option value="Mississauga">Mississauga</option>
              <option value="Hamilton">Hamilton</option>
            </select>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <strong>Methodology Note:</strong> IP geolocation is approximate and used for abuse detection and sample segmentation. Self-reported location reflects participant self-identification.
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER STATUS BADGE (Mandatory requirement) */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Active Segment:</span>
            <span className="px-2 py-0.5 rounded-lg bg-white border border-indigo-200 text-indigo-700">
              {verifLabel}
            </span>
            <span className="text-indigo-400">•</span>
            <span className="px-2 py-0.5 rounded-lg bg-white border border-indigo-200 text-indigo-700">
              {locLabel}
            </span>
            {selfReportedFilter !== 'all' && (
              <>
                <span className="text-indigo-400">•</span>
                <span className="px-2 py-0.5 rounded-lg bg-white border border-indigo-200 text-indigo-700">
                  {selfReportedFilter}
                </span>
              </>
            )}
          </div>
          <div className="text-indigo-800 font-bold">
            Segment Sample: {results?.filteredTotal.toLocaleString() ?? '...'} responses
          </div>
        </div>
      </div>

      {/* Main Results Table & Progress Bars */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
          <span>Candidate Vote Share</span>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ranked by Filtered Count
          </span>
        </h2>

        <div className="space-y-6">
          {results?.candidates.map((cand, idx) => {
            return (
              <div key={cand.candidateId} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-extrabold text-slate-400 text-xs w-4">
                      #{idx + 1}
                    </span>
                    <img
                      src={cand.photoUrl}
                      alt={cand.candidateName}
                      className="w-8 h-8 rounded-full object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <span className="font-bold text-slate-900 truncate">
                      {cand.candidateName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                      {cand.count.toLocaleString()} votes
                    </span>
                    <span className="font-mono font-extrabold text-base sm:text-lg text-indigo-600">
                      {cand.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, cand.percentage))}%` }}
                  ></div>
                </div>

                {/* Small Sub-Breakdown */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>
                    Verified: <strong>{cand.verifiedCandidateVotes}</strong> ({cand.googleCandidateVotes} Google / {cand.phoneCandidateVotes} Phone)
                  </span>
                  <span>
                    Unverified: <strong>{cand.unverifiedCandidateVotes}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Visual Breakdown: Geographic + Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Geographic Distribution Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              IP-Derived Geographic Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Responses geolocated via network routing at time of submission.
          </p>

          <div className="space-y-3.5">
            {[
              { label: 'Milton (Town of Milton)', count: results?.geoBreakdown.milton || 0, color: 'bg-indigo-600' },
              { label: 'Halton Region (Oakville, Burlington, Halton Hills)', count: results?.geoBreakdown.halton || 0, color: 'bg-sky-500' },
              { label: 'GTA & Hamilton Area', count: results?.geoBreakdown.gtaHamilton || 0, color: 'bg-emerald-500' },
              { label: 'Other Ontario Communities', count: results?.geoBreakdown.ontarioOther || 0, color: 'bg-amber-500' },
              { label: 'Rest of Canada / Other', count: results?.geoBreakdown.canadaOther || 0, color: 'bg-slate-400' },
            ].map((item, idx) => {
              const total = results?.totalResponses || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-500 font-mono">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Civic Issues */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Top Voter Issues of Concern
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Civic priorities selected by participants when casting their ballots.
          </p>

          <div className="space-y-3">
            {results?.topIssues &&
              Object.entries(results.topIssues)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([issue, count], idx) => {
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-semibold text-slate-800">{issue}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold font-mono">
                        {count} mentions
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      {/* Methodological Caveat Box */}
      <div className="p-6 rounded-3xl bg-slate-100 border border-slate-200 flex items-start gap-4">
        <Info className="w-6 h-6 text-slate-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-slate-700 space-y-1">
          <h4 className="font-bold text-slate-900">Statistical Representation Statement:</h4>
          <p className="leading-relaxed text-slate-600">
            This is a self-selected public opinion poll conducted online and is not necessarily statistically representative of all eligible electors in the Town of Milton. Opt-in surveys are subject to non-response bias and cannot be assigned a conventional margin of error. Results are intended for civic discussion and community insight.
          </p>
        </div>
      </div>
    </div>
  );
};
