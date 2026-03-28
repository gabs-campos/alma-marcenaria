import { AdminLoginClient } from "@/components/admin/AdminLoginClient";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return <AdminLoginClient nextPath={searchParams.next} />;
}

