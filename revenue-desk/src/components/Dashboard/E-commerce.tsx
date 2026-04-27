"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import CardDataStats from "../CardDataStats";

interface Stats {
  leadsCount: number;
  customersCount: number;
  newLeadsCount: number;
  wonLeadsCount: number;
}

const ECommerce: React.FC = () => {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Total Leads" total={stats?.leadsCount?.toString() || "0"} rate="track your leads" levelUp>
          <svg className="fill-primary dark:fill-white" width="22" height="16" viewBox="0 0 22 16" fill="none">
            <path d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z" fill=""/>
          </svg>
        </CardDataStats>
        <CardDataStats title="Total Customers" total={stats?.customersCount?.toString() || "0"} rate="your paying clients" levelUp>
          <svg className="fill-primary dark:fill-white" width="20" height="22" viewBox="0 0 20 22" fill="none">
            <path d="M10 10.9219C8.38438 10.9219 7.07812 9.61562 7.07812 8C7.07812 6.38438 8.38438 5.07812 10 5.07812C11.6156 5.07812 12.9219 6.38438 12.9219 8C12.9219 9.61562 11.6156 10.9219 10 10.9219ZM10 6.625C9.24375 6.625 8.625 7.24375 8.625 8C8.625 8.75625 9.24375 9.375 10 9.375C10.7563 9.375 11.375 8.75625 11.375 8C11.375 7.24375 10.7563 6.625 10 6.625Z" fill=""/>
            <path d="M18 16.5H14.5V14C14.5 11.5 12.5 9.5 10 9.5C7.5 9.5 5.5 11.5 5.5 14V16.5H2C1.45 16.5 1 17 1 17.5C1 18 1.45 18.5 2 18.5H18C18.55 18.5 19 18 19 17.5C19 17 18.55 16.5 18 16.5Z" fill=""/>
          </svg>
        </CardDataStats>
        <CardDataStats title="New Leads" total={stats?.newLeadsCount?.toString() || "0"} rate="needs follow-up" levelUp>
          <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 0C4.95 0 0 4.95 0 11C0 17.05 4.95 22 11 22C17.05 22 22 17.05 22 11C22 4.95 17.05 0 11 0ZM11 19.8C6.05 19.8 2.2 15.95 2.2 11C2.2 6.05 6.05 2.2 11 2.2C15.95 2.2 19.8 6.05 19.8 11C19.8 15.95 15.95 19.8 11 19.8ZM12.1 7H9.9V12.1C9.9 12.75 9.35 13.2 8.8 13.2C8.25 13.2 7.7 12.75 7.7 12.1V7H5.5C4.95 7 4.5 6.55 4.5 6C4.5 5.45 4.95 5 5.5 5H7.7V2.9C7.7 2.25 8.25 1.8 8.8 1.8C9.35 1.8 9.9 2.25 9.9 2.9V5H12.1C12.65 5 13.1 5.45 13.1 6C13.1 6.55 12.65 7 12.1 7Z" fill=""/>
          </svg>
        </CardDataStats>
        <CardDataStats title="Won Leads" total={stats?.wonLeadsCount?.toString() || "0"} rate="converted to customers" levelUp>
          <svg className="fill-primary dark:fill-white" width="22" height="18" viewBox="0 0 22 18" fill="none">
            <path d="M11 0C4.95 0 0 4.95 0 11C0 17.05 4.95 22 11 22C17.05 22 22 17.05 22 11C22 4.95 17.05 0 11 0ZM9 15.4L4.6 11L5.6 10L9 13.4L16.4 6L17.4 7L9 15.4Z" fill=""/>
          </svg>
        </CardDataStats>
      </div>

      <div className="mt-8 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <a href="/leads" className="flex items-center gap-4 rounded-lg border border-stroke p-4 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4">
            <div className="rounded-full bg-primary/10 p-3">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Add New Lead</h4>
              <p className="text-sm text-gray-500">Track a potential customer</p>
            </div>
          </a>
          <a href="/customers" className="flex items-center gap-4 rounded-lg border border-stroke p-4 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">Add Customer</h4>
              <p className="text-sm text-gray-500">Record a paying customer</p>
            </div>
          </a>
        </div>
      </div>

      <div className="mt-8">
        <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h3 className="mb-4 text-lg font-semibold">Getting Started</h3>
          <ol className="list-inside list-decimal space-y-2 text-gray-600 dark:text-gray-400">
            <li>Add your first lead by clicking the Leads menu</li>
            <li>Track lead status as you contact them</li>
            <li>Convert winning leads to customers</li>
            <li>View your business metrics on this dashboard</li>
          </ol>
        </div>
      </div>
    </>
  );
};

export default ECommerce;