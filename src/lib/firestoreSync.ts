import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase.ts';
import { 
  Ballot, 
  Candidate, 
  Poll, 
  PollAggregate, 
  AuditSecurityEvent, 
  VerificationRecord 
} from '../types/index.ts';

export async function seedFirestoreIfEmpty(
  poll: Poll,
  candidates: Candidate[],
  aggregate: PollAggregate
) {
  try {
    const pollRef = doc(db, 'polls', poll.id);
    const pollSnap = await getDoc(pollRef);

    if (!pollSnap.exists()) {
      console.log('Seeding initial poll into Firestore:', poll.id);
      await setDoc(pollRef, poll);
    }

    // Seed candidates
    for (const cand of candidates) {
      const candRef = doc(db, 'candidates', cand.id);
      const candSnap = await getDoc(candRef);
      if (!candSnap.exists()) {
        await setDoc(candRef, cand);
      }
    }

    // Seed aggregate
    const aggRef = doc(db, 'poll_aggregates', aggregate.pollId);
    const aggSnap = await getDoc(aggRef);
    if (!aggSnap.exists()) {
      await setDoc(aggRef, aggregate);
    }
  } catch (err) {
    console.warn('Firestore initial seeding note:', err);
  }
}

export async function saveBallotToFirestore(ballot: Ballot): Promise<boolean> {
  try {
    const ballotRef = doc(db, 'ballots', ballot.id);
    await setDoc(ballotRef, ballot);
    return true;
  } catch (err) {
    console.error('Failed to save ballot to Firestore:', err);
    return false;
  }
}

export async function saveVerificationRecordToFirestore(
  record: VerificationRecord,
  ballotId: string,
  newStatus: 'google_verified' | 'phone_verified'
): Promise<boolean> {
  try {
    // 1. Save verification record (prevents duplicates)
    const verifRef = doc(db, 'verification_records', record.id);
    await setDoc(verifRef, record);

    // 2. Update ballot document status in Firestore
    const ballotRef = doc(db, 'ballots', ballotId);
    await updateDoc(ballotRef, {
      verificationStatus: newStatus,
      verifiedAt: record.verifiedAt,
    });
    return true;
  } catch (err) {
    console.error('Failed to update verification in Firestore:', err);
    return false;
  }
}

export async function saveAggregateToFirestore(aggregate: PollAggregate): Promise<boolean> {
  try {
    const aggRef = doc(db, 'poll_aggregates', aggregate.pollId);
    await setDoc(aggRef, aggregate);
    return true;
  } catch (err) {
    console.error('Failed to update poll aggregate in Firestore:', err);
    return false;
  }
}

export async function saveAuditEventToFirestore(event: AuditSecurityEvent): Promise<boolean> {
  try {
    const auditRef = doc(db, 'audit_security_events', event.id);
    await setDoc(auditRef, event);
    return true;
  } catch (err) {
    console.error('Failed to save audit event to Firestore:', err);
    return false;
  }
}
