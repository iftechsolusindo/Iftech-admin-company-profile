import Sidebar from "./sidebar";
import Header from "./header";
import { Toaster } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        <Header />

        <main className="p-8">
          {children}
        </main>
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3000}
      />
    </div>
  );
}