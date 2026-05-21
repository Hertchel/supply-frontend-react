export type itemType = {
  pr_details: {
    pr_no: string;
    office: string;
    office_details?: {
      id: number;
      code: string;
      name: string;
      department?: string;
    };
    fund_cluster?: string;
    purpose: string;
    requisitioner_details: {
      name: string;
      designation: string;
    };
    campus_director_details: {
      name: string;
      designation: string;
    };
    reviewed_by_details?: {
      id?: number;
      name: string;
      email?: string;
      designation?: string;
    };
    created_at: Date;
  };
  item_no: string;
  stock_property_no: string;
  unit: string;
  item_description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
};
