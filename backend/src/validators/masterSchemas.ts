import { z } from "zod";

export const optionalText = z.string().trim().min(1).optional();

export const firmSchema = z.object({
  name: z.string().trim().min(1),
  gstNumber: optionalText,
  address: optionalText,
  phone: optionalText,
  email: z.string().email().optional()
});

export const customerSchema = z.object({
  name: z.string().trim().min(1),
  gstNumber: optionalText,
  contactPerson: optionalText,
  phone: optionalText,
  email: z.string().email().optional(),
  address: optionalText
});

export const supplierSchema = customerSchema;

export const coalSizeSchema = z.object({
  name: z.string().trim().min(1),
  description: optionalText
});

export const transporterSchema = z.object({
  name: z.string().trim().min(1),
  location: optionalText,
  contactPerson: optionalText,
  phone: optionalText,
  vehicleOwnerType: optionalText,
  remarks: optionalText
});

export const idParamSchema = z.object({
  id: z.string().trim().min(1)
});
