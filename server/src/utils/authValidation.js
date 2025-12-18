import { z } from "zod";

// Citizen Validation
export const reporterRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    phone: z.string().length(10, "Phone must be 10 digits"),
    password: z.string().min(6),
  }),
});

// NGO Validation (Stricter)
export const ngoRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(6),
    registration_number: z.string().min(5, "License number required"),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

// Login Schema (Polymorphic-ish)
export const loginSchema = z.object({
  body: z.object({
    identifier: z.string(), // Can be email OR phone
    password: z.string(),
    // role: z.enum(["reporter", "ngo", "admin"]), // User must tell us who they are
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email format").optional(),
  }),
});
