import { dummyEmployees } from './employees';

export interface DummyLeave {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveType: 'Casual' | 'Sick' | 'Earned' | 'Maternity' | 'Paternity' | 'Unpaid';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
    appliedOn: string;
    approvedBy?: string;
    approvedOn?: string;
    rejectionReason?: string;
}

export interface LeaveBalance {
    employeeId: string;
    casual: { total: number; used: number; remaining: number };
    sick: { total: number; used: number; remaining: number };
    earned: { total: number; used: number; remaining: number };
}

const leaveReasons = {
    Casual: [
        'Personal work',
        'Family function',
        'Home renovation',
        'Vehicle servicing',
        'Bank work',
        'Personal emergency',
    ],
    Sick: [
        'Fever and cold',
        'Medical checkup',
        'Dental appointment',
        'Recovery from illness',
        'Doctor consultation',
        'Health issues',
    ],
    Earned: [
        'Vacation with family',
        'Wedding to attend',
        'Long weekend trip',
        'Festival celebration',
        'Planned vacation',
        'Personal travel',
    ],
    Maternity: ['Maternity leave'],
    Paternity: ['Paternity leave'],
    Unpaid: ['Extended personal leave', 'Family emergency'],
};

function getRandomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function generateDummyLeaves(count: number = 50): DummyLeave[] {
    const leaves: DummyLeave[] = [];
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, 1);

    for (let i = 0; i < count; i++) {
        const employee = getRandomItem(dummyEmployees.filter(e => e.status === 'Active'));
        const leaveType = getRandomItem(['Casual', 'Sick', 'Earned', 'Unpaid'] as DummyLeave['leaveType'][]);

        const startDate = getRandomDate(sixMonthsAgo, threeMonthsAhead);
        const duration = leaveType === 'Sick' ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 7) + 1;
        const endDateObj = new Date(startDate);
        endDateObj.setDate(endDateObj.getDate() + duration - 1);
        const endDate = endDateObj.toISOString().split('T')[0];

        const appliedDate = new Date(startDate);
        appliedDate.setDate(appliedDate.getDate() - Math.floor(Math.random() * 14) - 1);
        const appliedOn = appliedDate.toISOString().split('T')[0];

        let status: DummyLeave['status'];
        const isPast = new Date(endDate) < now;
        const isFuture = new Date(startDate) > now;

        if (isPast) {
            status = Math.random() > 0.9 ? 'Rejected' : 'Approved';
        } else if (isFuture) {
            status = Math.random() > 0.7 ? 'Approved' : Math.random() > 0.5 ? 'Pending' : 'Rejected';
        } else {
            status = 'Approved'; // Currently on leave
        }

        const approver = status !== 'Pending'
            ? getRandomItem(dummyEmployees.filter(e => e.role === 'Manager' || e.role === 'HR' || e.role === 'Admin'))
            : undefined;

        leaves.push({
            id: `leave_${i + 1}`,
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            leaveType,
            startDate,
            endDate,
            days: calculateDays(startDate, endDate),
            reason: getRandomItem(leaveReasons[leaveType]),
            status,
            appliedOn,
            approvedBy: approver ? `${approver.firstName} ${approver.lastName}` : undefined,
            approvedOn: status !== 'Pending' ? getRandomDate(new Date(appliedOn), new Date(startDate)) : undefined,
            rejectionReason: status === 'Rejected' ? 'Insufficient leave balance' : undefined,
        });
    }

    return leaves.sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
}

export function generateLeaveBalances(): LeaveBalance[] {
    return dummyEmployees
        .filter(e => e.status === 'Active')
        .map(employee => {
            const employeeLeaves = dummyLeaves.filter(
                l => l.employeeId === employee.id && l.status === 'Approved'
            );

            const casualUsed = employeeLeaves
                .filter(l => l.leaveType === 'Casual')
                .reduce((sum, l) => sum + l.days, 0);

            const sickUsed = employeeLeaves
                .filter(l => l.leaveType === 'Sick')
                .reduce((sum, l) => sum + l.days, 0);

            const earnedUsed = employeeLeaves
                .filter(l => l.leaveType === 'Earned')
                .reduce((sum, l) => sum + l.days, 0);

            return {
                employeeId: employee.id,
                casual: { total: 12, used: casualUsed, remaining: 12 - casualUsed },
                sick: { total: 10, used: sickUsed, remaining: 10 - sickUsed },
                earned: { total: 15, used: earnedUsed, remaining: 15 - earnedUsed },
            };
        });
}

// Generate and export default leaves
export const dummyLeaves = generateDummyLeaves(50);
export const leaveBalances = generateLeaveBalances();
