import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "./components/navigation/dashboard-sidebar";
import { SiteHeader } from "./components/navigation/dashboard-site-header";
import { EmailVerifyBannerWrapper } from "../components/email-verify-banner-wrapper";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <div className="scroll-top-anchor" />
      <EmailVerifyBannerWrapper />
      <div
        className="[--header-height:calc(--spacing(14))]"
        style={{ paddingTop: "var(--banner-height, 0px)" }}
      >
        <SidebarProvider
          className="flex flex-col"
          style={{
            "--sidebar-width": "15rem",
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
    </>
  );
};

export default Layout;
