import "./globals.css";
import {
  Home, Dice5, UsersRound, MonitorPlay, BookOpen, CalendarDays,
  HelpCircle, Archive, ChevronsLeft, UserRound,
} from "lucide-react";

export const metadata = {
  title: "Gracz 1 vs Gracz 2 — Challenge",
  description: "Szkielet strony challenge'u League of Legends: ranking live, W/L, rank, LP.",
};

const PUBLIC_NAV = [
  { label: "Start", href: "/", icon: Home, active: true },
  { label: "Randomizer", href: "/randomizer", icon: Dice5 },
  { label: "Widzowie", href: "/widzowie", icon: UsersRound },
  { label: "Widgety", href: "/widgety", icon: MonitorPlay },
];
const INFO_NAV = [
  { label: "Zasady", href: "/zasady", icon: BookOpen },
  { label: "Plan", href: "/harmonogram", icon: CalendarDays },
  { label: "FAQ", href: "/faq", icon: HelpCircle },
  { label: "Archiwum", href: "/archiwum", icon: Archive },
];
const MOBILE_NAV = [
  { label: "Start", href: "/", icon: Home, active: true },
  { label: "Zasady", href: "/zasady", icon: BookOpen },
  { label: "Plan", href: "/harmonogram", icon: CalendarDays },
  { label: "Losuj", href: "/randomizer", icon: Dice5 },
  { label: "Widzowie", href: "/widzowie", icon: UsersRound },
  { label: "FAQ", href: "/faq", icon: HelpCircle },
  { label: "Profil", href: "/profil", icon: UserRound },
];

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#080a0f] text-[#e6edf6]">
        {/* Sidebar (desktop) */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/10 bg-[#080a0f]/96 px-3 py-4 backdrop-blur-xl md:flex">
          <div className="flex items-center justify-between gap-2 px-2">
            <a href="/" className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD700] text-base font-black text-[#090b10]">M</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">Masterles</p>
                <p className="truncate text-xs font-medium text-white/40">Czerwiec 2026</p>
              </div>
            </a>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/[0.08] hover:text-white" aria-label="Zwiń sidebar">
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 rounded-lg border border-[#FFD700]/20 bg-[#FFD700]/[0.08] px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FFD700]">Ranked challenge live</p>
              <span className="h-2 w-2 rounded-full bg-[#FFD700]" />
            </div>
            <p className="mt-2 text-sm font-bold text-white">Ranked start</p>
            <p className="mt-1 text-xs leading-5 text-white/52">Level 30 wbity. Teraz gry, W/L, rank i LP.</p>
          </div>

          <div className="mt-5 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1">
            <NavSection title="Publiczne" items={PUBLIC_NAV} />
          </div>

          <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
            <NavSection title="Info" items={INFO_NAV} />
            <a href="#" className="flex items-center justify-center rounded-lg border border-[#FFD700]/25 bg-[#FFD700]/10 px-3 py-2.5 text-xs font-black text-[#FFE66D] transition hover:bg-[#FFD700]/[0.14] hover:text-white">
              Wsparcie projektu
            </a>
          </div>
        </aside>

        {/* Mobile header */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080a0f]/90 backdrop-blur-xl md:hidden">
          <div className="flex h-14 items-center px-4">
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFD700] text-sm font-black text-[#090b10]">M</div>
              <span className="font-bold text-white">Masterles</span>
            </a>
          </div>
        </header>

        <div className="md:pl-72">
          <div className="pb-20 md:pb-0">{children}</div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#080a0f]/90 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-around py-2">
            {MOBILE_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <a key={item.href} href={item.href}
                   className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-xs ${item.active ? "text-[#FFD700]" : "text-white/50"}`}>
                  <Icon className="h-5 w-5" />
                  <span className="max-w-full truncate font-medium">{item.label}</span>
                </a>
              );
            })}
          </div>
        </nav>
      </body>
    </html>
  );
}

function NavSection({ title, items }) {
  return (
    <section>
      <p className="px-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/34">{title}</p>
      <div className="mt-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.href} href={item.href}
               className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold transition ${
                 item.active ? "bg-white/[0.09] text-white" : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
               }`}>
              <Icon className={`h-4 w-4 shrink-0 ${item.active ? "text-[#FFD700]" : "text-white/40 group-hover:text-white/70"}`} />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
