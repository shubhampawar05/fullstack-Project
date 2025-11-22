export interface DummyEmployee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    role: 'Admin' | 'HR' | 'Manager' | 'Employee' | 'Recruiter';
    department: string;
    position: string;
    joinDate: string;
    status: 'Active' | 'On Leave' | 'Inactive';
    salary: number;
    location: string;
    reportingTo?: string;
    skills: string[];
    performance: number; // 1-5 rating
}

const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const positions = {
    Engineering: ['Senior Engineer', 'Software Engineer', 'Junior Engineer', 'Tech Lead', 'Engineering Manager'],
    Product: ['Product Manager', 'Senior PM', 'Product Owner', 'Product Analyst'],
    Design: ['UI/UX Designer', 'Senior Designer', 'Design Lead', 'Graphic Designer'],
    Marketing: ['Marketing Manager', 'Content Writer', 'SEO Specialist', 'Social Media Manager'],
    Sales: ['Sales Manager', 'Account Executive', 'Sales Representative', 'Business Development'],
    HR: ['HR Manager', 'HR Specialist', 'Recruiter', 'Talent Acquisition'],
    Finance: ['Finance Manager', 'Accountant', 'Financial Analyst', 'Payroll Specialist'],
    Operations: ['Operations Manager', 'Office Manager', 'Admin Assistant', 'Facilities Manager'],
};

const firstNames = [
    'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Arjun', 'Pooja',
    'Rohan', 'Neha', 'Karan', 'Divya', 'Aditya', 'Kavya', 'Siddharth', 'Riya',
    'Akash', 'Ishita', 'Varun', 'Meera', 'Nikhil', 'Tanvi', 'Harsh', 'Shreya',
    'Manish', 'Ananya', 'Gaurav', 'Sakshi', 'Vishal', 'Nidhi'
];

const lastNames = [
    'Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Mehta', 'Gupta', 'Verma',
    'Joshi', 'Desai', 'Rao', 'Nair', 'Iyer', 'Chopra', 'Malhotra', 'Agarwal',
    'Shah', 'Kapoor', 'Bhat', 'Kulkarni', 'Pillai', 'Menon', 'Sinha', 'Pandey',
    'Mishra', 'Jain', 'Bansal', 'Saxena', 'Tiwari', 'Chauhan'
];

const skills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker',
    'Leadership', 'Communication', 'Project Management', 'Agile', 'Scrum', 'Data Analysis',
    'UI/UX Design', 'Figma', 'Adobe XD', 'Marketing Strategy', 'SEO', 'Content Writing',
    'Sales', 'CRM', 'Negotiation', 'Financial Analysis', 'Excel', 'Accounting'
];

const locations = ['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateAvatar(firstName: string, lastName: string): string {
    const initials = `${firstName[0]}${lastName[0]}`;
    const colors = ['667eea', '764ba2', '10b981', 'f59e0b', 'ef4444', '3b82f6', '8b5cf6', 'ec4899'];
    const color = getRandomItem(colors);
    return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=200&bold=true`;
}

function generateEmployeeId(index: number): string {
    const year = new Date().getFullYear();
    return `EMP${year}${String(index).padStart(4, '0')}`;
}

function getRandomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

export function generateDummyEmployees(count: number = 30): DummyEmployee[] {
    const employees: DummyEmployee[] = [];
    const usedEmails = new Set<string>();

    for (let i = 0; i < count; i++) {
        const firstName = getRandomItem(firstNames);
        const lastName = getRandomItem(lastNames);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@talenthr.com`;

        // Skip if email already used
        if (usedEmails.has(email)) continue;
        usedEmails.add(email);

        const department = getRandomItem(departments);
        const position = getRandomItem(positions[department as keyof typeof positions]);

        let role: DummyEmployee['role'] = 'Employee';
        if (i === 0) role = 'Admin';
        else if (i < 3) role = 'HR';
        else if (i < 8) role = 'Manager';
        else if (i < 11) role = 'Recruiter';

        const joinDate = getRandomDate(
            new Date(2020, 0, 1),
            new Date(2024, 11, 1)
        );

        const status = Math.random() > 0.9 ? 'On Leave' : Math.random() > 0.95 ? 'Inactive' : 'Active';

        employees.push({
            id: `emp_${i + 1}`,
            employeeId: generateEmployeeId(i + 1),
            firstName,
            lastName,
            email,
            phone: `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            avatar: generateAvatar(firstName, lastName),
            role,
            department,
            position,
            joinDate,
            status,
            salary: Math.floor(Math.random() * 1500000 + 500000), // 5L to 20L
            location: getRandomItem(locations),
            reportingTo: i > 0 && Math.random() > 0.3 ? `emp_${Math.floor(Math.random() * i) + 1}` : undefined,
            skills: getRandomItems(skills, Math.floor(Math.random() * 5) + 3),
            performance: Math.floor(Math.random() * 2) + 3.5, // 3.5 to 5
        });
    }

    return employees;
}

// Generate and export default employees
export const dummyEmployees = generateDummyEmployees(30);
