import { useGetAllRecentActivities } from "@/services/RecentActivities";
import { useMemo } from "react";
import { TimeAgo } from "./GetTimeAgo";
import { extractModelName } from "@/services/extractModelName";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useGetUserInformation } from "@/services/userProfile";
import Loading from "./Loading";

export const RecentActivities = () => {
  const { userRole, trimmedUserRole } =
    useGetUserInformation();

  const { data, isLoading } =
    useGetAllRecentActivities(userRole);

  const recentActivites = useMemo(() => {
    const activities = Array.isArray(data?.data)
      ? data.data
      : [];

    if (!userRole) {
      return [];
    }

    const role = userRole.trim().toLowerCase();
    console.log("RECENT ACTIVITY ROLE:", role);
    console.log("RECENT ACTIVITY API DATA:", activities);

    return activities.filter((activity) => {
      const model = (extractModelName(activity.content_type) ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
      const activityUserRole = String(activity.user_role ?? "").replace(/[\[\]'"]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
      const activityType = String(activity.activity_type ?? "").trim().toLowerCase();
      console.log("ADMIN ACTIVITY CHECK:", {
        user: activity.user,
        user_role: activity.user_role,
        activity_type: activity.activity_type,
        content_type: activity.content_type,
        extracted_model: model,
        normalized_activity_type: activityType,
      });

      if (activityUserRole === "admin") {
        console.log("ADMIN RECORD:", {
          id: activity.id,
          user: activity.user,
          user_role: activity.user_role,
          activity_type: activity.activity_type,
          content_type: activity.content_type,
          model: model,
          activityType: activityType,
        });
      }

      switch (role) {
        case "supply officer":
        case "supply":
          return (
            activityUserRole === "supply officer" &&
            [
              "purchase_request",
              "purchaserequest",
              "purchase_order",
              "purchaseorder",
              "item",
            ].includes(model)
          );

        case "bac officer":
        case "bac":
          return (
            activityUserRole === "bac officer" &&
            [
              "request_for_quotation",
              "requestforquotation",
              "abstract_of_quotation",
              "abstractofquotation",
            ].includes(model)
          );

        case "requisitioner":
          return (
            activityUserRole === "requisitioner" &&
            [
              "purchase_request",
              "purchaserequest",
            ].includes(model)
          );

        case "admin":
          return (
            model === "customuser" &&
            ["added", "updated", "deleted"].includes(activityType)
          );

        default:
          return false;
      }
    });
  }, [data, userRole]);

  if (isLoading) {
    return <Loading />;
  }

  const getActivityText = (activity: any) => {
    const model = (
      extractModelName(activity.content_type) ?? ""
    )
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

    const activityType = String(activity.activity_type ?? "")
      .trim()
      .toLowerCase();

    if (model === "customuser") {
      switch (activityType) {
        case "added":
          return "Registered an account";
        case "updated":
          return "Updated an account";
        case "deleted":
          return "Deleted an account";
      }
    }

    return `${activity.activity_type} ${extractModelName(
      activity.content_type
    )}`;
  };

  return (
    <div>
      {recentActivites.length > 0 ? (
        recentActivites.map((recent, index) => (
          <div
            key={index}
            className="mb-4 shadow p-4 flex gap-2 items-center rounded-md"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src="/avatars/01.png"
                alt=""
              />

              <AvatarFallback className="bg-gradient-to-r from-orange-200 to-orange-300 text-base">
                {trimmedUserRole(recent.user_role)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 flex flex-col items-center">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium leading-none mr-1">
                  {recent.user}
                </span>

                <span
                  className={`${
                    recent.activity_type === "Deleted"
                      ? "text-red-400"
                      : "text-green-400"
                  } mr-1`}
                >
                  {getActivityText(recent)}
                </span>

                <span className="block text-xs text-muted-foreground pt-1">
                  {TimeAgo(recent.timestamp)}
                </span>
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="w-full flex justify-center">
          No data found
        </p>
      )}
    </div>
  );
};