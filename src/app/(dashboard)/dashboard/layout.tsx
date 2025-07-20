import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "./components/dashboard-sidebar";
import { SiteHeader } from "./components/dashboard-site-header";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider 
        className="flex flex-col"
        style={{
          "--sidebar-width": "16rem",
          "--sidebar-width-mobile": "20rem",
        }}
      >
        <SiteHeader />
        <div className="flex flex-1">
          <DashboardSidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
