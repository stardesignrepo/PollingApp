import React from 'react';
import { ShieldCheck, Vote, Heart, Info } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Vote className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900">
                Milton Mayoral Public Opinion Poll
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              An independent, privacy-first community public opinion poll measuring civic perspectives in Milton, Ontario. Features cryptographic identity separation and multi-tier human verification.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
              <strong>Non-Affiliation Notice:</strong> This poll is entirely unofficial and is not affiliated with, sponsored by, or endorsed by the Town of Milton, Halton Regional Council, or Elections Ontario.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-indigo-600 transition-colors">
                  Overview & Charter
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('candidates')} className="hover:text-indigo-600 transition-colors">
                  Candidate Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('vote')} className="hover:text-indigo-600 transition-colors">
                  Cast Anonymous Ballot
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('results')} className="hover:text-indigo-600 transition-colors">
                  Live Verified Results
                </button>
              </li>
            </ul>
          </div>

          {/* Governance & Privacy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Research Protocols
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('methodology')} className="hover:text-indigo-600 transition-colors">
                  Polling Methodology
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('methodology')} className="hover:text-indigo-600 transition-colors">
                  The Privacy Shield
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('methodology')} className="hover:text-indigo-600 transition-colors">
                  Anti-Bot Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-indigo-600 transition-colors">
                  Admin Security Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Milton Mayoral Opinion Poll • Independent Civic Research</p>
          <p className="flex items-center gap-1">
            <span>Non-partisan community public research</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
