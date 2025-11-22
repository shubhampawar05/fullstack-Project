/**
 * Employee Model - TalentHR
 * Extended employee information (extends User model)
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId; // Reference to User
  employeeId: string; // Unique employee ID (e.g., EMP001)
  departmentId?: mongoose.Types.ObjectId; // Reference to Department
  position?: string; // Job title/position
  hireDate: Date; // Date of hire
  employmentType: "full-time" | "part-time" | "contract" | "intern";
  salary?: number; // Monthly/annual salary
  managerId?: mongoose.Types.ObjectId; // Reference to User (manager)
  workLocation?: string; // Office location
  phone?: string; // Contact phone
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  skills?: string[]; // Array of skills
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
  }>;
  documents?: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  status: "active" | "on-leave" | "terminated" | "resigned";
  notes?: string; // Additional notes
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, "Position must not exceed 100 characters"],
    },
    hireDate: {
      type: Date,
      required: [true, "Hire date is required"],
      default: Date.now,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "intern"],
      default: "full-time",
    },
    salary: {
      type: Number,
      min: [0, "Salary must be positive"],
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    workLocation: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Invalid phone number"],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "USA" },
    },
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    skills: [{
      type: String,
      trim: true,
    }],
    certifications: [{
      name: { type: String, required: true, trim: true },
      issuer: { type: String, required: true, trim: true },
      issueDate: { type: Date, required: true },
      expiryDate: { type: Date },
    }],
    documents: [{
      name: { type: String, required: true, trim: true },
      type: { type: String, required: true, trim: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    }],
    status: {
      type: String,
      enum: ["active", "on-leave", "terminated", "resigned"],
      default: "active",
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes must not exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
EmployeeSchema.index({ userId: 1 }, { unique: true });
EmployeeSchema.index({ employeeId: 1 }, { unique: true });
EmployeeSchema.index({ departmentId: 1 });
EmployeeSchema.index({ managerId: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ companyId: 1 }); // Will be added via virtual or populate

// Auto-generate employee ID before saving
EmployeeSchema.pre("save", async function (next) {
  if (!this.isNew || this.employeeId) {
    return next();
  }

  try {
    // Get company from user
    const UserModel = mongoose.model("User");
    const user = await UserModel.findById(this.userId).populate("companyId");
    
    if (!user || !user.companyId) {
      return next(new Error("User or company not found"));
    }

    const company = user.companyId as any;
    const companySlug = company.slug || company.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    // Get all employees for this company to find the highest sequence
    const companyUsers = await UserModel.find({ companyId: company._id }).select("_id");
    const userIds = companyUsers.map((u) => u._id);
    
    const EmployeeModel = mongoose.model("Employee");
    const existingEmployees = await EmployeeModel.find({
      userId: { $in: userIds },
      employeeId: { $regex: `^${companySlug.toUpperCase()}-EMP` },
    }).sort({ employeeId: -1 });

    let sequence = 1;
    if (existingEmployees.length > 0) {
      const lastEmployeeId = existingEmployees[0].employeeId;
      const match = lastEmployeeId.match(/EMP(\d+)$/);
      if (match) {
        sequence = parseInt(match[1]) + 1;
      }
    }

    // Format: COMPANY-EMP001
    this.employeeId = `${companySlug.toUpperCase()}-EMP${sequence.toString().padStart(3, "0")}`;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Virtual for companyId (via user)
EmployeeSchema.virtual("companyId").get(function () {
  // This will be populated when needed
  return null;
});

// Export the model
const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;

