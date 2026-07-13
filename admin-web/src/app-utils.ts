import { type AdminReport, type AdminUser } from "@bozar/shared-types";

export type ReportFilter = "all" | "pending" | "reviewed";
export type UserFilter = "all" | "active" | "blocked" | "suspended";

export function filterAdminReports(reports: AdminReport[], filter: ReportFilter) {
  return reports.filter((report) => {
    if (filter === "pending") return report.status === "PENDING";
    if (filter === "reviewed") return report.status === "REVIEWED";
    return true;
  });
}

export function filterAdminUsers(users: AdminUser[], filter: UserFilter, search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  return users.filter((user) => {
    const matchesSearch =
      !normalizedSearch ||
      [user.fullName, user.phone, user.email ?? "", user.locationName ?? ""].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );

    const matchesFilter = filter === "all" ? true : user.status.toLowerCase() === filter;

    return matchesSearch && matchesFilter;
  });
}
