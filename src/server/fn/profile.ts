import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getUserProfile,
  getUserProfileByUsername,
  getUserPostHistory,
  getUserTrades,
  addEducation,
  updateEducation,
  deleteEducation,
  addCertification,
  updateCertification,
  deleteCertification,
} from "../data-access/profiles";

// Get profile by ID
export const getProfileFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      id: z.string(),
    })
  )
  .handler(async ({ data }) => {
    return await getUserProfile(data.id);
  });

// Get profile by username
export const getProfileByUsernameFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      username: z.string(),
    })
  )
  .handler(async ({ data }) => {
    return await getUserProfileByUsername(data.username);
  });

// Get post history
export const getPostHistoryFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      userId: z.string(),
      limit: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    return await getUserPostHistory(data.userId, data.limit);
  });

// Get user trades
export const getUserTradesFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      userId: z.string(),
      limit: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    return await getUserTrades(data.userId, data.limit);
  });

// Add education
export const addEducationFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string(),
      school: z.string(),
      degree: z.string(),
      field: z.string().optional(),
      startDate: z.date(),
      endDate: z.date().optional(),
      current: z.boolean().default(false),
      gpa: z.string().optional(),
      honors: z.string().optional(),
      activities: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    await addEducation(data.userId, data);
    return { success: true };
  });

// Update education
export const updateEducationFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      educationId: z.string(),
      school: z.string().optional(),
      degree: z.string().optional(),
      field: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      current: z.boolean().optional(),
      gpa: z.string().optional(),
      honors: z.string().optional(),
      activities: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { educationId, ...rest } = data;
    await updateEducation(educationId, rest);
    return { success: true };
  });

// Delete education
export const deleteEducationFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      educationId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    await deleteEducation(data.educationId);
    return { success: true };
  });

// Add certification
export const addCertificationFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string(),
      name: z.string(),
      organization: z.string(),
      issueDate: z.date(),
      expirationDate: z.date().optional(),
      credentialId: z.string().optional(),
      credentialUrl: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    await addCertification(data.userId, data);
    return { success: true };
  });

// Update certification
export const updateCertificationFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      certificationId: z.string(),
      name: z.string().optional(),
      organization: z.string().optional(),
      issueDate: z.date().optional(),
      expirationDate: z.date().optional(),
      credentialId: z.string().optional(),
      credentialUrl: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { certificationId, ...rest } = data;
    await updateCertification(certificationId, rest);
    return { success: true };
  });

// Delete certification
export const deleteCertificationFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      certificationId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    await deleteCertification(data.certificationId);
    return { success: true };
  });
