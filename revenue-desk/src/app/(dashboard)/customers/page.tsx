"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { formatNaira } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { exportToCSV } from "@/lib/export";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  totalSpent: number;
  totalOrders: number;
  notes: string | null;
  createdAt: string;
}

export default function CustomersPage() {
  const { data: session } = useSession();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (session) fetchCustomers();
  }, [session]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) setCustomers(await res.json());
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchCustomers();
        setShowModal(false);
        setEditingCustomer(null);
        setFormData({ name: "", email: "", phone: "", address: "", notes: "" });
      }
    } catch (err) {
      console.error("Error saving customer:", err);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      notes: customer.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  const openNewModal = () => {
    setEditingCustomer(null);
    setFormData({ name: "", email: "", phone: "", address: "", notes: "" });
    setShowModal(true);
  };

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Customers" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-4 py-4 dark:border-strokedark md:px-6 md:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-medium text-black dark:text-white">
              Customers
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-stroke bg-gray px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4 sm:w-48"
              />
              <button
                onClick={() =>
                  exportToCSV(
                    filtered.map((c) => ({
                      Name: c.name,
                      Email: c.email || "",
                      Phone: c.phone || "",
                      Address: c.address || "",
                      "Total Spent": formatNaira(c.totalSpent),
                      Orders: c.totalOrders.toString(),
                      Notes: c.notes || "",
                    })),
                    "customers-export",
                  )
                }
                className="rounded bg-body px-3 py-2 text-sm text-white hover:bg-opacity-90"
              >
                Export CSV
              </button>
              <button
                onClick={openNewModal}
                className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
              >
                + Add Customer
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-body dark:text-bodydark">
            {customers.length === 0
              ? "No customers yet. Add your first customer!"
              : "No customers match your search."}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="px-4 py-3 text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-sm font-medium">Phone</th>
                    <th className="px-4 py-3 text-sm font-medium">Total Spent</th>
                    <th className="px-4 py-3 text-sm font-medium">Orders</th>
                    <th className="px-4 py-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-stroke dark:border-strokedark"
                    >
                      <td className="px-4 py-3 text-sm">
                        <div>{customer.name}</div>
                        {customer.email && (
                          <div className="text-xs text-body">{customer.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {customer.phone || <span className="text-bodydark2">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatNaira(customer.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-sm">{customer.totalOrders}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-stroke md:hidden dark:divide-strokedark">
              {filtered.map((customer) => (
                <div key={customer.id} className="space-y-1.5 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      {customer.email && (
                        <div className="text-xs text-body">{customer.email}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNaira(customer.totalSpent)}</div>
                      <div className="text-xs text-body">{customer.totalOrders} orders</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{customer.phone || <span className="text-bodydark2">No phone</span>}</span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded border border-stroke bg-gray px-3 py-2 dark:border-strokedark dark:bg-meta-4"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded border border-stroke bg-gray px-3 py-2 dark:border-strokedark dark:bg-meta-4"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded border border-stroke bg-gray px-3 py-2 dark:border-strokedark dark:bg-meta-4"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded border border-stroke bg-gray px-3 py-2 dark:border-strokedark dark:bg-meta-4"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded border border-stroke bg-gray px-3 py-2 dark:border-strokedark dark:bg-meta-4"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingCustomer(null); }}
                  className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray dark:border-strokedark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
                >
                  {editingCustomer ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}
