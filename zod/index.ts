import z from "zod";

const dropDownSchemaOpt = z.object({
  value: z.string(),
  label: z.string(),
});

export { dropDownSchemaOpt };

export const createParishionerSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().min(1, "Last Name is required"),
  phone: z.string().min(1, "Phone number is required"),
  profile_image_url: z.string().url("Invalid URL").optional(),
  parish_id: z.number().min(1, "Parish ID is required"),
  ward_id: dropDownSchemaOpt,
  family_id: z.number().min(1, "Family ID is required"),
  middle_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: dropDownSchemaOpt,
  marital_status: dropDownSchemaOpt,
  occupation: z.string().optional(),
  baptism_date: z.string().optional(),
  first_communion_date: z.string().optional(),
  confirmation_date: z.string().optional(),
  marriage_date: z.string().optional(),
  member_status: z.string().optional(),
  photo_url: z.string().url("Invalid URL").optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().optional(),
  registration_date: z.string().optional(),
});

export type CreateParishionerFormType = z.infer<typeof createParishionerSchema>;
