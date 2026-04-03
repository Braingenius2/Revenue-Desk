import ECommerce from "@/components/Dashboard/E-commerce";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Revenue Desk",
  description: "Your business overview at a glance",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <ECommerce />
      </DefaultLayout>
    </>
  );
}
