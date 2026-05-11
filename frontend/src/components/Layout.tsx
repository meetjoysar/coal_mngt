import {
  Boxes,
  CirclePlus,
  ClipboardList,
  Factory,
  LayoutDashboard,
  Menu,
  Plus,
  Route,
  LogOut,
  BarChart3,
  Truck,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const adminNavItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/transporters", label: "Transporters", icon: Route },
  { to: "/coal-sizes", label: "Coal Sizes", icon: Boxes },
  { to: "/purchase-orders/create", label: "Create PO", icon: CirclePlus },
  { to: "/purchase-orders", label: "Existing POs", icon: ClipboardList },
  { to: "/dispatches/new", label: "Add Dispatch", icon: Plus }
];

const viewerNavItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/purchase-orders", label: "All POs", icon: ClipboardList },
  { to: "/dispatches", label: "Dispatches", icon: Truck },
  { to: "/reports", label: "Reports", icon: BarChart3 }
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navItems = isAdmin ? adminNavItems : viewerNavItems;

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-smoke text-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-coal text-white">
              <Factory size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Gokul Fuel Chem</p>
              <p className="text-xs text-slate-500">Coal PO Management</p>
            </div>
          </div>
          <button
            className="grid size-9 place-items-center rounded-md border border-slate-200 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-orange-50 text-ember"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-3 lg:hidden">
          <button className="btn-secondary w-full" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {open && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <button
            className="grid size-10 place-items-center rounded-md border border-slate-200 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <div className="ml-auto flex min-w-0 items-center gap-2 text-sm text-slate-500 md:gap-3">
            <span className="hidden max-w-36 truncate sm:inline">{user?.name}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">
              {user?.role}
            </span>
            <span className="hidden lg:inline">Backend</span>
            <span className="hidden rounded-md bg-emerald-50 px-2 py-1 font-semibold text-mint md:inline">
              localhost:4010
            </span>
            <button className="btn-secondary hidden h-9 px-3 sm:inline-flex" onClick={logout}>
              <LogOut size={16} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1360px] min-w-0 px-3 py-4 sm:px-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
