import { z } from "zod";

export const abstractSchema = z.object({
  aoq_no: z.string(),
  purchase_request: z.string().optional(),
});
export type supplierType = {
  supplier_no: string;
  name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  tin: string;
  extra_character?: string;
  aoq: string;
  rfq: string;
};
/*
export type supplierType = {
  supplier_no: string
  extra_character: string
  aoq: string,
  rfq: string
} 
*/
export type supplierItemType = {
  supplier_item_no: string;
  supplier: string;
  rfq: string;
  item_quotation: string;
  total_amount: string;
};
export type abstractType = z.infer<typeof abstractSchema>;
