import { NavLink, useLocation } from "react-router-dom";
import { MODULES } from "@/modules/registry";

/**
 * The tab strip, built entirely from the module registry.
 *
 * A module with an `externalPath` renders a plain <a> that leaves the app -- the
 * legacy bridge. Everything else is a <NavLink>. Because both cases come out of
 * the same list, flipping a module from legacy to ported changes nothing here.
 */
export function ModuleTabs() {
  const { pathname } = useLocation();

  return (
    <nav className="module-tabs" aria-label="Modules">
      {MODULES.map((module) => {
        const className = [
          "module-tab",
          module.status === "planned" ? "is-planned" : "",
        ]
          .filter(Boolean)
          .join(" ");

        if (module.externalPath) {
          // A full page load, not a route change. That is the point: the legacy
          // app is a self-contained document and must not be nested or hijacked.
          return (
            <a
              key={module.id}
              className={`${className} ${pathname === `/${module.path}` ? "is-active" : ""}`}
              href={module.externalPath}
              title={module.description}
            >
              {module.label}
            </a>
          );
        }

        return (
          <NavLink
            key={module.id}
            to={`/${module.path}`}
            title={module.description}
            className={({ isActive }) => `${className} ${isActive ? "is-active" : ""}`}
          >
            {module.label}
            {module.status === "planned" && <span className="module-tab-badge">Soon</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}
