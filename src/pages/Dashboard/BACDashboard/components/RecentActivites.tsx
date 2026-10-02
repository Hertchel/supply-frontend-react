import { useGetAllRecentActivities } from "@/services/RecentActivities";
import { useGetUserInformation } from "@/services/userProfile";
import { useMemo } from "react";

export const RecentActivites = () => {
  const { userRole } = useGetUserInformation();

  const { data } =
    useGetAllRecentActivities(userRole);

  const recentActivites = useMemo(() => {
    const activities = Array.isArray(data?.data)
      ? data.data
      : [];

    if (!userRole) {
      return [];
    }

    const role = userRole.trim().toLowerCase();

    if (
      role !== "bac officer" &&
      role !== "bac"
    ) {
      return [];
    }

    const getModelName = (contentType: string = "") => {
      return (
        contentType
          .split("|")
          .pop()
          ?.trim()
          .toLowerCase()
          .replace(/\s+/g, "_") || ""
      );
    };

    return activities.filter((activity) => {
      const model = getModelName(activity.content_type);

      return [
        "request_for_quotation",
        "requestforquotation",
        "abstract_of_quotation",
        "abstractofquotation",
      ].includes(model);
    });
  }, [data, userRole]);

  return (
    <div>
      {recentActivites.length > 0 ? (
        recentActivites.map((recent, index) => (
          <div key={index}>
            <p className="text-xl">
              {recent.user}
            </p>

            <p className="text-xl">
              {recent.activity_type}{" "}
              {recent.content_type}
            </p>

            <p className="text-xl">
              {recent.timestamp}
            </p>
          </div>
        ))
      ) : (
        <p>No data found</p>
      )}
    </div>
  );
};