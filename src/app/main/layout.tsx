import AdminLayout from "../components/adminlayout";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}