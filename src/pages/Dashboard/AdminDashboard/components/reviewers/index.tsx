import ReviewerForm from "./ReviewerForm";
import AdminDashboardLayout from "../Layout/AdminDashboardLayout";

export default function Reviewers() {

  return (

    <AdminDashboardLayout>

      <div className="p-4">

        <ReviewerForm />

      </div>

    </AdminDashboardLayout>

  );

}