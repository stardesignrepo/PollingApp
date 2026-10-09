import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { HomeView } from './components/HomeView.tsx';
import { CandidatesView } from './components/CandidatesView.tsx';
import { VotingView } from './components/VotingView.tsx';
import { ResultsView } from './components/ResultsView.tsx';
import { MethodologyView } from './components/MethodologyView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { Footer } from './components/Footer.tsx';
import { Candidate, Poll } from './types/index.ts';
import { auth, testConnection } from './lib/firebase.ts';
import { seedFirestoreIfEmpty } from './lib/firestoreSync.ts';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [poll, setPoll] = useState<Poll | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCandidateForVote, setSelectedCandidateForVote] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const ADMIN_EMAIL = 'portfolio.website.00@gmail.com';

  const fetchData = async () => {
    try {
      // 1. Fetch polls
      const pollsRes = await fetch('/api/polls');
      if (pollsRes.ok) {
        const pollsData = await pollsRes.json();
        const activePoll = pollsData.polls?.[0] || null;
        setPoll(activePoll);

        if (activePoll) {
          // 2. Fetch candidates for this poll
          const candRes = await fetch(`/api/poll/${activePoll.id}/candidates`);
          if (candRes.ok) {
            const candData = await candRes.json();
            const candList = candData.candidates || [];
            setCandidates(candList);

            // Fetch aggregate and ensure Firestore has baseline collections
            fetch(`/api/poll/${activePoll.id}/results`)
              .then(r => r.json())
              .then(aggData => {
                if (aggData?.aggregate) {
                  seedFirestoreIfEmpty(activePoll, candList, aggData.aggregate);
                }
              })
              .catch(err => console.warn('Sync aggregate notice:', err));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load poll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Validate connection to Firestore on initial boot per skill mandate
    testConnection();

    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    fetchData();

    return () => unsubscribe();
  }, []);

  const handleSelectCandidateToVote = (candidateId: string) => {
    setSelectedCandidateForVote(candidateId);
    setCurrentTab('vote');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading Milton Mayoral Poll...</p>
        <p className="text-xs text-slate-400 mt-1">Connecting to independent civic data network</p>
      </div>
    );
  }

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleNavigate}
        isAdmin={isAdmin}
        adminEmail={currentUser?.email || null}
        onOpenAdminAuth={() => handleNavigate('admin')}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            poll={poll}
            candidates={candidates}
            onNavigate={handleNavigate}
            onSelectCandidateToVote={handleSelectCandidateToVote}
          />
        )}

        {currentTab === 'candidates' && (
          <CandidatesView
            candidates={candidates}
            onSelectCandidateToVote={handleSelectCandidateToVote}
          />
        )}

        {currentTab === 'vote' && (
          <VotingView
            poll={poll}
            candidates={candidates}
            preselectedCandidateId={selectedCandidateForVote}
            onVoteCastSuccess={fetchData}
          />
        )}

        {currentTab === 'results' && (
          <ResultsView
            poll={poll}
            candidates={candidates}
          />
        )}

        {currentTab === 'methodology' && (
          <MethodologyView />
        )}

        {currentTab === 'admin' && (
          <AdminView
            currentPoll={poll}
            candidates={candidates}
            onRefreshData={fetchData}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
