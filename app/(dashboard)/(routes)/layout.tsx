import Navbar from "./_components/navbar";
import Sidebar from "./_components/sidebar";

type Props = {
  children: React.ReactNode;
};
function DashboardLayout({children}: Props) {
  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="w-56 h-full hidden md:flex flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="md:pl-56 h-full pt-[80px]">{children}</main>
    </div>
  );
}

export default DashboardLayout;