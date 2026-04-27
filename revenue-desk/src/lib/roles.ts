import { Session } from "next-auth";

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

export function isOwner(session: Session | null): boolean {
  return session?.user?.role === "OWNER";
}

export function hasAccess(session: Session | null, workspaceId?: string): boolean {
  if (!session) return false;
  if (isAdmin(session)) return true;
  if (workspaceId) {
    return session.user.workspaceId === workspaceId;
  }
  return true;
}

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  OWNER: "OWNER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];