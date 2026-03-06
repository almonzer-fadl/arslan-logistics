"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "grid_view" },
  { name: "Carrier Hub", href: "/dashboard/carriers", icon: "hub" },
  { name: "Quotes", href: "/dashboard/quotes", icon: "description" },
  { name: "Shipments", href: "/dashboard/shipments", icon: "inventory_2" },
  { name: "Analytics", href: "/dashboard/analytics", icon: "analytics" },
  { name: "Messages", href: "/dashboard/messages", icon: "mail" },
];

export default function TopBar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
          <div className="bg-[#137fec] size-9 rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[20px]">anchor</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-slate-900 font-bold text-sm leading-tight">
              Arslan Integrated
            </h1>
            <p className="text-slate-400 text-[11px]">Solutions Portal</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 mx-6">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#137fec]/10 text-[#137fec]"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="hidden lg:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search */}
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-[#137fec] focus:border-[#137fec] w-56 outline-none placeholder:text-slate-400"
              placeholder="Search tracking #..."
              type="text"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors relative">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className={`p-2 rounded-lg transition-colors ${
              isActive("/dashboard/settings")
                ? "text-[#137fec] bg-[#137fec]/10"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </Link>

          {/* User Avatar */}
          <div className="size-9 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#137fec]/30 transition-colors">
            <span className="text-slate-600 font-semibold text-xs">AF</span>
          </div>
        </div>
      </div>
    </header>
  );
}
