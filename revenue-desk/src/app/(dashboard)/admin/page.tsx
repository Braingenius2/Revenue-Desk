"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getRoleBadgeColor, roleLabels } from "@/lib/roleUtils";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  workspace: {
    id: string;
    name: string;
  } | null;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        fetchUsers();
        setEditingUser(null);
      } else {
        alert("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user role");
    }
  };

  if (status === "loading" || loading) {
    return (
      <DefaultLayout>
        <Breadcrumb pageName="Admin Settings" />
        <div className="flex items-center justify-center p-8">
          <p>Loading...</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Admin Settings" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            User Management
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Manage user roles and permissions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 dark:bg-meta-4">
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Workspace</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-stroke dark:border-strokedark"
                >
                  <td className="px-4 py-3 text-sm">
                    {user.name || "No name"}
                  </td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {user.workspace?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {editingUser === user.id ? (
                      <select
                        defaultValue={user.role}
                        onChange={(e) => e.target.value}
                        onBlur={(e) => updateUserRole(user.id, e.target.value)}
                        className="rounded border border-stroke bg-gray px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4"
                        autoFocus
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="OWNER">Owner</option>
                      </select>
                    ) : (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          getRoleBadgeColor(user.role) || "bg-gray-100"
                        }`}
                      >
                        {roleLabels[user.role] || user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditingUser(user.id)}
                      className="text-blue-600 hover:underline"
                    >
                      {editingUser === user.id ? "Cancel" : "Edit Role"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold">Role Permissions</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              User
            </span>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Can manage own workspace leads and customers</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
              Owner
            </span>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                Business owner - full access to their workspace, can invite team
                members
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
              Admin
            </span>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                System administrator - full access to all users and workspaces
              </p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}