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

// Get performance metrics for a user
export const getPerformanceMetricsFn = createServerFn({ method: "GET" })
  .inputValidator(
    z.object({
      userId: z.string(),
    })
  )
  .handler(async ({ data }) => {
    // Return mock performance metrics for now
    // TODO: Calculate from actual trade data
    return [
      {
        period: "Last 30 Days",
        totalTrades: 12,
        winRate: 66.7,
        totalReturn: 2450.0,
        averageReturn: 8.5,
        bestTrade: 24.3,
        worstTrade: -8.2,
        sharpeRatio: 1.45,
        maxDrawdown: -12.5,
      },
      {
        period: "Last 90 Days",
        totalTrades: 34,
        winRate: 58.8,
        totalReturn: 8920.0,
        averageReturn: 6.2,
        bestTrade: 42.1,
        worstTrade: -15.3,
        sharpeRatio: 1.22,
        maxDrawdown: -18.7,
      },
      {
        period: "Year to Date",
        totalTrades: 67,
        winRate: 55.2,
        totalReturn: 15340.0,
        averageReturn: 4.8,
        bestTrade: 52.6,
        worstTrade: -22.1,
        sharpeRatio: 0.98,
        maxDrawdown: -25.4,
      },
    ];
  });
