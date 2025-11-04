"use server";
import { redirect } from "next/navigation";

const AdminDashboardPage = async () => {
  // Redirect to categories page as the default admin page
  redirect("/admin/categories");
};

export default AdminDashboardPage;
