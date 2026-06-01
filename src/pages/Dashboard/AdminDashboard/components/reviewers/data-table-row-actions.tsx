import { Button } from "@/components/ui/button";
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
import {
  TooltipProvider,

} from "@/components/ui/tooltip";
import { UsersType } from "@/types/response/users";
import { Loader2 } from "lucide-react";
import {
  useActivateUser,
  useDeleteReviewer,
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
    </>
  );
};
