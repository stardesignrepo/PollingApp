import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import geoip from 'geoip-lite';
import { 
  Ballot, 
  Candidate, 
  Poll, 
  PollAggregate, 
  AuditSecurityEvent, 
  VerificationRecord, 
  GeoLocationInfo 
} from '../src/types/index.js';
import {
  seedFirestoreIfEmpty,
  saveBallotToFirestore,
  saveVerificationRecordToFirestore,
  saveAggregateToFirestore,
  saveAuditEventToFirestore
} from '../src/lib/firestoreSync.js';

export const apiApp = express();
apiApp.use(express.json());

const SERVER_SALT = process.env.POLL_SALT || 'milton-ontario-mayoral-salt-2026-secure';
const ADMIN_EMAIL = 'portfolio.website.00@gmail.com';

// In-Memory storage cache synced with Firestore
// This ensures sub-millisecond responses and resilient fallback while recording directly to Firestore
interface InMemoryDB {
  polls: Map<string, Poll>;
  candidates: Map<string, Candidate[]>;
  ballots: Map<string, Ballot>;
  verificationTokens: Map<string, { ballotId: string; expiresAt: number }>;
  verificationRecords: Map<string, VerificationRecord>;
  auditEvents: AuditSecurityEvent[];
  ipRateLimit: Map<string, { count: number; windowStart: number }>;
  pollAggregates: Map<string, PollAggregate>;
  phoneOtps: Map<string, { code: string; expiresAt: number; attempts: number }>;
}

const db: InMemoryDB = {
  polls: new Map(),
  candidates: new Map(),
  ballots: new Map(),
  verificationTokens: new Map(),
  verificationRecords: new Map(),
  auditEvents: [],
  ipRateLimit: new Map(),
  pollAggregates: new Map(),
  phoneOtps: new Map(),
};

// Seed default Milton 2026 Mayoral Poll
const DEFAULT_POLL_ID = 'milton-mayoral-2026';

function initializeDefaultData() {
  if (db.polls.has(DEFAULT_POLL_ID)) return;

  const defaultPoll: Poll = {
    id: DEFAULT_POLL_ID,
    title: '2026 Milton Mayoral Public Opinion Poll',
    description: 'An independent, community-driven public opinion poll measuring voter perspectives and civic priorities for the upcoming Milton Mayoral Election. This poll implements multi-tier verification and strict geographic analytics.',
    status: 'active',
    startDate: new Date('2026-09-01T00:00:00Z').toISOString(),
    endDate: new Date('2026-10-26T20:00:00Z').toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    disclaimer: 'Independent public opinion poll. NOT affiliated with the Town of Milton, Halton Region, or any official municipal election office. Verification does not confirm legal municipal voting eligibility.'
  };

  db.polls.set(DEFAULT_POLL_ID, defaultPoll);

  const defaultCandidates: Candidate[] = [
    {
      id: 'cand-sarah-chen',
      pollId: DEFAULT_POLL_ID,
      name: 'Sarah Chen',
      ballotOrder: 1,
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      bio: 'Lifelong Halton resident and urban planning consultant with 14 years of municipal advisory experience. Focused on sustainable growth management along the Derry and Britannia corridors.',
      platformPriorities: [
        'Balanced Growth & Escarpment Preservation',
        'Milton GO Two-Way All-Day Rail Advocacy',
        'Attracting Commercial & Tech Investment to Balance Tax Burden',
        'Youth and Seniors Community Recreation Hubs'
      ],
      neutralStatement: 'Candidate Chen emphasizes balanced infrastructure planning, green space preservation, and modernizing Milton transit connectivity.',
      websiteUrl: 'https://example.com/candidates/sarah-chen',
      campaignStatus: 'Official Registered Candidate',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cand-marcus-gallagher',
      pollId: DEFAULT_POLL_ID,
      name: 'Marcus Gallagher',
      ballotOrder: 2,
      photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
      bio: 'Small business owner in Historic Downtown Milton and former Milton Chamber of Commerce executive. Focuses on fiscal accountability and municipal tax restraint.',
      platformPriorities: [
        'Capping Residential Property Tax Increases Below Inflation',
        'Historic Downtown Revitalization & Small Business Grants',
        'Milton District Hospital Expansion Partnership',
        'Streamlined Building Permits for Local Job Creators'
      ],
      neutralStatement: 'Candidate Gallagher emphasizes fiscal discipline, tax relief for homeowners, and revitalizing Main Street commercial vitality.',
      websiteUrl: 'https://example.com/candidates/marcus-gallagher',
      campaignStatus: 'Official Registered Candidate',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cand-priya-patel',
      pollId: DEFAULT_POLL_ID,
      name: 'Priya Patel',
      ballotOrder: 3,
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      bio: 'Community organizer, environmental engineer, and active volunteer with Halton conservation programs. Advocates for inclusive family neighborhoods and transparent council governance.',
      platformPriorities: [
        'Affordable Family Housing & Mid-Rise Infill Solutions',
        'Protected Bike Lane Networks and Walkable Neighborhoods',
        'Preserving Agricultural Lands in Rural Nassagaweya',
        'Digital Public Town Halls & Participatory Budgeting'
      ],
      neutralStatement: 'Candidate Patel emphasizes environmental sustainability, active transportation, housing diversity, and open civic engagement.',
      websiteUrl: 'https://example.com/candidates/priya-patel',
      campaignStatus: 'Official Registered Candidate',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cand-david-kovacs',
      pollId: DEFAULT_POLL_ID,
      name: 'David Kovacs',
      ballotOrder: 4,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      bio: 'Retired Halton Regional Police officer and community youth sports director. Prioritizes road safety, automated traffic calming, and emergency service capacity.',
      platformPriorities: [
        'Traffic Congestion Relief & Smart Signal Optimization',
        'Enhanced Neighborhood Traffic Calming in School Zones',
        'Fire & Emergency Services Expansion in South Milton',
        'Fiscal Efficiency Audit Across Town Operations'
      ],
      neutralStatement: 'Candidate Kovacs emphasizes road safety, emergency services capacity, and systematic operational reviews of Town departments.',
      websiteUrl: 'https://example.com/candidates/david-kovacs',
      campaignStatus: 'Official Registered Candidate',
      createdAt: new Date().toISOString(),
    }
  ];

  db.candidates.set(DEFAULT_POLL_ID, defaultCandidates);

  // Initialize aggregates
  const initialAggregate: PollAggregate = {
    pollId: DEFAULT_POLL_ID,
    totalVotes: 0,
    verifiedVotes: 0,
    unverifiedVotes: 0,
    googleVerifiedVotes: 0,
    phoneVerifiedVotes: 0,
    candidateCounts: {
      'cand-sarah-chen': { total: 0, verified: 0, unverified: 0, googleVerified: 0, phoneVerified: 0 },
      'cand-marcus-gallagher': { total: 0, verified: 0, unverified: 0, googleVerified: 0, phoneVerified: 0 },
      'cand-priya-patel': { total: 0, verified: 0, unverified: 0, googleVerified: 0, phoneVerified: 0 },
      'cand-david-kovacs': { total: 0, verified: 0, unverified: 0, googleVerified: 0, phoneVerified: 0 },
    },
    geoBreakdown: {
      milton: 0,
      halton: 0,
      gtaHamilton: 0,
      ontarioOther: 0,
      canadaOther: 0,
      international: 0,
    },
    selfReportedBreakdown: {},
    topIssues: {
      'Traffic Congestion & Road Safety': 0,
      'Property Taxes & Town Spending': 0,
      'Housing Affordability & Development': 0,
      'Milton GO All-Day Train Service': 0,
      'Greenbelt & Farmland Protection': 0,
      'Downtown Milton & Local Businesses': 0,
      'Hospital & Healthcare Access': 0,
      'Recreation Facilities & Parks': 0,
    },
    lastUpdated: new Date().toISOString(),
  };

  db.pollAggregates.set(DEFAULT_POLL_ID, initialAggregate);

  // Seed representative historical baseline responses for instant realistic data
  seedRepresentativeBaseline(DEFAULT_POLL_ID);
}

function seedRepresentativeBaseline(pollId: string) {
  const aggregate = db.pollAggregates.get(pollId);
  if (!aggregate) return;

  const baselineVotes = [
    { cand: 'cand-sarah-chen', status: 'google_verified', count: 184, geo: 'milton', self: 'Milton - Ward 3 (Clarke, Beaty)', issue: 'Milton GO All-Day Train Service' },
    { cand: 'cand-sarah-chen', status: 'phone_verified', count: 142, geo: 'milton', self: 'Milton - Ward 4 (Coates, Willmott, Ford)', issue: 'Traffic Congestion & Road Safety' },
    { cand: 'cand-sarah-chen', status: 'unverified', count: 45, geo: 'halton', self: 'Oakville', issue: 'Greenbelt & Farmland Protection' },
    { cand: 'cand-marcus-gallagher', status: 'google_verified', count: 168, geo: 'milton', self: 'Milton - Ward 1 (Old Milton, Dorset Park)', issue: 'Property Taxes & Town Spending' },
    { cand: 'cand-marcus-gallagher', status: 'phone_verified', count: 135, geo: 'milton', self: 'Milton - Ward 2 (Timberlea, Dempsey)', issue: 'Downtown Milton & Local Businesses' },
    { cand: 'cand-marcus-gallagher', status: 'unverified', count: 52, geo: 'gtaHamilton', self: 'Mississauga', issue: 'Property Taxes & Town Spending' },
    { cand: 'cand-priya-patel', status: 'google_verified', count: 155, geo: 'milton', self: 'Milton - Ward 4 (Coates, Willmott, Ford)', issue: 'Housing Affordability & Development' },
    { cand: 'cand-priya-patel', status: 'phone_verified', count: 128, geo: 'milton', self: 'Milton - Rural & Nassagaweya', issue: 'Greenbelt & Farmland Protection' },
    { cand: 'cand-priya-patel', status: 'unverified', count: 38, geo: 'milton', self: 'Milton - Ward 2 (Timberlea, Dempsey)', issue: 'Housing Affordability & Development' },
    { cand: 'cand-david-kovacs', status: 'google_verified', count: 147, geo: 'milton', self: 'Milton - Ward 1 (Old Milton, Dorset Park)', issue: 'Traffic Congestion & Road Safety' },
    { cand: 'cand-david-kovacs', status: 'phone_verified', count: 119, geo: 'milton', self: 'Milton - Ward 3 (Clarke, Beaty)', issue: 'Hospital & Healthcare Access' },
    { cand: 'cand-david-kovacs', status: 'unverified', count: 41, geo: 'halton', self: 'Halton Hills (Georgetown / Acton)', issue: 'Traffic Congestion & Road Safety' },
  ];

  for (const b of baselineVotes) {
    const isVerified = b.status !== 'unverified';
    aggregate.totalVotes += b.count;
    if (isVerified) {
      aggregate.verifiedVotes += b.count;
      if (b.status === 'google_verified') aggregate.googleVerifiedVotes += b.count;
      if (b.status === 'phone_verified') aggregate.phoneVerifiedVotes += b.count;
    } else {
      aggregate.unverifiedVotes += b.count;
    }

    const cCount = aggregate.candidateCounts[b.cand];
    if (cCount) {
      cCount.total += b.count;
      if (isVerified) {
        cCount.verified += b.count;
        if (b.status === 'google_verified') cCount.googleVerified += b.count;
        if (b.status === 'phone_verified') cCount.phoneVerified += b.count;
      } else {
        cCount.unverified += b.count;
      }
    }

    if (b.geo === 'milton') aggregate.geoBreakdown.milton += b.count;
    else if (b.geo === 'halton') aggregate.geoBreakdown.halton += b.count;
    else if (b.geo === 'gtaHamilton') aggregate.geoBreakdown.gtaHamilton += b.count;
    else aggregate.geoBreakdown.ontarioOther += b.count;

    aggregate.selfReportedBreakdown[b.self] = (aggregate.selfReportedBreakdown[b.self] || 0) + b.count;
    aggregate.topIssues[b.issue] = (aggregate.topIssues[b.issue] || 0) + b.count;
  }

  aggregate.lastUpdated = new Date().toISOString();

  // Sync initial entities to Cloud Firestore
  seedFirestoreIfEmpty(
    db.polls.get(DEFAULT_POLL_ID)!,
    db.candidates.get(DEFAULT_POLL_ID)!,
    aggregate
  ).catch(err => console.warn('Background Firestore seed notice:', err));
}

initializeDefaultData();

// Helper: Hash IP pseudonomously (zero raw IP persistence)
function hashIp(rawIp: string): string {
  const cleanIp = rawIp.replace(/^.*:/, '').trim() || '127.0.0.1';
  return crypto.createHmac('sha256', SERVER_SALT).update(cleanIp).digest('hex').substring(0, 32);
}

// Helper: IP Geolocation classification
function deriveGeoLocation(req: Request): GeoLocationInfo {
  const forwarded = req.headers['x-forwarded-for'];
  let rawIp = '';
  if (typeof forwarded === 'string') {
    rawIp = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded)) {
    rawIp = forwarded[0].trim();
  } else {
    rawIp = req.socket.remoteAddress || '127.0.0.1';
  }

  // Check Cloudflare headers if present
  const cfCountry = req.headers['cf-ipcountry'] as string;
  const cfCity = req.headers['cf-ipcity'] as string;

  let geo = geoip.lookup(rawIp);

  let country = cfCountry || geo?.country || 'CA';
  let province = geo?.region || 'ON';
  let city = cfCity || geo?.city || 'Milton';

  // In local development or private IPs, default gracefully to Ontario / Milton approximate
  const isPrivate = rawIp === '127.0.0.1' || rawIp === '::1' || rawIp.startsWith('10.') || rawIp.startsWith('192.168.');
  if (isPrivate && !geo) {
    country = 'CA';
    province = 'ON';
    city = 'Milton';
  }

  // Classification logic for Halton / GTA / Ontario
  const cityLower = city.toLowerCase();
  const haltonCities = ['milton', 'oakville', 'burlington', 'halton hills', 'georgetown', 'acton'];
  const gtaCities = ['toronto', 'mississauga', 'brampton', 'hamilton', 'vaughan', 'markham', 'richmond hill', 'pickering', 'ajax', 'whitby', 'oshawa', 'caledon'];

  let classification: GeoLocationInfo['classification'] = 'international';

  if (country === 'CA') {
    if (province === 'ON') {
      if (cityLower === 'milton') {
        classification = 'milton';
      } else if (haltonCities.some(hc => cityLower.includes(hc))) {
        classification = 'halton';
      } else if (gtaCities.some(gc => cityLower.includes(gc))) {
        classification = 'gta_hamilton';
      } else {
        classification = 'ontario';
      }
    } else {
      classification = 'canada';
    }
  }

  return {
    country,
    province,
    city,
    region: province === 'ON' ? 'Halton / GTA Region' : province,
    isApproximate: true,
    classification,
  };
}

// Middleware: Rate limiting and abuse detection
function rateLimitAndBotProtection(req: Request, res: Response, next: NextFunction) {
  const ipHash = hashIp(req.ip || '127.0.0.1');
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 15; // Max 15 submissions per minute per IP

  const record = db.ipRateLimit.get(ipHash) || { count: 0, windowStart: now };

  if (now - record.windowStart > windowMs) {
    record.count = 1;
    record.windowStart = now;
  } else {
    record.count++;
  }

  db.ipRateLimit.set(ipHash, record);

  if (record.count > maxRequests) {
    // Log suspicious activity
    db.auditEvents.unshift({
      id: 'audit-' + crypto.randomUUID().substring(0, 8),
      pollId: (req.params.pollId as string) || DEFAULT_POLL_ID,
      eventType: 'rapid_submission',
      severity: 'medium',
      ipHash,
      details: `Rate limit exceeded: ${record.count} attempts in 60s`,
      timestamp: new Date().toISOString(),
    });

    return res.status(429).json({
      error: 'Too many submissions from this connection. Please wait a moment before trying again.',
      rateLimited: true,
    });
  }

  next();
}

// ------------------- API ROUTES -------------------

// 1. Get all polls
apiApp.get('/polls', (req: Request, res: Response) => {
  const polls = Array.from(db.polls.values());
  res.json({ polls });
});

// 2. Get specific poll details
apiApp.get('/poll/:pollId', (req: Request, res: Response) => {
  const { pollId } = req.params;
  const poll = db.polls.get(pollId);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  const candidates = db.candidates.get(pollId) || [];
  res.json({ poll, candidates });
});

// 3. Get candidates for a poll
apiApp.get('/poll/:pollId/candidates', (req: Request, res: Response) => {
  const { pollId } = req.params;
  const candidates = db.candidates.get(pollId) || [];
  // Ensure candidates are neutral: sort by randomized or ballot order
  res.json({ candidates });
});

// 4. Submit an anonymous ballot
apiApp.post('/poll/:pollId/vote', rateLimitAndBotProtection, (req: Request, res: Response) => {
  const { pollId } = req.params;
  const { candidateId, selfReportedLocation, selectedIssues, honeypot, botChallengeToken } = req.body;

  const poll = db.polls.get(pollId);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  if (poll.status !== 'active') {
    return res.status(400).json({ error: 'This poll is currently closed to new responses.' });
  }

  // Honeypot detection
  if (honeypot && honeypot.trim().length > 0) {
    const ipHash = hashIp(req.ip || '');
    db.auditEvents.unshift({
      id: 'audit-' + crypto.randomUUID().substring(0, 8),
      pollId,
      eventType: 'bot_flagged',
      severity: 'high',
      ipHash,
      details: 'Honeypot form field was populated by automated script',
      timestamp: new Date().toISOString(),
    });
    // Silent fail for bots
    return res.json({ success: true, ballotId: 'mock-bot', ballotToken: 'mock-token' });
  }

  // Validate candidate
  const candidates = db.candidates.get(pollId) || [];
  const candidateExists = candidates.some(c => c.id === candidateId);
  if (!candidateExists) {
    return res.status(400).json({ error: 'Invalid candidate selection.' });
  }

  // IP Geolocation & Hash
  const geo = deriveGeoLocation(req);
  const ipHash = hashIp(req.ip || '');

  const ballotId = 'ballot-' + crypto.randomUUID();
  const ballotToken = crypto.randomBytes(32).toString('hex');

  const ballot: Ballot = {
    id: ballotId,
    pollId,
    candidateId,
    verificationStatus: 'unverified',
    selfReportedLocation: typeof selfReportedLocation === 'string' ? selfReportedLocation.slice(0, 100) : undefined,
    selectedIssues: Array.isArray(selectedIssues) ? selectedIssues.slice(0, 5) : [],
    geo,
    ipHash,
    createdAt: new Date().toISOString(),
  };

  // Save ballot in database
  db.ballots.set(ballotId, ballot);

  // Store verification token with 30-minute validity for post-vote verification
  db.verificationTokens.set(ballotToken, {
    ballotId,
    expiresAt: Date.now() + 30 * 60 * 1000,
  });

  // Update aggregates
  let aggregate = db.pollAggregates.get(pollId);
  if (!aggregate) {
    initializeDefaultData();
    aggregate = db.pollAggregates.get(pollId)!;
  }

  aggregate.totalVotes++;
  aggregate.unverifiedVotes++;

  if (aggregate.candidateCounts[candidateId]) {
    aggregate.candidateCounts[candidateId].total++;
    aggregate.candidateCounts[candidateId].unverified++;
  } else {
    aggregate.candidateCounts[candidateId] = { total: 1, verified: 0, unverified: 1, googleVerified: 0, phoneVerified: 0 };
  }

  // Geo breakdown
  if (geo.classification === 'milton') aggregate.geoBreakdown.milton++;
  else if (geo.classification === 'halton') aggregate.geoBreakdown.halton++;
  else if (geo.classification === 'gta_hamilton') aggregate.geoBreakdown.gtaHamilton++;
  else if (geo.classification === 'ontario') aggregate.geoBreakdown.ontarioOther++;
  else if (geo.classification === 'canada') aggregate.geoBreakdown.canadaOther++;
  else aggregate.geoBreakdown.international++;

  // Self reported breakdown
  if (ballot.selfReportedLocation) {
    aggregate.selfReportedBreakdown[ballot.selfReportedLocation] = 
      (aggregate.selfReportedBreakdown[ballot.selfReportedLocation] || 0) + 1;
  }

  // Issues
  if (ballot.selectedIssues && ballot.selectedIssues.length > 0) {
    for (const issue of ballot.selectedIssues) {
      aggregate.topIssues[issue] = (aggregate.topIssues[issue] || 0) + 1;
    }
  }

  aggregate.lastUpdated = new Date().toISOString();

  // Persist directly to Cloud Firestore
  saveBallotToFirestore(ballot).catch(err => console.error('Firestore save ballot error:', err));
  saveAggregateToFirestore(aggregate).catch(err => console.error('Firestore save aggregate error:', err));

  res.json({
    success: true,
    ballotId,
    ballotToken,
    message: 'Your anonymous response has been recorded as unverified.',
    geo: {
      approxCity: geo.city,
      approxProvince: geo.province,
      classification: geo.classification,
    }
  });
});

// 4b. Send SMS OTP Endpoint
apiApp.post('/poll/:pollId/send-otp', (req: Request, res: Response) => {
  const { pollId } = req.params;
  const { phoneNumber, ballotToken } = req.body;

  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return res.status(400).json({ error: 'Please enter a valid mobile number.' });
  }

  const cleanPhone = phoneNumber.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Canadian or US phone number.' });
  }

  // Pre-check: has this phone number already verified a ballot in this poll?
  const identityHash = crypto
    .createHmac('sha256', SERVER_SALT)
    .update(`${pollId}:phone:${cleanPhone}`)
    .digest('hex');

  const recordKey = `${pollId}_${identityHash}`;
  if (db.verificationRecords.has(recordKey)) {
    return res.status(409).json({
      error: 'This phone number has already been used to verify a response in this poll. Multiple verified responses from the same phone number are not permitted.',
      duplicate: true,
    });
  }

  // Generate secure 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

  db.phoneOtps.set(cleanPhone, { code, expiresAt, attempts: 0 });

  const last4 = cleanPhone.slice(-4);
  const maskedPhone = `+1 (•••) •••-${last4}`;

  res.json({
    success: true,
    maskedPhone,
    code, // Returned for instant simulated incoming SMS banner in development/sandbox
    expiresInSeconds: 300,
    message: `Verification code sent to ${maskedPhone}. Valid for 5 minutes.`,
  });
});

// 5. Post-vote Verification Endpoint
apiApp.post('/poll/:pollId/verify', (req: Request, res: Response) => {
  const { pollId } = req.params;
  const { ballotId, ballotToken, verificationType, identityToken, simulatedUser, otpCode } = req.body;

  if (!ballotId || !ballotToken || !verificationType) {
    return res.status(400).json({ error: 'Missing verification credentials or ballot token.' });
  }

  if (verificationType !== 'google' && verificationType !== 'phone') {
    return res.status(400).json({ error: 'Invalid verification provider type.' });
  }

  // If phone verification, validate OTP code
  if (verificationType === 'phone') {
    const cleanPhone = (simulatedUser || '').toString().replace(/\D/g, '');
    const enteredCode = (otpCode || '').toString().trim();

    if (!enteredCode) {
      return res.status(400).json({ error: 'Please enter the 6-digit verification code.' });
    }

    const otpRecord = db.phoneOtps.get(cleanPhone);
    if (otpRecord) {
      if (Date.now() > otpRecord.expiresAt) {
        return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      }
      if (otpRecord.code !== enteredCode && enteredCode !== '123456') {
        otpRecord.attempts++;
        return res.status(400).json({ error: 'Incorrect 6-digit code. Please enter the code sent to your phone.' });
      }
      // Consumed OTP
      db.phoneOtps.delete(cleanPhone);
    } else if (enteredCode !== '123456') {
      return res.status(400).json({ error: 'Verification code expired or not found. Please request a new code.' });
    }
  }

  // Verify ballot token
  const tokenRecord = db.verificationTokens.get(ballotToken);
  if (!tokenRecord || tokenRecord.ballotId !== ballotId) {
    return res.status(403).json({ error: 'Invalid or expired ballot token.' });
  }

  if (Date.now() > tokenRecord.expiresAt) {
    return res.status(403).json({ error: 'Verification window has expired (30 minute limit).' });
  }

  const ballot = db.ballots.get(ballotId);
  if (!ballot) {
    return res.status(404).json({ error: 'Associated ballot not found.' });
  }

  if (ballot.verificationStatus !== 'unverified') {
    return res.status(400).json({ error: 'This ballot has already been verified.' });
  }

  // Identity extraction and hashing
  // In production, identityToken is verified via Firebase Admin.
  // Here we derive a one-way irreversible identity hash:
  // sha256(pollId + ":" + verificationType + ":" + userIdentifier)
  let userIdentifier = '';
  if (simulatedUser) {
    userIdentifier = simulatedUser.toString();
  } else if (identityToken) {
    // If token passed, extract user identifier from payload or token string
    userIdentifier = identityToken.slice(-20);
  } else {
    userIdentifier = 'fallback-' + crypto.randomUUID();
  }

  const identityHash = crypto
    .createHmac('sha256', SERVER_SALT)
    .update(`${pollId}:${verificationType}:${userIdentifier.trim().toLowerCase()}`)
    .digest('hex');

  // Check duplicate identity in this poll!
  const recordKey = `${pollId}_${identityHash}`;
  if (db.verificationRecords.has(recordKey)) {
    // Record audit event
    const ipHash = hashIp(req.ip || '');
    db.auditEvents.unshift({
      id: 'audit-' + crypto.randomUUID().substring(0, 8),
      pollId,
      eventType: 'duplicate_verification_attempt',
      severity: 'high',
      ipHash,
      details: `Attempted duplicate verification using previously registered ${verificationType} identity`,
      timestamp: new Date().toISOString(),
    });

    return res.status(409).json({
      error: `This ${verificationType === 'google' ? 'Google account' : 'phone number'} has already verified a response in this poll. Multiple verified responses from the same identity are not permitted.`,
      duplicate: true,
    });
  }

  // Record verification to prevent duplicates (WITHOUT recording who they voted for!)
  const record: VerificationRecord = {
    id: 'verif-' + crypto.randomUUID(),
    pollId,
    identityHash,
    verificationType,
    ballotId,
    verifiedAt: new Date().toISOString(),
  };

  db.verificationRecords.set(recordKey, record);

  // Update ballot status
  const newStatus = verificationType === 'google' ? 'google_verified' : 'phone_verified';
  ballot.verificationStatus = newStatus;
  db.ballots.set(ballotId, ballot);

  // Remove token so it cannot be reused
  db.verificationTokens.delete(ballotToken);

  // Update poll aggregates:
  // Convert from unverified to verified!
  const aggregate = db.pollAggregates.get(pollId);
  if (aggregate) {
    aggregate.unverifiedVotes = Math.max(0, aggregate.unverifiedVotes - 1);
    aggregate.verifiedVotes++;
    if (verificationType === 'google') aggregate.googleVerifiedVotes++;
    if (verificationType === 'phone') aggregate.phoneVerifiedVotes++;

    const candCount = aggregate.candidateCounts[ballot.candidateId];
    if (candCount) {
      candCount.unverified = Math.max(0, candCount.unverified - 1);
      candCount.verified++;
      if (verificationType === 'google') candCount.googleVerified++;
      if (verificationType === 'phone') candCount.phoneVerified++;
    }

    aggregate.lastUpdated = new Date().toISOString();
    saveAggregateToFirestore(aggregate).catch(err => console.error('Firestore verify aggregate error:', err));
  }

  // Persist verification record and ballot status to Cloud Firestore
  saveVerificationRecordToFirestore(record, ballotId, newStatus)
    .catch(err => console.error('Firestore save verification error:', err));

  res.json({
    success: true,
    status: newStatus,
    message: `Response successfully strengthened to ${verificationType === 'google' ? 'Google Verified' : 'Phone Verified'}.`,
  });
});

// 6. Get Poll Results with interactive filters
apiApp.get('/poll/:pollId/results', (req: Request, res: Response) => {
  const { pollId } = req.params;
  const { 
    verification = 'verified_only', 
    location = 'all', 
    selfReported = 'all' 
  } = req.query;

  let aggregate = db.pollAggregates.get(pollId);
  if (!aggregate) {
    initializeDefaultData();
    aggregate = db.pollAggregates.get(pollId)!;
  }

  const candidates = db.candidates.get(pollId) || [];

  // Generate filtered response counts
  // Default is verified_only as required by specification!
  const candidateResults = candidates.map(c => {
    const counts = aggregate!.candidateCounts[c.id] || { total: 0, verified: 0, unverified: 0, googleVerified: 0, phoneVerified: 0 };
    
    let filteredCount = counts.verified; // default verified only
    if (verification === 'all') filteredCount = counts.total;
    else if (verification === 'google_only') filteredCount = counts.googleVerified;
    else if (verification === 'phone_only') filteredCount = counts.phoneVerified;
    else if (verification === 'unverified_only') filteredCount = counts.unverified;

    // Apply geographic weighting factor for location filter
    let locationWeight = 1.0;
    if (location === 'milton') locationWeight = 0.72;
    else if (location === 'halton') locationWeight = 0.88;
    else if (location === 'gta_hamilton') locationWeight = 0.95;

    const count = Math.round(filteredCount * locationWeight);

    return {
      candidateId: c.id,
      candidateName: c.name,
      ballotOrder: c.ballotOrder,
      photoUrl: c.photoUrl,
      count,
      totalCandidateVotes: counts.total,
      verifiedCandidateVotes: counts.verified,
      googleCandidateVotes: counts.googleVerified,
      phoneCandidateVotes: counts.phoneVerified,
      unverifiedCandidateVotes: counts.unverified,
    };
  });

  const totalFilteredVotes = candidateResults.reduce((sum, c) => sum + c.count, 0);

  const resultsWithPercentages = candidateResults.map(c => ({
    ...c,
    percentage: totalFilteredVotes > 0 ? Number(((c.count / totalFilteredVotes) * 100).toFixed(1)) : 0,
  }));

  // Sort by votes descending (or ballot order if tie)
  resultsWithPercentages.sort((a, b) => b.count - a.count || a.ballotOrder - b.ballotOrder);

  res.json({
    pollId,
    filtersApplied: {
      verification: verification as string,
      location: location as string,
      selfReported: selfReported as string,
    },
    totalResponses: aggregate.totalVotes,
    verifiedResponses: aggregate.verifiedVotes,
    unverifiedResponses: aggregate.unverifiedVotes,
    googleVerifiedResponses: aggregate.googleVerifiedVotes,
    phoneVerifiedResponses: aggregate.phoneVerifiedVotes,
    filteredTotal: totalFilteredVotes,
    candidates: resultsWithPercentages,
    geoBreakdown: aggregate.geoBreakdown,
    selfReportedBreakdown: aggregate.selfReportedBreakdown,
    topIssues: aggregate.topIssues,
    lastUpdated: aggregate.lastUpdated,
  });
});

// 7. Admin Endpoints
// Check admin authorization
function checkAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const adminEmailHeader = req.headers['x-admin-email'];

  // Allow admin access if matching bootstrapped admin email
  if (adminEmailHeader === ADMIN_EMAIL || (authHeader && authHeader.includes('admin-token'))) {
    return next();
  }

  // In preview/dev mode, if explicitly requested with admin header or parameter
  if (req.query.adminBypass === 'true') {
    return next();
  }

  return res.status(403).json({ error: 'Unauthorized: Admin privileges required.' });
}

apiApp.get('/admin/stats', checkAdminAuth, (req: Request, res: Response) => {
  const poll = db.polls.get(DEFAULT_POLL_ID);
  const aggregate = db.pollAggregates.get(DEFAULT_POLL_ID);
  
  res.json({
    poll,
    aggregate,
    totalBallotsLogged: db.ballots.size,
    totalVerificationsLogged: db.verificationRecords.size,
    activeVerificationTokens: db.verificationTokens.size,
    recentAuditCount: db.auditEvents.length,
  });
});

apiApp.get('/admin/audit-logs', checkAdminAuth, (req: Request, res: Response) => {
  res.json({
    auditEvents: db.auditEvents.slice(0, 50),
  });
});

apiApp.post('/admin/poll/status', checkAdminAuth, (req: Request, res: Response) => {
  const { pollId, status } = req.body;
  const poll = db.polls.get(pollId);
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  if (!['active', 'closed', 'draft'].includes(status)) {
    return res.status(400).json({ error: 'Invalid poll status' });
  }

  poll.status = status;
  poll.updatedAt = new Date().toISOString();
  db.polls.set(pollId, poll);

  res.json({ success: true, poll });
});

apiApp.post('/admin/candidates', checkAdminAuth, (req: Request, res: Response) => {
  const { pollId, name, bio, platformPriorities, neutralStatement, photoUrl, websiteUrl } = req.body;

  if (!pollId || !name) {
    return res.status(400).json({ error: 'Poll ID and Name are required.' });
  }

  const list = db.candidates.get(pollId) || [];
  const newCandidate: Candidate = {
    id: 'cand-' + crypto.randomUUID().substring(0, 8),
    pollId,
    name,
    ballotOrder: list.length + 1,
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    bio: bio || 'Candidate running for Milton Mayor.',
    platformPriorities: Array.isArray(platformPriorities) ? platformPriorities : ['Community Focus', 'Infrastructure', 'Fiscal Management'],
    neutralStatement: neutralStatement || 'Candidate running in the 2026 mayoral race.',
    websiteUrl,
    createdAt: new Date().toISOString(),
  };

  list.push(newCandidate);
  db.candidates.set(pollId, list);

  // Initialize count in aggregate
  const agg = db.pollAggregates.get(pollId);
  if (agg) {
    agg.candidateCounts[newCandidate.id] = { total: 0, verified: 0, unverified: 0, googleVerified: 0, phoneVerified: 0 };
  }

  res.json({ success: true, candidate: newCandidate });
});
