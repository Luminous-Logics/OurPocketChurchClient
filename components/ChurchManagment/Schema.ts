import * as z from "zod";
import { dropDownSchemaOpt } from "@/zod";
export const defaultValues: CreateChurchFormType = {
  parish_name: "",
  diocese: undefined,
  address_line1: undefined,
  address_line2: undefined,
  city: undefined,
  state: undefined,
  country: undefined,
  postal_code: undefined,
  phone: undefined,
  email: undefined,
  website_url: undefined,
  established_date: undefined,
  patron_saint: undefined,
  timezone: { label: "America/Chicago", value: "America/Chicago" },
  subscription_plan: { label: "Basic", value: "basic" },
  admin_email: undefined,
  admin_password: undefined,
  admin_first_name: undefined,
  admin_last_name: undefined,
  admin_phone: undefined,
  admin_role: undefined,
  admin_department: undefined,
};

export const createChurchSchema = z
  .object({
    parish_id: z.string().optional(),
    parish_name: z.string().min(1, "Parish Name is required"),
    diocese: z.string().optional(),
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    website_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    established_date: z.string().optional(),
    patron_saint: z.string().optional(),
    timezone: z.optional(dropDownSchemaOpt),
    subscription_plan: z.optional(
      z.object({
        label: z.string(),
        value: z.enum(["free", "basic", "premium", "enterprise"]),
      })
    ),
    subscription_expiry: z.string().optional(),
    admin_email: z.string().email("Invalid email address").optional(),
    admin_password: z
      .string()
      .min(8, "Admin Password must be at least 8 characters long")
      .optional(),
    admin_first_name: z.string().optional(),
    admin_last_name: z.string().optional(),
    admin_phone: z.string().optional(),
    admin_role: z.string().optional(),
    admin_department: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const adminFields = [
      data.admin_email,
      data.admin_password,
      data.admin_first_name,
      data.admin_last_name,
      data.admin_phone,
      data.admin_role,
    ];

    const anyAdminFieldProvided = adminFields.some(
      (field) => field !== undefined && field !== null && field !== ""
    );

    if (anyAdminFieldProvided) {
      if (!data.admin_email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Admin Email is required when other admin fields are provided",
          path: ["admin_email"],
        });
      }
      if (!data.admin_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Admin Password is required when other admin fields are provided",
          path: ["admin_password"],
        });
      }
      if (!data.admin_first_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Admin First Name is required when other admin fields are provided",
          path: ["admin_first_name"],
        });
      }
      if (!data.admin_last_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Admin Last Name is required when other admin fields are provided",
          path: ["admin_last_name"],
        });
      }
      if (!data.admin_phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Admin Phone is required when other admin fields are provided",
          path: ["admin_phone"],
        });
      }
      if (!data.admin_role) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Admin Role is required when other admin fields are provided",
          path: ["admin_role"],
        });
      }
    }
  });

export type CreateChurchFormType = z.infer<typeof createChurchSchema>;

export interface CreateChurchRequestBody {
  parish_id?: string;
  parish_name: string;
  diocese?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website_url?: string;
  established_date?: string;
  patron_saint?: string;
  timezone?: string;
  subscription_plan?: string;
  subscription_expiry?: string;
  admin_email?: string;
  admin_password?: string;
  admin_first_name?: string;
  admin_last_name?: string;
  admin_phone?: string;
  admin_role?: string;
  admin_department?: string;
}
