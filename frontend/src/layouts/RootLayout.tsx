import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
export default function RootLayout() {
  return (
    <div className="layout-container">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
