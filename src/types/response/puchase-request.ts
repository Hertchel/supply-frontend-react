export type purchaseRequestType = {
  pr_no: string;
  user: string;
  item_no: string;

  office: string;

  office_details?: {
    id: number;
    code: string;
    name: string;
    department?: string;
  };

  fund_cluster: string;
  purpose: string;
  status: string;

  requisitioner_details: {
    requisition_id: string;
    name: string;
    designation: string;
    department: string;
  };

  reviewed_by?: number | null;

  reviewed_by_details?: {
    id: number;
    name: string;
    email: string;
  } | null;

  campus_director: string;

  campus_director_details: {
    cd_id: string;
    name: string;
    designation: string;
    department: string;
  };

  created_at: Date;
};