import React, { useState } from 'react';
import { Candidate, Poll, Ballot } from '../types/index.ts';
import { saveBallotToFirestore } from '../lib/firestoreSync.ts';
import { 
  Vote, 
  MapPin, 
  Check, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  Tag,
  ArrowRight
} from 'lucide-react';
import { VerificationModal } from './VerificationModal.tsx';

interface VotingViewProps {
  poll: Poll | null;
  candidates: Candidate[];
  preselectedCandidateId?: string | null;
  onVoteCastSuccess: () => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  poll,
  candidates,
  preselectedCandidateId,
  onVoteCastSuccess,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string>(preselectedCandidateId || '');
  const [selfReportedLocation, setSelfReportedLocation] = useState<string>('');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [honeypot, setHoneypot] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verification Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [createdBallotId, setCreatedBallotId] = useState<string | null>(null);
  const [createdBallotToken, setCreatedBallotToken] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [currentVerificationStatus, setCurrentVerificationStatus] = useState<'unverified' | 'google_verified' | 'phone_verified'>('unverified');

  const locationOptions = [
    { label: 'Milton - Ward 1 (Old Milton, Dorset Park, Mountain View)', value: 'Milton - Ward 1 (Old Milton, Dorset Park)' },
    { label: 'Milton - Ward 2 (Timberlea, Dempsey, Scott)', value: 'Milton - Ward 2 (Timberlea, Dempsey)' },
    { label: 'Milton - Ward 3 (Clarke, Beaty)', value: 'Milton - Ward 3 (Clarke, Beaty)' },
    { label: 'Milton - Ward 4 (Coates, Willmott, Cobban, Ford, Walker)', value: 'Milton - Ward 4 (Coates, Willmott, Ford)' },
    { label: 'Milton - Rural & Nassagaweya (Campbellville, Brookville, Moffat)', value: 'Milton - Rural & Nassagaweya' },
    { label: 'Milton - General / Unspecified Ward', value: 'Milton - General' },
    { label: 'Halton Region - Oakville', value: 'Oakville' },
    { label: 'Halton Region - Burlington', value: 'Burlington' },
    { label: 'Halton Region - Halton Hills (Georgetown / Acton)', value: 'Halton Hills (Georgetown / Acton)' },
    { label: 'GTA / Hamilton - Mississauga', value: 'Mississauga' },
    { label: 'GTA / Hamilton - Brampton', value: 'Brampton' },
    { label: 'GTA / Hamilton - Hamilton', value: 'Hamilton' },
    { label: 'GTA / Hamilton - Toronto', value: 'Toronto' },
    { label: 'Other Ontario Community', value: 'Other Ontario' },
    { label: 'Outside Ontario / International', value: 'Outside Ontario' },
  ];

  const civicIssues = [
    'Traffic Congestion & Road Safety',
    'Property Taxes & Town Spending',
    'Housing Affordability & Development',
    'Milton GO All-Day Train Service',
    'Greenbelt & Farmland Protection',
    'Downtown Milton & Local Businesses',
    'Hospital & Healthcare Access',
    'Recreation Facilities & Parks',
  ];

  const toggleIssue = (issue: string) => {
    if (selectedIssues.includes(issue)) {
      setSelectedIssues(selectedIssues.filter(i => i !== issue));
    } else {
      if (selectedIssues.length < 3) {
        setSelectedIssues([...selectedIssues, issue]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll) return;

    if (!selectedCandidate) {
      setError('Please select one candidate to cast your response.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Invisible bot verification challenge
      const botChallengeToken = 'bot-entropy-' + btoa(`${Date.now()}:${navigator.userAgent.slice(0, 20)}`);

      const res = await fetch(`/api/poll/${poll.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId: poll.id,
          candidateId: selectedCandidate,
          selfReportedLocation: selfReportedLocation || undefined,
          selectedIssues,
          honeypot,
          botChallengeToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit ballot');
      }

      setCreatedBallotId(data.ballotId);
      setCreatedBallotToken(data.ballotToken);
      setSubmissionSuccess(true);
      setCurrentVerificationStatus('unverified');

      // Persist directly to Cloud Firestore from frontend client
      const ballotRecord: Ballot = {
        id: data.ballotId,
        pollId: poll.id,
        candidateId: selectedCandidate,
        verificationStatus: 'unverified',
        selfReportedLocation: selfReportedLocation || undefined,
        selectedIssues,
        geo: data.geo || {
          country: 'CA',
          province: 'ON',
          city: 'Milton',
          region: 'Halton Region',
          isApproximate: true,
          classification: 'milton'
        },
        ipHash: 'client-sub-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      saveBallotToFirestore(ballotRecord).catch(err => console.warn('Client direct firestore sync:', err));

      setModalOpen(true);
      onVoteCastSuccess();
    } catch (err: any) {
      setError(err.message || 'Submission could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationDone = (status: 'google_verified' | 'phone_verified') => {
    setCurrentVerificationStatus(status);
    setModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Vote className="w-3.5 h-3.5" />
          <span>Official Ballot Form</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Cast Your Opinion in the Mayoral Poll
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Every participant selects one candidate and submits one anonymous response. Select your choice below, with optional geographic and civic priority indicators.
        </p>
      </div>

      {/* Disclaimers & Non-Eligibility notice */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 mb-8 space-y-1.5">
        <p className="font-semibold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Integrity & Privacy Protection</span>
        </p>
        <p className="text-slate-600">
          This is an independent public-opinion poll. It does not determine election outcomes. Raw IP addresses are never permanently stored. After submitting, you may optionally strengthen your response with Google or SMS verification to guard against automated bots.
        </p>
      </div>

      {submissionSuccess && createdBallotId ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Ballot Successfully Recorded!
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
              Your anonymous ballot selection has been secured. Your ballot reference is:
            </p>
            <div className="mt-3 inline-block px-4 py-2 rounded-xl bg-slate-100 font-mono text-sm font-semibold text-slate-800 border border-slate-200">
              {createdBallotId}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-500">Credibility Tier:</span>
              <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                currentVerificationStatus === 'unverified'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentVerificationStatus.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-500">
              {currentVerificationStatus === 'unverified'
                ? 'Your vote is currently counted in the Unverified public totals. Strengthen it to Verified status to ensure it appears in the primary verified analytics.'
                : 'Your vote is verified! It is now counted in the verified public results.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {currentVerificationStatus === 'unverified' && createdBallotToken && (
              <button
                onClick={() => setModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Strengthen Response with Verification</span>
              </button>
            )}

            <button
              onClick={() => {
                setSubmissionSuccess(false);
                setSelectedCandidate('');
                setSelectedIssues([]);
                setSelfReportedLocation('');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
            >
              Cast Another Response / Reset
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Honeypot field (hidden from real users, catches bots) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website_url_check">Do not fill this</label>
            <input
              type="text"
              id="website_url_check"
              name="website_url_check"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Candidate Selection */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <span>Select One Mayoral Candidate</span>
              </h2>
              <span className="text-xs text-rose-500 font-semibold">* Required</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Candidates are listed in official registered ballot order with equal formatting.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidates.map((candidate) => {
                const isSelected = selectedCandidate === candidate.id;
                return (
                  <label
                    key={candidate.id}
                    className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="candidate"
                      value={candidate.id}
                      checked={isSelected}
                      onChange={() => setSelectedCandidate(candidate.id)}
                      className="sr-only"
                    />
                    <img
                      src={candidate.photoUrl}
                      alt={candidate.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          #{candidate.ballotOrder}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {candidate.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {candidate.platformPriorities[0]}
                      </p>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 2: Optional Self-Reported Location */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span>Self-Reported Community / Ward</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">Optional</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-5">
              Help us understand opinions across Milton neighborhoods and neighboring GTA/Halton communities.
            </p>

            <div className="relative">
              <select
                value={selfReportedLocation}
                onChange={(e) => setSelfReportedLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-800"
              >
                <option value="">-- Choose your neighborhood / municipality (Optional) --</option>
                {locationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Optional Priority Civic Issues */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center">3</span>
                <span>Top Civic Issues of Concern</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">Pick up to 3 (Optional)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-5">
              Which issues matter most to you in Milton's municipal leadership?
            </p>

            <div className="flex flex-wrap gap-2.5">
              {civicIssues.map((issue) => {
                const isSelected = selectedIssues.includes(issue);
                return (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => toggleIssue(issue)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {issue}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submission Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !selectedCandidate}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Recording Anonymous Ballot...</span>
                </>
              ) : (
                <>
                  <Vote className="w-5 h-5" />
                  <span>Submit Anonymous Ballot</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              One ballot per participant. Bot protection and rate limits are enforced.
            </p>
          </div>
        </form>
      )}

      {/* Post-Vote Verification Modal */}
      {modalOpen && createdBallotId && createdBallotToken && (
        <VerificationModal
          isOpen={modalOpen}
          pollId={poll?.id || 'milton-mayoral-2026'}
          ballotId={createdBallotId}
          ballotToken={createdBallotToken}
          onClose={() => setModalOpen(false)}
          onVerificationComplete={handleVerificationDone}
        />
      )}
    </div>
  );
};
