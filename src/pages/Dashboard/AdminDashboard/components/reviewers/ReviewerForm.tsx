import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { useMemo } from "react";

import {
  useAddReviewer,
  useGetReviewers,
} from "@/services/userServices";

import { UsersType } from "@/types/response/users";

import { columns } from "./columns";
import { DataTable } from "./data-table";

import Loading from "../../../shared/components/Loading";

export default function ReviewerForm() {

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<UsersType>();

  const { data, isLoading } = useGetReviewers();

  const reviewersData = useMemo(() => {

    return Array.isArray(data?.data)
      ? data.data
      : [];

  }, [data?.data]);

  const { mutate, isPending } =
    useAddReviewer();

  if (isLoading) return <Loading />;

  const onSubmit = async (
    data: UsersType
  ) => {

    mutate({

      ...data,

      is_reviewer: true,

    });

    reset();

  };

  const flattenedReviewerData =
    reviewersData.map((data) => ({
      ...data,
      fullname:
        `${data.first_name} ${data.last_name}`,
    }));

  return (
    <>

      <form
        className="m-6 p-6 bg-slate-100 rounded"
        onSubmit={handleSubmit(onSubmit)}
      >

        <div className="grid grid-cols-3 gap-2 mb-4">

          <div>

            <Label>
              Employee ID
            </Label>

            <Input
              {...register("employee_id")}
            />

          </div>

          <div>

            <Label>
              First Name
            </Label>

            <Input
              {...register("first_name")}
            />

          </div>

          <div>

            <Label>
              Last Name
            </Label>

            <Input
              {...register("last_name")}
            />

          </div>

          <div>

            <Label>
              Email
            </Label>

            <Input
              {...register("email")}
            />

          </div>

        </div>

        <Button
          type="submit"
          className="bg-orange-200 hover:bg-orange-300 text-slate-950"
        >

          {isPending
            ? <Loader2 className="animate-spin" />
            : "Add Reviewer"}

        </Button>

      </form>

      <DataTable
        data={flattenedReviewerData}
        columns={columns}
      />

    </>
  );

}