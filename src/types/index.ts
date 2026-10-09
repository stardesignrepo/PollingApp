export type VerificationStatus = 'unverified' | 'google_verified' | 'phone_verified';

export type PollStatus = 'draft' | 'active' | 'closed';

export interface Candidate {
  id: string;
  pollId: string;
  name: string;
  ballotOrder: number;
  photoUrl: string;
  bio: string;
  platformPriorities: string[];
  neutralStatement: string;
  websiteUrl?: string;
  campaignStatus?: string;
  createdAt: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  status: PollStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  disclaimer: string;
}

export interface GeoLocationInfo {
  country: string;
  province: string;
  city: string;
  region: string;
  isApproximate: boolean;
  classification: 'milton' | 'halton' | 'gta_hamilton' | 'ontario' | 'canada' | 'international';
}

export interface BallotSubmission {
  pollId: string;
  candidateId: string;
  selfReportedLocation?: string;
  selectedIssues?: string[];
  botChallengeToken?: string;
  honeypot?: string;
}

export interface Ballot {
  id: string;
  pollId: string;
  candidateId: string;
  verificationStatus: VerificationStatus;
  selfReportedLocation?: string;
  selectedIssues: string[];
  geo: GeoLocationInfo;
  ipHash: string;
  createdAt: string;
}

export interface VerificationRecord {
  id: string;
  pollId: string;
  identityHash: string;
  verificationType: 'google' | 'phone';
  ballotId: string;
  verifiedAt: string;
}

export interface AuditSecurityEvent {
  id: string;
  pollId: string;
  eventType: 'rapid_submission' | 'ip_burst' | 'invalid_token' | 'duplicate_verification_attempt' | 'bot_flagged';
  severity: 'low' | 'medium' | 'high';
  ipHash: string;
  details: string;
  timestamp: string;
}

export interface PollAggregate {
  pollId: string;
  totalVotes: number;
  verifiedVotes: number;
  unverifiedVotes: number;
  googleVerifiedVotes: number;
  phoneVerifiedVotes: number;
  candidateCounts: Record<string, {
    total: number;
    verified: number;
    unverified: number;
    googleVerified: number;
    phoneVerified: number;
  }>;
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

export interface ResultsFilter {
  verification: 'verified_only' | 'all' | 'google_only' | 'phone_only' | 'unverified_only';
  location: 'all' | 'milton' | 'halton' | 'gta_hamilton' | 'ontario' | 'canada';
  selfReported?: string;
}
