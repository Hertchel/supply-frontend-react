import { useGetReviewers } from "@/services/userServices";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { UsersType } from "@/types/response/users";
import Loading from "../../../shared/components/Loading";

export default function ReviewersDataTable() {

  const { isLoading, error, data } = useGetReviewers();

  if (isLoading) return <Loading />;

  if (error) return <div>{error.message}</div>;

  const reviewersData: UsersType[] =
    data?.status === "success"
      ? data.data || []
      : [];

  const flattenedReviewerData = reviewersData.map((data) => ({
    ...data,
    fullname: `${data.first_name} ${data.last_name}`,
  }));

  return (
    <>
      <div className="hidden flex-col md:flex">

        <p className="mx-6 my-4 text-xl">
          All Reviewers
        </p>

        <DataTable
          data={flattenedReviewerData}
          columns={columns}
        />

      </div>
    </>
  );
}