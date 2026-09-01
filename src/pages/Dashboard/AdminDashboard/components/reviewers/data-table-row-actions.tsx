import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TooltipProvider,

} from "@/components/ui/tooltip";
import { UsersType } from "@/types/response/users";
import { Loader2 } from "lucide-react";
import {
  useActivateUser,
  useDeleteReviewer,
  useUpdateReviewer
} from "@/services/userServices";
import { RequisitionerType } from "@/types/request/requisitioner";

interface DataTableRowActionsProps {
  id: string | undefined;
  _data: UsersType | RequisitionerType;
}

export const DataTableRowActions = ({
  id,
  _data,
}: DataTableRowActionsProps) => {

  const buttonLabel = (_data as UsersType).is_active
    ? "Deactivate"
    : "Activate";

  const { mutate, isPending } = useActivateUser(buttonLabel);
  const { mutate: deleteMutate } = useDeleteReviewer();
  const { mutate: updateReviewer, isPending: isUpdating } =
  useUpdateReviewer();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
  } = useForm<UsersType>({
    defaultValues: {
      employee_id: (_data as UsersType).employee_id,
      first_name: (_data as UsersType).first_name,
      last_name: (_data as UsersType).last_name,
      email: (_data as UsersType).email,
      designation: (_data as UsersType).designation ?? "",
    },
  });

  const handleActivateUser = () => {
    mutate({ id: id!, status: !(_data as UsersType).is_active });
  };
  const handleDeleteUser = () => {

  deleteMutate(id!);

};

  return (
    <>
      <TooltipProvider delayDuration={100} skipDelayDuration={200}>
        <div className="flex gap-4 ">
          <div
            className={`flex ${
              (_data as UsersType).is_active
                ? "bg-red-300 hover:bg-red-300"
                : "bg-green-300 hover:bg-green-300"
            }  rounded-full items-center`}
          >
            <Button
              onClick={handleActivateUser}
              className={`${
                (_data as UsersType).is_active
                  ? "bg-red-300 hover:bg-red-300"
                  : "bg-green-300 hover:bg-green-300"
              }  text-slate-950 text-xs`}
            >
              {isPending ? <Loader2 className="animate-spin" /> : buttonLabel}
            </Button>
            <Button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="bg-blue-300 hover:bg-blue-400 text-slate-950 text-xs rounded-full"
            >
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white text-xs rounded-full"
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently
                    delete the user account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteUser}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </TooltipProvider>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Edit Reviewer
            </DialogTitle>
            <DialogDescription>
              Update the reviewer information and designation.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleEditSubmit((data) => {
              updateReviewer(
                {
                  id: id!,
                  data,
                },
                {
                  onSuccess: () => {
                    setIsEditOpen(false);
                  },
                }
              );
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">

              <div>
                <Label>Employee ID</Label>
                <Input
                  {...registerEdit("employee_id")}
                />
              </div>

              <div>
                <Label>First Name</Label>
                <Input
                  {...registerEdit("first_name")}
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  {...registerEdit("last_name")}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  {...registerEdit("email")}
                />
              </div>

              <div className="col-span-2">
                <Label>Designation</Label>
                <Input
                  {...registerEdit("designation")}
                  placeholder="Enter designation"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  resetEdit();
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-orange-200 hover:bg-orange-300 text-slate-950"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
