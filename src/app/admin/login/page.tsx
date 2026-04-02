import { AdminLoginClient } from "@/components/admin/AdminLoginClient";

type Props = {
  searchParams: Promise<{ next?: string }> | { next?: string };
};

export default async function AdminLoginPage({ searchParams }: Props) {
  const resolved =
    searchParams instanceof Promise ? await searchParams : searchParams;
  return <AdminLoginClient nextPath={resolved.next} />;
}
