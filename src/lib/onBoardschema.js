import { z } from "zod";

export const onboardingSchema = z.object({
  // Step 1: Income
  salary: z.coerce.number().min(1, "Salary is required"),
  
  // Step 2: Fixed Expenses
  rent: z.coerce.number().min(0, "Rent cannot be negative"),
  utilities: z.coerce.number().default(0),
  
  // Step 3: Other
  otherFixed: z.coerce.number().default(0),
  savingsGoal: z.coerce.number().optional(),
});