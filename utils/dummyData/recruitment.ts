import { dummyEmployees } from './employees';

export interface DummyJob {
    id: string;
    title: string;
    department: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    experience: string;
    salary: string;
    status: 'Active' | 'Closed' | 'Draft';
    postedOn: string;
    closingDate: string;
    applicants: number;
    description: string;
    requirements: string[];
}

export interface DummyCandidate {
    id: string;
    jobId: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    experience: number; // years
    currentCompany: string;
    currentRole: string;
    expectedSalary: string;
    noticePeriod: string;
    stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
    appliedOn: string;
    resumeUrl: string;
    skills: string[];
    rating?: number; // 1-5
    notes?: string;
}

const jobTitles = {
    Engineering: ['Senior Software Engineer', 'Full Stack Developer', 'Backend Engineer', 'Frontend Developer', 'DevOps Engineer'],
    Product: ['Product Manager', 'Senior Product Manager', 'Product Analyst', 'Product Owner'],
    Design: ['UI/UX Designer', 'Senior Designer', 'Graphic Designer', 'Product Designer'],
    Marketing: ['Digital Marketing Manager', 'Content Writer', 'SEO Specialist', 'Marketing Executive'],
    Sales: ['Sales Manager', 'Business Development Executive', 'Account Manager', 'Sales Representative'],
    HR: ['HR Manager', 'Talent Acquisition Specialist', 'HR Executive', 'Recruiter'],
};

const requirements = {
    Engineering: [
        '3+ years of experience in software development',
        'Strong knowledge of JavaScript/TypeScript',
        'Experience with React and Node.js',
        'Understanding of RESTful APIs',
        'Good problem-solving skills',
        'Bachelor\'s degree in Computer Science or related field',
    ],
    Product: [
        '2+ years of product management experience',
        'Strong analytical and problem-solving skills',
        'Experience with Agile methodologies',
        'Excellent communication skills',
        'Data-driven decision making',
        'MBA or equivalent preferred',
    ],
    Design: [
        '2+ years of UI/UX design experience',
        'Proficiency in Figma, Adobe XD',
        'Strong portfolio demonstrating design skills',
        'Understanding of user-centered design',
        'Excellent visual design skills',
        'Bachelor\'s degree in Design or related field',
    ],
};

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

export function generateDummyJobs(count: number = 15): DummyJob[] {
    const jobs: DummyJob[] = [];
    const now = new Date();
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const oneMonthAhead = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    Object.entries(jobTitles).forEach(([dept, titles]) => {
        titles.forEach((title, idx) => {
            if (jobs.length >= count) return;

            const postedOn = getRandomDate(twoMonthsAgo, now);
            const closingDateObj = new Date(postedOn);
            closingDateObj.setDate(closingDateObj.getDate() + 30 + Math.floor(Math.random() * 30));
            const closingDate = closingDateObj.toISOString().split('T')[0];

            const isPast = new Date(closingDate) < now;
            const status = isPast
                ? (Math.random() > 0.5 ? 'Closed' : 'Active')
                : (Math.random() > 0.8 ? 'Draft' : 'Active');

            jobs.push({
                id: `job_${jobs.length + 1}`,
                title,
                department: dept,
                location: getRandomItem(['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Remote']),
                type: getRandomItem(['Full-time', 'Full-time', 'Full-time', 'Contract', 'Internship']),
                experience: `${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 3) + 5} years`,
                salary: `₹${Math.floor(Math.random() * 20) + 10}-${Math.floor(Math.random() * 10) + 25} LPA`,
                status,
                postedOn,
                closingDate,
                applicants: status === 'Draft' ? 0 : Math.floor(Math.random() * 50) + 5,
                description: `We are looking for a talented ${title} to join our ${dept} team. This is an exciting opportunity to work on cutting-edge projects and make a significant impact.`,
                requirements: requirements[dept as keyof typeof requirements] || [],
            });
        });
    });

    return jobs.slice(0, count);
}

export function generateDummyCandidates(jobs: DummyJob[], candidatesPerJob: number = 5): DummyCandidate[] {
    const candidates: DummyCandidate[] = [];
    const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Arjun', 'Pooja', 'Rohan', 'Neha'];
    const lastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Mehta', 'Gupta', 'Verma', 'Joshi', 'Desai'];
    const companies = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'HCL', 'Tech Mahindra', 'Capgemini'];
    const stages: DummyCandidate['stage'][] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

    jobs.filter(j => j.status === 'Active').forEach(job => {
        const numCandidates = Math.floor(Math.random() * candidatesPerJob) + candidatesPerJob;

        for (let i = 0; i < numCandidates; i++) {
            const firstName = getRandomItem(firstNames);
            const lastName = getRandomItem(lastNames);
            const name = `${firstName} ${lastName}`;

            const appliedDate = new Date(job.postedOn);
            appliedDate.setDate(appliedDate.getDate() + Math.floor(Math.random() * 20));

            candidates.push({
                id: `cand_${candidates.length + 1}`,
                jobId: job.id,
                name,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
                phone: `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
                avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=${getRandomItem(['667eea', '764ba2', '10b981'])}&color=fff&size=200`,
                experience: Math.floor(Math.random() * 8) + 1,
                currentCompany: getRandomItem(companies),
                currentRole: job.title.replace('Senior ', '').replace('Junior ', ''),
                expectedSalary: `₹${Math.floor(Math.random() * 15) + 10} LPA`,
                noticePeriod: getRandomItem(['Immediate', '15 days', '30 days', '60 days', '90 days']),
                stage: getRandomItem(stages),
                appliedOn: appliedDate.toISOString().split('T')[0],
                resumeUrl: '#',
                skills: job.requirements.slice(0, 4).map(r => r.split(' ')[0]),
                rating: Math.random() > 0.5 ? Math.floor(Math.random() * 2) + 3.5 : undefined,
            });
        }
    });

    return candidates;
}

// Generate and export default data
export const dummyJobs = generateDummyJobs(15);
export const dummyCandidates = generateDummyCandidates(dummyJobs, 8);
