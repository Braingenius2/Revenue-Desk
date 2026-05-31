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
  phone: string | null;
}

interface Job {
  id: string;
  title: string;
  description: string | null;
  status: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleYear: number | null;
  vehiclePlate: string | null;
  labourCost: number;
  partsCost: number;
  totalCost: number;
  dateReceived: string;
  dateDue: string | null;
  dateCompleted: string | null;
  dateDelivered: string | null;
  notes: string | null;
  customer: { name: string; phone: string | null };
  customerId: string;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending", color: "bg-warning" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-meta-5" },
  { value: "COMPLETED", label: "Completed", color: "bg-success" },
  { value: "PAID", label: "Paid", color: "bg-meta-3" },
  { value: "DELIVERED", label: "Delivered", color: "bg-primary" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-danger" },
];

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    customerId: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehiclePlate: "",
    labourCost: "",
    partsCost: "",
    dateDue: "",
    notes: "",
  });

  useEffect(() => {
    if (session) {
      fetchJobs();
      fetchCustomers();
    }
  }, [session]);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) setJobs(await res.json());
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (res.ok) setCustomers(await res.json());
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingJob ? `/api/jobs/${editingJob.id}` : "/api/jobs";
      const method = editingJob ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchJobs();
        closeModal();
      }
    } catch (err) {
      console.error("Error saving job:", err);
    }
  };

  const handleStatusUpdate = async (jobId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const openNewModal = () => {
    setEditingJob(null);
    setFormData({
      title: "", description: "", customerId: "",
      vehicleMake: "", vehicleModel: "", vehicleYear: "",
      vehiclePlate: "", labourCost: "", partsCost: "",
      dateDue: "", notes: "",
    });
    setShowModal(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description || "",
      customerId: job.customerId,
      vehicleMake: job.vehicleMake || "",
      vehicleModel: job.vehicleModel || "",
      vehicleYear: job.vehicleYear?.toString() || "",
      vehiclePlate: job.vehiclePlate || "",
      labourCost: job.labourCost.toString(),
      partsCost: job.partsCost.toString(),
      dateDue: job.dateDue ? job.dateDue.split("T")[0] : "",
      notes: job.notes || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingJob(null);
  };

  const getStatusInfo = (status: string) =>
    STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      (job.vehiclePlate || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL" || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Jobs" />

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterStatus(filterStatus === opt.value ? "ALL" : opt.value)}
            className={`rounded-lg px-3 py-2 text-center text-xs font-medium text-white transition-opacity hover:opacity-80 sm:text-sm ${
              opt.color
            } ${filterStatus === opt.value ? "ring-2 ring-offset-2 ring-black dark:ring-white" : ""}`}
          >
            <div>{opt.label}</div>
            <div className="mt-0.5 text-lg font-bold">
              {statusCounts[opt.value] || 0}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-4 py-4 dark:border-strokedark md:px-6 md:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-medium text-black dark:text-white">
              Jobs / Orders
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded border border-stroke bg-gray px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4 sm:w-48"
              />
              <button
                onClick={() => exportToCSV(
                  filteredJobs.map((j) => ({
                    Title: j.title,
                    Customer: j.customer.name,
                    Phone: j.customer.phone || "",
                    Vehicle: [j.vehicleMake, j.vehicleModel, j.vehicleYear]
                      .filter(Boolean).join(" "),
                    Plate: j.vehiclePlate || "",
                    Labour: formatNaira(j.labourCost),
                    Parts: formatNaira(j.partsCost),
                    Total: formatNaira(j.totalCost),
                    Status: getStatusInfo(j.status).label,
                    Received: formatDate(j.dateReceived),
                  })),
                  "jobs-export",
                )}
                className="rounded bg-body px-3 py-2 text-sm text-white hover:bg-opacity-90"
              >
                Export CSV
              </button>
              <button
                onClick={openNewModal}
                className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
              >
                + New Job
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center text-body dark:text-bodydark">
            {jobs.length === 0
              ? "No jobs yet. Create your first job!"
              : "No jobs match your search."}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="px-4 py-3 text-sm font-medium">Job</th>
                    <th className="px-4 py-3 text-sm font-medium">Customer</th>
                    <th className="px-4 py-3 text-sm font-medium">Vehicle</th>
                    <th className="px-4 py-3 text-sm font-medium">Amount</th>
                    <th className="px-4 py-3 text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-sm font-medium">Date</th>
                    <th className="px-4 py-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => {
                    const statusInfo = getStatusInfo(job.status);
                    return (
                      <tr
                        key={job.id}
                        className="border-b border-stroke dark:border-strokedark"
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {job.title}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>{job.customer.name}</div>
                          {job.customer.phone && (
                            <div className="text-xs text-body">{job.customer.phone}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {job.vehicleMake || job.vehicleModel ? (
                            <>
                              <div>{[job.vehicleMake, job.vehicleModel, job.vehicleYear].filter(Boolean).join(" ")}</div>
                              {job.vehiclePlate && <div className="text-xs text-body">{job.vehiclePlate}</div>}
                            </>
                          ) : (
                            <span className="text-bodydark2">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {formatNaira(job.totalCost)}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={job.status}
                            onChange={(e) => handleStatusUpdate(job.id, e.target.value)}
                            className={`rounded px-2 py-1 text-xs font-medium text-white ${statusInfo.color}`}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-body">
                          <div>{formatDate(job.dateReceived)}</div>
                          {job.dateDue && <div>Due: {formatDate(job.dateDue)}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(job)}
                              className="text-blue-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(job.id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-stroke md:hidden dark:divide-strokedark">
              {filteredJobs.map((job) => {
                const statusInfo = getStatusInfo(job.status);
                return (
                  <div key={job.id} className="space-y-2 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-body">{job.customer.name}</div>
                      </div>
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusUpdate(job.id, e.target.value)}
                        className={`rounded px-2 py-1 text-xs font-medium text-white ${statusInfo.color}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {(job.vehicleMake || job.vehiclePlate) && (
                      <div className="text-sm text-body">
                        {[job.vehicleMake, job.vehicleModel].filter(Boolean).join(" ")}
                        {job.vehiclePlate && ` · ${job.vehiclePlate}`}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{formatNaira(job.totalCost)}</span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(job)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              {editingJob ? "Edit Job" : "New Job"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">Job Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded border border-stroke bg-gray px-3 py-2 dark:border-strokedark dark:bg-meta-4"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">Customer *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full rounded border border-stroke bg-gray px-3 py-2 dark:border-strokedark dark:bg-meta-4"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full rounded border border-stroke bg-gray px-3 py-2 dark:border-strokedark dark:bg-meta-4"
                />
              </div>
              <div className="text-sm font-medium text-black dark:text-white">Vehicle Info</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-body">Make</label>
                  <input
                    type="text"
                    value={formData.vehicleMake}
                    onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                    placeholder="e.g. Toyota"
                    className="w-full rounded border border-stroke bg-gray px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-body">Model</label>
                  <input
                    type="text"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    placeholder="e.g. Camry"
                    className="w-full rounded border border-stroke bg-gray px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-body">Year</label>
                  <input
                    type="number"
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                    placeholder="2020"
                    className="w-full rounded border border-stroke bg-gray px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-body">Plate Number</label>
                  <input
                    type="text"
                    value={formData.vehiclePlate}
                    onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    placeholder="e.g. ABC-123XY"
                    className="w-full rounded border border-stroke bg-gray px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4"
                  />
                </div>
              </div>
              <div className="text-sm font-medium text-black dark:text-white">Pricing (₦)</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-body">Labour Cost</label>
                  <input
                    type="number"
                    value={formData.labourCost}
                    onChange={(e) => setFormData({ ...formData, labourCost: e.target.value })}
                    className="w-full rounded border border-stroke bg-gray px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-body">Parts Cost</label>
                  <input
                    type="number"
                    value={formData.partsCost}
                    onChange={(e) => setFormData({ ...formData, partsCost: e.target.value })}
                    className="w-full rounded border border-stroke bg-gray px-3 py-2 text-sm dark:border-strokedark dark:bg-meta-4"
                  />
                </div>
              </div>
              {formData.labourCost || formData.partsCost ? (
                <div className="text-right text-sm font-bold text-black dark:text-white">
                  Total: {formatNaira(
                    Number(formData.labourCost || 0) + Number(formData.partsCost || 0)
                  )}
                </div>
              ) : null}
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">Due Date</label>
                <input
                  type="date"
                  value={formData.dateDue}
                  onChange={(e) => setFormData({ ...formData, dateDue: e.target.value })}
                  className="w-full rounded border border-stroke bg-gray px-3 py-2 dark:border-strokedark dark:bg-meta-4"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-black dark:text-white">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded border border-stroke bg-gray px-3 py-2 dark:border-strokedark dark:bg-meta-4"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded border border-stroke px-4 py-2 text-sm hover:bg-gray dark:border-strokedark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
                >
                  {editingJob ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DefaultLayout>
  );
}
