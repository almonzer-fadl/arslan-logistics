"use client";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-6">
      <div className="flex justify-between items-center">
        {/* Page Title */}
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-[#137fec] focus:border-[#137fec] w-64 outline-none"
              placeholder="Search tracking # or carrier..."
              type="text"
            />
          </div>

          {/* Notification Button */}
          <button className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          {/* User Avatar */}
          <div className="size-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center">
            <span className="text-slate-600 font-semibold text-sm">
              U
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
