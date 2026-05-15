import { ROUTES } from "@/lib/routes";
import { Link, NavLink } from "react-router-dom";

const NAV_LINK_BASE =
  "text-sm font-medium text-ink-soft transition hover:text-brand-700";
const NAV_LINK_ACTIVE = "text-brand-700";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <Link to={ROUTES.home} className="flex items-center gap-3">
          <img
            src="/letalk-logo.webp"
            alt="Letalk"
            className="h-7 w-auto"
            width={96}
            height={28}
          />
          <span className="hidden text-xs text-ink-soft sm:inline">
            Enriquecimento de leads
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink
            to={ROUTES.home}
            end
            className={({ isActive }: { isActive: boolean }) =>
              `${NAV_LINK_BASE} ${isActive ? NAV_LINK_ACTIVE : ""}`
            }
          >
            Novo lead
          </NavLink>
          <NavLink
            to={ROUTES.history}
            className={({ isActive }: { isActive: boolean }) =>
              `${NAV_LINK_BASE} ${isActive ? NAV_LINK_ACTIVE : ""}`
            }
          >
            Histórico
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
