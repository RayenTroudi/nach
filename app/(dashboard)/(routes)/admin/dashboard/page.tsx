"use server";
import { redirect } from "next/navigation";

const AdminDashboardPage = async () => {
  // Redirect to payment proofs page as the default admin page
  redirect("/admin/payment-proofs");
};

export default AdminDashboardPage;
