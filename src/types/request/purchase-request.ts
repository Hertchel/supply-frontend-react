import { z } from 'zod';

export const purchaseRequestFormSchema = z.object({
  pr_no: z.string().min(1, 'Required'),
  office: z.number().nullable(),
  fund_cluster: z.string().optional(),
  purpose: z.string().min(1, 'Required'),
  status: z.string().min(1, 'Required').default("Pending for Approval"),
  mode_of_procurement: z.string().default("Direct Contracting"),
  requisitioner: z.string().min(1, 'Required'),
  reviewed_by: z.number().optional().nullable(),  
  campus_director: z.string().min(1, 'Required'),
});

export type PurchaseRequestData = z.infer<typeof purchaseRequestFormSchema>;

export const EditPRFormSchema = z.object({
  office: z.number().nullable().refine((val) => val !== null, {
    message: "Required",
  }),
  purpose: z.string().min(1, 'Required'),
  requisitioner: z.string().min(1, 'Required'),
});

export type EditPRFormType = z.infer<typeof EditPRFormSchema>;