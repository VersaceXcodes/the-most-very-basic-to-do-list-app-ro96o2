import { z } from 'zod';

// --- Tasks Schemas ---

// Entity Schema for Tasks
export const taskSchema = z.object({
  id: z.string(),
  description: z.string(),
  completed: z.boolean(),
});

// Input Schema for Creating a Task
export const createTaskInputSchema = z.object({
  description: z.string().min(1, "Description cannot be empty.").max(256, "Description cannot exceed 256 characters."),
  // 'completed' has a default in DB, so it's optional for creation
  completed: z.boolean().optional(),
});

// Input Schema for Updating a Task
export const updateTaskInputSchema = z.object({
  // id is required to identify the task to update, but not often part of the request body for updates
  // Typically, id would be part of the path parameter, but including it here for completeness if needed in body
  id: z.string().optional(), // Marking as optional in case it's derived from URL
  description: z.string().min(1, "Description cannot be empty.").max(256, "Description cannot exceed 256 characters.").optional(),
  completed: z.boolean().optional(),
});

// Query Schema for Searching/Filtering Tasks
export const searchTasksInputSchema = z.object({
  query: z.string().optional(), // For full-text search on description
  completed: z.boolean().optional(), // Filter by completion status
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['id', 'description', 'completed']).default('id'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
});

// Response Schema for Tasks (can be same as entity schema or more elaborate)
export const taskResponseSchema = taskSchema;

// Inferred Types
export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type SearchTasksInput = z.infer<typeof searchTasksInputSchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;