import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!isLoginPage && <Navbar />}

      <main className="bg-slate-100 min-h-screen overflow-x-hidden">{children}</main>
    </>
  );
};

export default Layout;
