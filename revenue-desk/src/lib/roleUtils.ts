export const roleLabels: Record<string, string> = {
  USER: "User",
  ADMIN: "Administrator",
  OWNER: "Business Owner",
};

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-800";
    case "OWNER":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
}