import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  MapPin,
  Cpu
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-3">
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span>Transparency & Privacy Protocols</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Polling Methodology & Privacy Architecture
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          How this independent poll protects participant anonymity, prevents duplicate manipulation, and analyzes civic sentiment without partisan bias.
        </p>
      </div>

      {/* Prominent Legal Disclaimer Banner */}
      <div className="mb-10 p-6 rounded-3xl bg-amber-50 border border-amber-200/90 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
        <div className="space-y-1.5 text-xs sm:text-sm text-amber-900">
          <h2 className="font-extrabold text-amber-950 text-base">
            Unofficial Civic Research Notice
          </h2>
          <p className="leading-relaxed">
            This web application is an <strong>independent, unofficial public-opinion poll</strong> and is not affiliated with, authorized by, or endorsed by the <strong>Town of Milton</strong>, the <strong>Regional Municipality of Halton</strong>, Elections Ontario, or any official candidate campaign.
          </p>
          <p className="leading-relaxed text-amber-800">
            Participation does not constitute casting a legal ballot in any municipal election. The official Milton municipal election is administered exclusively by the Town of Milton Town Clerk under the <em>Municipal Elections Act, 1996</em>.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Section 1: Statistical Methodology */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Scientific & Polling Methodology
              </h2>
              <p className="text-xs text-slate-500">Opt-in digital public opinion sampling</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              This survey is a <strong>self-selected, non-probability public opinion poll</strong>. Unlike randomized telephone or probability-based panel surveys, participants choose whether to submit a ballot.
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Key Statistical Principles:
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-600">
                <li>
                  <strong>Margin of Error:</strong> In accordance with the standards of the Marketing Research and Intelligence Association (MRIA) and the American Association for Public Opinion Research (AAPOR), opt-in online surveys cannot report a formal statistical margin of error because the sample is non-random.
                </li>
                <li>
                  <strong>Self-Selection Effect:</strong> People with strong civic views or who are active in community groups are more likely to participate. Results provide a gauge of engaged community sentiment rather than a scientific forecast.
                </li>
                <li>
                  <strong>Equal Prominence:</strong> All officially registered mayoral candidates receive identical typographic prominence, randomized or alphabetical ordering options, and balanced platform summaries.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Privacy Shield (Separation of Identity & Ballot) */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                The Privacy Shield Architecture
              </h2>
              <p className="text-xs text-slate-500">Cryptographic decoupling of identity and choice</p>
            </div>
          </div>

          <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              A cornerstone of poll integrity is the <strong>strict cryptographic separation</strong> between who you are and who you voted for:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>The Ballot Store</span>
                </div>
                <p className="text-xs text-indigo-950/80 leading-relaxed">
                  Stores your candidate choice, selected civic issues, and approximate geographic region. <strong>It contains NO names, NO email addresses, and NO phone numbers.</strong>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>The Verification Registry</span>
                </div>
                <p className="text-xs text-emerald-950/80 leading-relaxed">
                  Stores an irreversible HMAC-SHA256 one-way hash of your verified identity (e.g. <code>hash(pollId + salt + googleUid)</code>). <strong>It NEVER records candidate choice.</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 mt-4">
              <EyeOff className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Zero Public Ballot Exposure:</p>
                <p>Individual cast ballots are strictly private and never exposed through client queries or public APIs. Only aggregated summary counts are published.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Geographic Analytics & IP Minimization */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Geographic Data & IP Minimization
              </h2>
              <p className="text-xs text-slate-500">Approximate regional breakdown without raw IP retention</p>
            </div>
          </div>

          <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              To analyze the geographic spread of participants between Milton, Halton Region, and neighboring GTA municipalities:
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <strong>No Raw IP Storage:</strong> Incoming IP addresses are processed in volatile memory on the backend to resolve approximate country, province, and city using regional routing databases. Raw IP addresses are discarded immediately.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Pseudonymous IP Hashing:</strong> A cryptographic HMAC hash of the IP with a private server salt is used strictly for rate limiting (preventing 100+ votes in a minute from a single router). Multiple legitimate family members sharing a home Wi-Fi are never blocked based solely on shared IP.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Self-Reported Community:</strong> Participants can optionally specify their Milton ward (e.g. Ward 1 Old Milton, Ward 2 Timberlea, Ward 3 Clarke/Beaty, Ward 4 Coates/Willmott, or Rural Milton/Nassagaweya).
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 4: Human Verification Mechanics */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Verification Tiers & Anti-Sybil Defense
              </h2>
              <p className="text-xs text-slate-500">Combating automated astroturfing and multi-voting</p>
            </div>
          </div>

          <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
            <p>
              To ensure credible results while remaining accessible to anyone, submissions are categorized into three explicit tiers:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold mb-2">
                  Tier 1: Unverified
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Anonymous vote protected by invisible bot checks, honeypot traps, and rate limiters. Included in secondary totals.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40">
                <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
                  Tier 2: Google Verified
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Participant authenticated with a unique Google account. Prevents same Google user from voting twice in the same poll.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                  Tier 3: Phone Verified
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Participant authenticated via SMS OTP code to a mobile number. One verified ballot per mobile number.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900">
              <strong>Crucial Clarification:</strong> Neither Google nor phone verification guarantees that a participant is a Canadian citizen, aged 18 or older, or a resident/landowner in the Town of Milton. Verification strictly proves unique human agency to prevent bot swarms.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
