import {
  useAuthenticatedRequisitionerDashboard
} from "@/services/requisitionerServices";
import Layout from "./components/Layout/ReqDashboardLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import EditRequisitionerForm from "@/pages/Dashboard/AdminDashboard/components/EditRequisitionerForm";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";


const RequisitionerDashboard = () => {

  const {
  data,
  isLoading,  
  error,
} = useAuthenticatedRequisitionerDashboard();

const dashboardData = data?.data;
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [hasShownProfileModal, setHasShownProfileModal] = useState(false);
useEffect(() => {
    if (!dashboardData?.requisitioner || hasShownProfileModal) return;

    const {
      department,
      designation,
    } = dashboardData.requisitioner;

    const isProfileIncomplete =
      !department ||
      !designation;

    if (isProfileIncomplete) {
      setIsEditDialogOpen(true);
      setHasShownProfileModal(true);
    }
  }, [dashboardData, hasShownProfileModal]);


  if (isLoading) {

    return (

      <div className="min-h-screen flex justify-center items-center">
        Loading...
      </div>

    );

  }
  if (error) {
  return (
    <div className="min-h-screen flex justify-center items-center">
      Failed to load dashboard
    </div>
  );
}

  return (
  <Layout>
    <ScrollArea className="w-full">

      <main className="flex-grow">

  <div className="max-w-7xl mx-auto space-y-6">

    {/* HEADER */}

    <div
      className="
        bg-white
        rounded-2xl
        shadow-md
        border-2
        p-6
        flex
        flex-col
        md:flex-row
        items-center
        justify-between
        gap-4
      "
      style={{
        borderColor: "rgb(254 215 170)",
      }}
    >

      {/* LEFT */}

      <div className="flex items-center gap-4">

        <img
          src="/CTU_new_logotransparent.svg"
          alt="CTU AC Logo"
          className="w-20 h-20 object-contain"
        />

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Requisitioner Dashboard
          </h1>

          <p className="text-gray-600 mt-1">
            {dashboardData?.requisitioner?.name}
          </p>

          <p className="text-sm text-gray-400">
            {dashboardData?.requisitioner?.department}
          </p>

        </div>

      </div>

      {/* RIGHT */}

      <div
        className="
          px-5
          py-3
          rounded-xl
          text-center
        "
        style={{
          backgroundColor: "rgb(254 215 170)",
        }}
      >

        <p className="text-sm text-gray-600">
          Cebu Technological University
        </p>

        <h2 className="font-bold text-lg text-gray-800">
          Argao Campus
        </h2>

      </div>
      <Button
        onClick={() => setIsEditDialogOpen(true)}
        className="bg-orange-300 hover:bg-orange-500"
      >
        Edit Profile
      </Button>

    </div>

    {/* PURCHASE REQUESTS */}

    <div className="grid gap-6">

      {dashboardData?.purchase_requests?.map((pr: any) => (

        <div
          key={pr.pr_no}
          className="
            rounded-2xl
            shadow-md
            border-2
            p-6
            space-y-6
            bg-white
          "
          style={{
            borderColor: "rgb(254 215 170)",
          }}
        >

          {/* TOP */}

          <div className="flex flex-col md:flex-row justify-between gap-4">

            <div>

              <h1 className="text-2xl font-bold text-gray-800">
                PR NO: {pr.pr_no}
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Purchase Request Tracking
              </p>

            </div>

            <div>

              <span
                className="
                  px-5
                  py-2
                  rounded-full
                  text-sm
                  font-semibold
                  shadow-sm
                "
                style={{
                  backgroundColor: "rgb(254 215 170)",
                  color: "#9A3412",
                }}
              >
                {pr.status}
              </span>

            </div>

          </div>

          {/* TIMELINE */}

          <div>

            <h2 className="font-semibold text-gray-700 mb-3">
              Procurement Progress
            </h2>

            <div className="flex flex-wrap gap-3">

              {[
                "Submitted",
                "Approved",
                "RFQ",
                "AOQ",
                "Bidder Selected",
                "PO Created",
                "Delivered",
              ].map((step) => (

                <div
                  key={step}
                  className="
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-medium
                    border
                    bg-orange-50
                    text-orange-700
                  "
                >
                  {step}
                </div>

              ))}

            </div>

          </div>

          {/* DETAILS */}

          <div className="grid md:grid-cols-2 gap-6">

            {/* SUPPLIER */}

            <div
              className="
                rounded-xl
                p-4
                border
                bg-orange-50
              "
            >

              <h2 className="font-semibold text-gray-700 mb-1">
                Supplier
              </h2>

              <p className="text-gray-600">
                {pr.supplier_name || "No supplier assigned yet"}
              </p>

            </div>

            {/* WINNING BIDDER */}

            <div
              className="
                rounded-xl
                p-4
                border
                bg-orange-50
              "
            >

              <h2 className="font-semibold text-gray-700 mb-1">
                Winning Bidder
              </h2>

              <p className="text-gray-600">
                {pr.winning_bidder || "No winning bidder yet"}
              </p>

            </div>

          </div>

          {/* ITEMS */}

          <div>

            <h2 className="font-semibold text-gray-700 mb-4">
              Requested Items
            </h2>

            {pr.items?.length > 0 ? (

              <div className="grid gap-3">

                {pr.items.map((item: any) => (

                  <div
                    key={item.item_no}
                    className="
                      rounded-xl
                      border
                      p-4
                      flex
                      justify-between
                      items-center
                      bg-orange-50
                    "
                  >

                    <div>

                      <p className="font-semibold text-gray-800">
                        {item.item_description}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Quantity: {item.quantity}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-sm text-gray-500">
                        Total Cost
                      </p>

                      <p className="font-bold text-orange-700">
                        ₱ {item.total_cost}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            ) : (

              <div
                className="
                  border
                  rounded-xl
                  p-6
                  text-center
                  text-gray-500
                  bg-orange-50
                "
              >
                No items available
              </div>

            )}

          </div>

        </div>

      ))}

    </div>

  </div>

      </main>

        </ScrollArea>

    <EditRequisitionerForm
      isEditDialogOpen={isEditDialogOpen}
      setIsEditDialogOpen={setIsEditDialogOpen}
      requisition_id={dashboardData?.requisitioner?.requisition_id}
    />

  </Layout>
);
};
export default RequisitionerDashboard;