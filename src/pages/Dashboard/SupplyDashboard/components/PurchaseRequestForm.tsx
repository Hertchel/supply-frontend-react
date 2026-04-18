import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getReviewers } from "@/services/userServices";

import {
  purchaseRequestFormSchema,
  type PurchaseRequestData,
} from "@/types/request/purchase-request";
import {
  useAddPurchaseRequest,
} from "@/services/purchaseRequestServices";
import { generatePrNo } from "@/services/generatePrNo";
import AsyncSelect from "react-select/async";
import Select from "react-select"; // Added for dropdowns
import { getAllRequisitioner } from "@/services/requisitionerServices";
import { Loader2 } from "lucide-react";
import { getAllCampusDirector } from "@/services/campusDirectorServices";
// import { getAllFundClusters, FundCluster } from "@/services/fundClusterServices"; // Add this
import { getAllOffices, Office } from "@/services/officeServices"; // Add this
import { MessageDialog } from "../../shared/components/MessageDialog";

interface PurchaseRequestFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  lastPrNo: string | undefined;
}

type stringOption = {
  value: string;
  label: string;
};

type numberOption = {
  value: number;
  label: string;
};

interface messageDialogProps {
  open: boolean;
  message: string;
  title: string;
  type: "success" | "error" | "info";
}

const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  lastPrNo,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [fundClusters, setFundClusters] = useState<option[]>([]);
  const [offices, setOffices] = useState<numberOption[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [messageDialog, setMessageDialog] = useState<messageDialogProps>({
    open: false,
    message: "",
    title: "",
    type: "success" as const,
  });

  const { mutate: addPurchaseRequestMutation } = useAddPurchaseRequest();
  const currentPurchaseNumber = lastPrNo && lastPrNo;

  const {
  register,
  handleSubmit,
  setValue,
  formState: { errors },
  reset,
} = useForm<PurchaseRequestData>({
  resolver: zodResolver(purchaseRequestFormSchema),
  defaultValues: {
    fund_cluster: "",     
    reviewed_by: null,      
  },
});

  // Load dropdown data when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      loadDropdownData();
    }
  }, [isDialogOpen]);

  const loadDropdownData = async () => {
  setLoadingData(true);
  try {
    // Load fund clusters
    /*
    const fundClusterRes = await getAllFundClusters();
    if (fundClusterRes.status === "success" && fundClusterRes.data) {
      setFundClusters(
        fundClusterRes.data.map((fc: FundCluster) => ({
          value: fc.id.toString(),
          label: `${fc.code} - ${fc.name}`,
        }))
      );
    }
    */
    // Load offices
    const officeRes = await getAllOffices();
    if (officeRes.status === "success" && officeRes.data) {
      setOffices(
        officeRes.data.map((office: Office) => ({
          value: office.id,
          label: `${office.code} - ${office.name}`,
        }))
      );
    }
  } catch (error) {
    console.error("Error loading dropdown data:", error);
  } finally {
    setLoadingData(false);
  }
};
  const loadRequisitionerOptions = async (
    inputValue: string
  ): Promise<stringOption[]> => {
    try {
      const requisitioners = await getAllRequisitioner();
      return (
        requisitioners.data
          ?.filter((requisitioner) =>
            requisitioner?.name?.toLowerCase().includes(inputValue.toLowerCase())
          )
          .map((requisitioner) => ({
            value: requisitioner.requisition_id,
            label: requisitioner.name || "Unknown",
          })) || []
      );
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const loadCampusDirectorOptions = async (
    inputValue: string
  ): Promise<stringOption[]> => {
    try {
      const campus_directors = await getAllCampusDirector();
      return (
        campus_directors.data
          ?.filter((campus_director) =>
            campus_director?.name
              ?.toLowerCase()
              .includes(inputValue.toLowerCase())
          )
          .map((campus_director) => ({
            value: campus_director.cd_id,
            label: campus_director.name || "Unknown",
          })) || []
      );
    } catch (error) {
      console.log(error);
      return [];
    }
  };

 const loadUserOptions = async (inputValue: string): Promise<numberOption[]> => {
  try {
    const users = await getReviewers();

    return (
      users.data
        ?.filter((user: any) =>
          `${user.first_name} ${user.last_name}`
            .toLowerCase()
            .includes(inputValue.toLowerCase())
        )
        .map((user: any) => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name}`,
        })) || []
    );
  } catch (error) {
    console.log(error);
    return [];
  }
};

  const handleRequisitionerChange = (selectedOption: stringOption | null) => {
    setValue("requisitioner", selectedOption?.value ?? "");
  };

  const handleCampusDirectorChange = (selectedOption: stringOption | null) => {
    setValue("campus_director", selectedOption?.value ?? "");
  };
/*
  const handleFundClusterChange = (selectedOption: stringOption | null) => {
    setValue("fund_cluster", selectedOption?.value ?? "");};
*/
  const handleOfficeChange = (selectedOption: numberOption | null) => {
    setValue("office", selectedOption?.value ?? null);
  };

  const onSubmit = async (data: PurchaseRequestData) => {
    setIsLoading(true);

    const result = purchaseRequestFormSchema.safeParse(data);

    if (result.success) {
      addPurchaseRequestMutation(data, {
        onSuccess: (response) => {
          if (response.status === "success") {
            reset()
            setIsDialogOpen(false);
            setIsLoading(false);
            setMessageDialog({
              open: true,
              message: "Purchase Request added successfully",
              title: "Success",
              type: "success",
            });
          } else {
            reset()
            setIsDialogOpen(false);
            setIsLoading(false);
            setMessageDialog({
              open: true,
              message: "Something went wrong, please try again later",
              title: "Error",
              type: "error",
            });
          }
        },
        onError: (error: any) => {
           console.log("API ERROR:", error);
           console.log("BACKEND RESPONSE:", error?.response?.data);
          reset()
          setIsDialogOpen(false);
          setIsLoading(false);
          setMessageDialog({
            open: true,
            message: "Something went wrong, please try again later",
            title: "Error",
            type: "error",
          });
        },
      });
    }
  };

  const renderField = (
    label: string,
    name: keyof PurchaseRequestData,
    component: React.ReactNode
  ) => (
    <div className="w-full">
      <Label>{label}</Label>
      {component}
      {errors[name] && (
        <span className="text-red-400 text-xs">{errors[name]?.message}</span>
      )}
    </div>
  );

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-full w-[45rem]">
          <DialogTitle className="pb-6">Create Purchase Request</DialogTitle>
          <ScrollArea className="h-[30rem] mb-8">
            {loadingData ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  <div className="flex gap-4">
                    {renderField(
                      "PR No.",
                      "pr_no",
                      <Input
                        {...register("pr_no")}
                        value={generatePrNo(currentPurchaseNumber)}
                        readOnly
                      />
                    )}
                    {renderField(
                      "Fund Cluster",
                      "fund_cluster",
                      <Input
                        {...register("fund_cluster")}
                        placeholder="Enter Fund Cluster"
                      />
                    )}
                  </div>

                  {renderField(
                    "Office",
                    "office",
                    <Select
                      options={offices}
                      onChange={handleOfficeChange}
                      placeholder="Select Office..."
                      className="text-sm"
                      isClearable
                    />
                  )}

                  {renderField(
                    "Purpose",
                    "purpose",
                    <Textarea {...register("purpose")} />
                  )}
                  
                  {renderField(
                    "Requested By",
                    "requisitioner",
                    <AsyncSelect
                      defaultOptions
                      loadOptions={loadRequisitionerOptions}
                      onChange={handleRequisitionerChange}
                      placeholder="Search for a Requisitioner..."
                      className="text-sm"
                    />
                  )}

                  {renderField(
                    "Reviewed By",
                    "reviewed_by",
                    <AsyncSelect
                      defaultOptions
                      loadOptions={loadUserOptions}
                      onChange={(option) =>
                        setValue("reviewed_by", option?.value ?? null)
                      }
                      placeholder="Search for Reviewer..."
                      className="text-sm"
                    />
                  )}
                  
                  {renderField(
                    "Approved By",
                    "campus_director",
                    <AsyncSelect
                      defaultOptions
                      loadOptions={loadCampusDirectorOptions}
                      onChange={handleCampusDirectorChange}
                      placeholder="Search for a Campus Director..."
                      className="text-sm"
                    />
                  )}
                  
                  <div className="mt-6 fixed bottom-6 right-10">
                    <Button
                      className="text-slate-950 bg-orange-200 hover:bg-orange-300"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <p className="flex gap-2"><Loader2 className="animate-spin" /> Processing...</p>
                      ) : (
                        "Submit Purchase Request"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <MessageDialog
        open={messageDialog.open}
        message={messageDialog.message}
        title={messageDialog.title}
        type={messageDialog.type}
        onOpenChange={(open) => setMessageDialog((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default PurchaseRequestForm;