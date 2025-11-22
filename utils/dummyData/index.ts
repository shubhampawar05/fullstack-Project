// Central export for all dummy data
export * from './employees';
export * from './attendance';
export * from './leaves';
export * from './recruitment';
export * from './performance';

// Re-export commonly used data
export { dummyEmployees } from './employees';
export { dummyAttendance, getAttendanceStats } from './attendance';
export { dummyLeaves, leaveBalances } from './leaves';
export { dummyJobs, dummyCandidates } from './recruitment';
export { dummyReviews, dummyGoals } from './performance';
