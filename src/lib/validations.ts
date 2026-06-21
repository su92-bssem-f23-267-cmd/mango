import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const mangoSchema = z.object({
  name: z.string().min(1, "Mango Name is required"),
  varietyId: z.string().min(1, "Variety is required"),
  description: z.string().min(1, "Description is required"),
  price: z.preprocess((val) => Number(val), z.number().gt(0, "Price must be greater than 0")),
  stock: z.preprocess((val) => Number(val), z.number().int().min(0, "Stock must be 0 or more")),
  isActive: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return Boolean(val);
  }, z.boolean().default(true)),
})

export type MangoInput = z.infer<typeof mangoSchema>

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const mangoFormSchema = mangoSchema.extend({
  image: z.any()
    .refine((file) => file instanceof File && file.size > 0, "Image is required")
    .refine((file) => file instanceof File && file.size <= MAX_FILE_SIZE, "Max image size is 5MB.")
    .refine(
      (file) => file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
})

export type MangoFormInput = z.infer<typeof mangoFormSchema>

export const mangoUpdateFormSchema = mangoSchema.extend({
  image: z.any()
    .optional()
    .refine((file) => !file || file.size === 0 || (file instanceof File && file.size <= MAX_FILE_SIZE), "Max image size is 5MB.")
    .refine(
      (file) => !file || file.size === 0 || (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
})

export type MangoUpdateFormInput = z.infer<typeof mangoUpdateFormSchema>

export const varietySchema = z.object({
  name: z.string()
    .min(3, "Variety Name must be at least 3 characters")
    .max(100, "Variety Name must be at most 100 characters"),
  description: z.string().optional().nullable(),
  isActive: z.preprocess((val) => {
    if (typeof val === 'string') return val === 'true';
    return Boolean(val);
  }, z.boolean().default(true)),
})

export type VarietyInput = z.infer<typeof varietySchema>

export const inventoryActionSchema = z.object({
  mangoId: z.string().min(1, "Mango ID is required"),
  quantity: z.preprocess((val) => Number(val), z.number().int().min(1, "Quantity must be at least 1")),
  note: z.string().optional().nullable(),
})

export type InventoryActionInput = z.infer<typeof inventoryActionSchema>

export const inventoryUpdateSchema = z.object({
  mangoId: z.string().min(1, "Mango ID is required"),
  quantity: z.preprocess((val) => Number(val), z.number().int().min(0, "Quantity must be 0 or more")),
  note: z.string().optional().nullable(),
})

export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>
