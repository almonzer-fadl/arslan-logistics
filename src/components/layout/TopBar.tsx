"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation, type Language } from "@/lib/i18n";
import { useTheme } from "@/components/ui/ThemeProvider";

const navigationKeys = [
  { key: "dashboard" as const, href: "/dashboard", icon: "grid_view" },
  { key: "carrierHub" as const, href: "/dashboard/carriers", icon: "hub" },
  { key: "quotes" as const, href: "/dashboard/quotes", icon: "description" },
  { key: "shipments" as const, href: "/dashboard/shipments", icon: "inventory_2" },
  { key: "tracker" as const, href: "/dashboard/tracker", icon: "map" },
  { key: "analytics" as const, href: "/dashboard/analytics", icon: "analytics" },
  { key: "messages" as const, href: "/dashboard/messages", icon: "mail" },
];

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

export default function TopBar() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navigation = navigationKeys.map((item) => ({
    name: t.nav[item.key],
    href: item.href,
    icon: item.icon,
  }));

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="px-4 md:px-6 flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
            <div className="bg-[#137fec] size-9 rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">anchor</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-slate-900 dark:text-white font-bold text-sm leading-tight">
                Arslan Integrated
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-[11px]">Solutions Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 mx-6">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#137fec]/10 text-[#137fec]"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Search */}
            <div className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[18px]">
                search
              </span>
              <input
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-[#137fec] focus:border-[#137fec] w-56 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholder="Search tracking #..."
                type="text"
              />
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              <span className="material-symbols-outlined text-[22px]">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <span className="text-lg">
                  {languages.find((l) => l.code === language)?.flag}
                </span>
              </button>
              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                          language === lang.code
                            ? "bg-[#137fec]/10 text-[#137fec] font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Notifications */}
            <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors relative">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>

            {/* Settings */}
            <Link
              href="/dashboard/settings"
              className={`p-2 rounded-lg transition-colors hidden sm:block ${
                isActive("/dashboard/settings")
                  ? "text-[#137fec] bg-[#137fec]/10"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </Link>

            {/* User Avatar */}
            <div className="size-9 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-[#137fec]/30 transition-colors">
              <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs">AF</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="fixed top-16 left-0 right-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-lg z-40 lg:hidden">
            <div className="p-2 space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#137fec]/10 text-[#137fec]"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors sm:hidden ${
                  isActive("/dashboard/settings")
                    ? "bg-[#137fec]/10 text-[#137fec]"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                {t.nav.settings}
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
