import { dummyEmployees } from './employees';

export interface DummyAttendance {
    id: string;
    employeeId: string;
    employeeName: string;
    date: string;
    clockIn: string;
    clockOut?: string;
    status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave' | 'Working';
    workDuration?: number; // in minutes
    breakDuration?: number; // in minutes
    notes?: string;
}

function getRandomTime(baseHour: number, variance: number): string {
    const hour = baseHour + Math.floor(Math.random() * variance);
    const minute = Math.floor(Math.random() * 60);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function calculateWorkDuration(clockIn: string, clockOut: string): number {
    const [inHour, inMin] = clockIn.split(':').map(Number);
    const [outHour, outMin] = clockOut.split(':').map(Number);
    return (outHour * 60 + outMin) - (inHour * 60 + inMin);
}

function getAttendanceStatus(clockIn: string, clockOut?: string): DummyAttendance['status'] {
    if (!clockOut) return 'Working';

    const [hour] = clockIn.split(':').map(Number);
    const workDuration = clockOut ? calculateWorkDuration(clockIn, clockOut) : 0;

    if (hour >= 10) return 'Late';
    if (workDuration < 240) return 'Half Day'; // Less than 4 hours
    return 'Present';
}

export function generateDummyAttendance(days: number = 90): DummyAttendance[] {
    const attendance: DummyAttendance[] = [];
    const today = new Date();
    let idCounter = 1;

    // Generate attendance for the past 'days' days
    for (let d = days; d >= 0; d--) {
        const date = new Date(today);
        date.setDate(date.getDate() - d);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const dateStr = date.toISOString().split('T')[0];

        // Generate attendance for each active employee
        dummyEmployees
            .filter(emp => emp.status === 'Active' || emp.status === 'On Leave')
            .forEach(employee => {
                // 95% attendance rate
                if (Math.random() > 0.95) {
                    attendance.push({
                        id: `att_${idCounter++}`,
                        employeeId: employee.id,
                        employeeName: `${employee.firstName} ${employee.lastName}`,
                        date: dateStr,
                        status: 'Absent',
                        clockIn: ''
                    });
                    return;
                }

                // 10% on leave
                if (employee.status === 'On Leave' || Math.random() > 0.9) {
                    attendance.push({
                        id: `att_${idCounter++}`,
                        employeeId: employee.id,
                        employeeName: `${employee.firstName} ${employee.lastName}`,
                        date: dateStr,
                        status: 'On Leave',
                        notes: 'Planned leave',
                        clockIn: ''
                    });
                    return;
                }

                const clockIn = getRandomTime(8, 3); // 8 AM to 11 AM
                const clockOut = d === 0 && Math.random() > 0.7 ? undefined : getRandomTime(17, 3); // 5 PM to 8 PM
                const workDuration = clockOut ? calculateWorkDuration(clockIn, clockOut) : undefined;
                const breakDuration = workDuration ? Math.floor(Math.random() * 30) + 30 : undefined; // 30-60 min

                attendance.push({
                    id: `att_${idCounter++}`,
                    employeeId: employee.id,
                    employeeName: `${employee.firstName} ${employee.lastName}`,
                    date: dateStr,
                    clockIn,
                    clockOut,
                    status: getAttendanceStatus(clockIn, clockOut),
                    workDuration,
                    breakDuration,
                });
            });
    }

    return attendance;
}

export function getAttendanceStats(employeeId?: string) {
    const attendance = generateDummyAttendance();
    const filtered = employeeId
        ? attendance.filter(a => a.employeeId === employeeId)
        : attendance;

    const thisMonth = filtered.filter(a => {
        const date = new Date(a.date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    return {
        totalDays: thisMonth.length,
        present: thisMonth.filter(a => a.status === 'Present').length,
        late: thisMonth.filter(a => a.status === 'Late').length,
        absent: thisMonth.filter(a => a.status === 'Absent').length,
        onLeave: thisMonth.filter(a => a.status === 'On Leave').length,
        halfDay: thisMonth.filter(a => a.status === 'Half Day').length,
        avgWorkHours: thisMonth
            .filter(a => a.workDuration)
            .reduce((sum, a) => sum + (a.workDuration || 0), 0) / thisMonth.length / 60,
    };
}

// Generate and export default attendance
export const dummyAttendance = generateDummyAttendance(90);
