import Navbar from "../components/Navbar/Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Navbar />

      <main className="bg-slate-100 min-h-screen">{children}</main>
    </>
  );
};

export default Layout;
