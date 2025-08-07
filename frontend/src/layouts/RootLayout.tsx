import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div>
      <header>Header or Navbar</header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
