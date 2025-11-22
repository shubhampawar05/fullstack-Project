import { dummyEmployees } from './employees';

export interface DummyPerformanceReview {
    id: string;
    employeeId: string;
    employeeName: string;
    reviewerId: string;
    reviewerName: string;
    period: string;
    status: 'Pending' | 'In Progress' | 'Completed';
    overallRating?: number; // 1-5
    competencies: {
        name: string;
        rating: number;
        comments?: string;
    }[];
    strengths?: string[];
    areasOfImprovement?: string[];
    goals?: string[];
    createdOn: string;
    completedOn?: string;
}

export interface DummyGoal {
    id: string;
    employeeId: string;
    employeeName: string;
    title: string;
    description: string;
    category: 'Individual' | 'Team' | 'Company';
    priority: 'High' | 'Medium' | 'Low';
    progress: number; // 0-100
    startDate: string;
    dueDate: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
    keyResults: {
        title: string;
        progress: number;
    }[];
}

const competencies = [
    'Technical Skills',
    'Communication',
    'Leadership',
    'Problem Solving',
    'Teamwork',
    'Time Management',
    'Adaptability',
    'Initiative',
];

const goalTitles = [
    'Improve code quality and reduce bugs',
    'Complete certification course',
    'Mentor junior team members',
    'Increase customer satisfaction',
    'Optimize application performance',
    'Learn new technology stack',
    'Improve team collaboration',
    'Deliver project on time',
];

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

export function generateDummyReviews(count: number = 40): DummyPerformanceReview[] {
    const reviews: DummyPerformanceReview[] = [];
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const employees = dummyEmployees.filter(e => e.status === 'Active');
    const reviewers = dummyEmployees.filter(e =>
        e.role === 'Manager' || e.role === 'HR' || e.role === 'Admin'
    );

    employees.forEach((employee, idx) => {
        if (reviews.length >= count) return;

        const reviewer = getRandomItem(reviewers);
        const createdDate = getRandomDate(sixMonthsAgo, now);
        const isCompleted = Math.random() > 0.3;

        const competencyRatings = competencies.map(comp => ({
            name: comp,
            rating: Math.floor(Math.random() * 2) + 3, // 3-5
            comments: isCompleted ? `Good performance in ${comp.toLowerCase()}` : undefined,
        }));

        const overallRating = isCompleted
            ? competencyRatings.reduce((sum, c) => sum + c.rating, 0) / competencyRatings.length
            : undefined;

        reviews.push({
            id: `review_${idx + 1}`,
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            reviewerId: reviewer.id,
            reviewerName: `${reviewer.firstName} ${reviewer.lastName}`,
            period: `Q${Math.floor(Math.random() * 4) + 1} ${now.getFullYear()}`,
            status: isCompleted ? 'Completed' : Math.random() > 0.5 ? 'In Progress' : 'Pending',
            overallRating,
            competencies: competencyRatings,
            strengths: isCompleted ? [
                'Strong technical skills',
                'Good team player',
                'Proactive approach',
            ] : undefined,
            areasOfImprovement: isCompleted ? [
                'Time management',
                'Communication with stakeholders',
            ] : undefined,
            goals: isCompleted ? [
                'Complete advanced training',
                'Lead a project',
                'Improve code review process',
            ] : undefined,
            createdOn: createdDate,
            completedOn: isCompleted ? getRandomDate(new Date(createdDate), now) : undefined,
        });
    });

    return reviews;
}

export function generateDummyGoals(count: number = 50): DummyGoal[] {
    const goals: DummyGoal[] = [];
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const threeMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 3, 1);

    const employees = dummyEmployees.filter(e => e.status === 'Active');

    employees.forEach((employee, idx) => {
        const numGoals = Math.floor(Math.random() * 3) + 2; // 2-4 goals per employee

        for (let i = 0; i < numGoals && goals.length < count; i++) {
            const startDate = getRandomDate(threeMonthsAgo, now);
            const dueDate = getRandomDate(now, threeMonthsAhead);
            const progress = Math.floor(Math.random() * 100);

            let status: DummyGoal['status'];
            if (progress === 100) status = 'Completed';
            else if (new Date(dueDate) < now) status = 'Overdue';
            else if (progress > 0) status = 'In Progress';
            else status = 'Not Started';

            goals.push({
                id: `goal_${goals.length + 1}`,
                employeeId: employee.id,
                employeeName: `${employee.firstName} ${employee.lastName}`,
                title: getRandomItem(goalTitles),
                description: `Detailed description of the goal and expected outcomes`,
                category: getRandomItem(['Individual', 'Team', 'Company']),
                priority: getRandomItem(['High', 'Medium', 'Low']),
                progress,
                startDate,
                dueDate,
                status,
                keyResults: [
                    { title: 'Complete phase 1', progress: Math.min(progress + 10, 100) },
                    { title: 'Achieve target metrics', progress: Math.max(progress - 10, 0) },
                    { title: 'Get stakeholder approval', progress },
                ],
            });
        }
    });

    return goals;
}

// Generate and export default data
export const dummyReviews = generateDummyReviews(40);
export const dummyGoals = generateDummyGoals(50);
