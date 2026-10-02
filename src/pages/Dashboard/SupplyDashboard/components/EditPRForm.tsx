import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Loading from "../../shared/components/Loading";
import { Loader2 } from "lucide-react";
import {
  usePurchaseRequestList,
  useUpdatePurchaseRequest,
} from "@/services/purchaseRequestServices";
import {
  EditPRFormSchema,
  EditPRFormType,
} from "@/types/request/purchase-request";
import { getAllRequisitioner } from "@/services/requisitionerServices";
import { getReviewers } from "@/services/userServices";
import { getAllOffices, Office } from "@/services/officeServices";
import { getAllCampusDirector } from "@/services/campusDirectorServices";
import AsyncSelect from "react-select/async";
import { Textarea } from "@/components/ui/textarea";
import { MessageDialog } from "../../shared/components/MessageDialog";

interface EditPRFormProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  pr_no: string;
}

type option = {
  value: string;
  label: string;
};

interface messageDialogProps {
  open: boolean;
  message: string;
  type: "success" | "error" | "info";
  title: string;
}

const EditPRForm: React.FC<EditPRFormProps> = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  pr_no,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messageDialog, setMessageDialog] = useState<messageDialogProps>({
    open: false,
    type: "success" as const,
    title: "",
    message: "",
  });

  const { isLoading: purchaseRequestLoading, data: purchase_request } =
    usePurchaseRequestList(pr_no!);

  const purchaseData = purchase_request?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<EditPRFormType>({
    resolver: zodResolver(EditPRFormSchema),
    defaultValues: {
      purpose: "",
      office: undefined,
      requisitioner: "",
      fund_cluster: "",
      reviewed_by: null,
      campus_director: "",
    },
  });

  useEffect(() => {
    if (purchaseData) {
      reset({
        purpose: purchaseData.purpose ?? "",
        office: purchaseData.office
          ? Number(purchaseData.office)
          : undefined,
        requisitioner:
          purchaseData.requisitioner_details?.requisition_id ?? "",
        fund_cluster: purchaseData.fund_cluster ?? "",
        reviewed_by:
          purchaseData.reviewed_by !== null &&
          purchaseData.reviewed_by !== undefined
            ? Number(purchaseData.reviewed_by)
            : null,
        campus_director: purchaseData.campus_director ?? "",
      });
    }
  }, [purchaseData, reset]);

  const { mutate } = useUpdatePurchaseRequest();

  const loadRequisitionerOptions = async (
    inputValue: string
  ): Promise<option[]> => {
    try {
      const requisitioners = await getAllRequisitioner();
      return (
        requisitioners.data
          ?.filter((requisitioner) => 
            requisitioner?.name?.toLowerCase().includes(inputValue.toLowerCase())
          )
          .map((requisitioner) => ({
            value: requisitioner.requisition_id,
            label: requisitioner.name || "Unknown", // Fallback if name is undefined
          })) || []
      );
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const loadOfficeOptions = async (
    inputValue: string
  ): Promise<option[]> => {
    try {
      const offices = await getAllOffices();

      return (
        offices.data
          ?.filter((office: Office) =>
            `${office.code} ${office.name} ${office.department}`
              .toLowerCase()
              .includes(inputValue.toLowerCase())
          )
          .map((office: Office) => ({
            value: String(office.id),
            label: `${office.code} - ${office.name}`,
          })) || []
      );
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const loadReviewerOptions = async (
    inputValue: string
  ): Promise<option[]> => {
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
            value: String(user.id),
            label: `${user.first_name} ${user.last_name}`,
          })) || []
      );
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  const loadCampusDirectorOptions = async (
        inputValue: string
      ): Promise<option[]> => {
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

  const handleCampusDirectorChange = (
    selectedOption: option | null
  ) => {
    setValue("campus_director", selectedOption?.value ?? "");
  };

  const handleRequisitionerChange = (selectedOption: option | null) => {
    setValue("requisitioner", selectedOption?.value ?? "");
  };

  const onSubmit = (data: EditPRFormType) => {
    setIsLoading(true);
    const result = EditPRFormSchema.safeParse(data);

    if (result.success) {
      mutate(
        { pr_no: pr_no, data: data },
        {
          onSuccess: (response) => {
            if (response.status === "success") {
              setIsLoading(false);
              setIsEditDialogOpen(false);
              reset();
              setMessageDialog({
                open: true,
                message: "Purchase Request edited successfully",
                type: "success",
                title: "Success",
              });
            } else {
              setIsLoading(false);
              setIsEditDialogOpen(false);
              reset();
              setMessageDialog({
                open: true,
                message: "Something went wrong, Please try again",
                type: "error",
                title: "Error",
              });
            }
          },
          onError: (error) => {
            setIsLoading(false);
            setIsEditDialogOpen(false);
            reset();
            setMessageDialog({
              open: true,
              message: error.message,
              type: "error",
              title: "Error",
            });
          },
        }
      );
    }
  };

  const renderField = (
    label: string,
    name: keyof EditPRFormType,
    component: React.ReactNode
  ) => (
    <div className="mb-4 text-gray-950">
      <Label>{label}</Label>
      {component}
      {errors[name] && (
        <span className="text-red-400 text-xs">{errors[name]?.message}</span>
      )}
    </div>
  );

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-full w-[40rem]">
          <ScrollArea className="h-[20rem] mb-8">
            <DialogHeader>
              <DialogTitle className="py-6">Edit Purchase Request</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {purchaseRequestLoading ? (
                <Loading />
              ) : (
                <form
                  onSubmit={handleSubmit((data) => onSubmit(data))}
                  className="border-none rounded"
                >
                  <div className="">
                    {renderField(
                      "Fund Source",
                      "fund_cluster",
                      <Input
                        type="text"
                        placeholder="Enter fund source"
                        {...register("fund_cluster")}
                      />
                    )}
                    
                    {renderField(
                      "Office",
                      "office",
                      <AsyncSelect
                        defaultOptions
                        loadOptions={loadOfficeOptions}
                        onChange={(option) => {
                          if (option?.value) {
                            setValue("office", Number(option.value));
                          }
                        }}
                        defaultValue={
                          purchaseData?.office_details
                            ? {
                                value: String(purchaseData.office_details.id),
                                label: `${purchaseData.office_details.code} - ${purchaseData.office_details.name}`,
                              }
                            : null
                        }
                        placeholder="Search for Office..."
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
                        defaultValue={{
                          value:
                            purchaseData?.requisitioner_details?.requisition_id ?? "",
                          label: purchaseData?.requisitioner_details?.name ?? "Select requisitioner",
                        }}
                        defaultOptions
                        loadOptions={loadRequisitionerOptions}
                        onChange={handleRequisitionerChange}
                        placeholder="Search for a Requisitioner..."
                        className="mb-4 text-sm"
                      />
                    )}

                    {renderField(
                      "Reviewed By",
                      "reviewed_by",
                      <AsyncSelect
                        defaultOptions
                        loadOptions={loadReviewerOptions}
                        onChange={(option) =>
                          setValue(
                            "reviewed_by",
                            option?.value ? Number(option.value) : null
                          )
                        }
                        defaultValue={
                          purchaseData?.reviewed_by_details
                            ? {
                                value: String(purchaseData.reviewed_by),
                                label: purchaseData.reviewed_by_details.name,
                              }
                            : null
                        }
                        placeholder="Search for Reviewer..."
                        className="text-sm"
                        isClearable
                      />
                    )}

                    {renderField(
                      "Campus Director",
                      "campus_director",
                      <AsyncSelect
                        defaultOptions
                        loadOptions={loadCampusDirectorOptions}
                        onChange={handleCampusDirectorChange}
                        defaultValue={
                          purchaseData?.campus_director_details
                            ? {
                                value: purchaseData.campus_director_details.cd_id,
                                label: purchaseData.campus_director_details.name,
                              }
                            : null
                        }
                        placeholder="Search for a Campus Director..."
                        className="text-sm"
                        isClearable
                      />
                    )}
                  </div>
                  <div className="mt-6 fixed bottom-6 right-6">
                    <Button
                      className="text-slate-950 bg-orange-200 hover:bg-orange-300 px-10"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </DialogDescription>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <MessageDialog
        message={messageDialog?.message}
        title={messageDialog?.title}
        type={messageDialog?.type}
        open={messageDialog?.open}
        onOpenChange={(open) => setMessageDialog((prev) => ({ ...prev, open }))}
      />
    </>
  );
};

export default EditPRForm;