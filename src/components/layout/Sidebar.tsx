"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "grid_view" },
  { name: "Carrier Hub", href: "/dashboard/carriers", icon: "hub" },
  { name: "Quotes", href: "/dashboard/quotes", icon: "description" },
  { name: "Shipments", href: "/dashboard/shipments", icon: "inventory_2" },
  { name: "Messages", href: "/dashboard/messages", icon: "mail" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-[#137fec] size-10 rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined">anchor</span>
        </div>
        <div>
          <h1 className="text-slate-900 dark:text-white font-bold text-sm leading-tight">
            Arslan Integrated
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Solutions Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                active
                  ? "bg-[#137fec]/10 text-[#137fec]"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}

        {/* Settings at bottom */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              isActive("/dashboard/settings")
                ? "bg-[#137fec]/10 text-[#137fec]"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
