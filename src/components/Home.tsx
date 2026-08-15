import { Link } from "react-router-dom";
import { LEGACY_APP_PATH, MODULES } from "@/modules/registry";
import type { ModuleStatus } from "@/modules/types";

const STATUS_LABEL: Record<ModuleStatus, string> = {
  live: "Ready",
  legacy: "Classic app",
  planned: "Not built",
};

/**
 * The landing page.
 *
 * Right now it is mostly a migration status board, which is genuinely the most
 * useful thing it can be: it tells a tester where each feature actually lives
 * and gets them into the working app in one tap.
 *
 * It is also the natural home for the song dashboard later — recent songs, jump
 * back into a loop — which is why it is a real route rather than a redirect.
 */
export function Home() {
  return (
    <div className="home">
      <div className="home-intro">
        <h1 className="home-title">A songwriter's workstation</h1>
        <p className="home-lede">
          Chords, scales and progressions across the whole neck, plus a bar-grid looper for building
          an idea into a song.
        </p>
        <div className="placeholder-actions">
          <a className="btn primary" href={LEGACY_APP_PATH}>
            Open the app
          </a>
        </div>
      </div>

      <ul className="home-modules">
        {MODULES.map((module) => (
          <li key={module.id} className={`home-module is-${module.status}`}>
            <div className="home-module-head">
              {module.externalPath ? (
                <a className="home-module-name" href={module.externalPath}>
                  {module.label}
                </a>
              ) : (
                <Link className="home-module-name" to={`/${module.path}`}>
                  {module.label}
                </Link>
              )}
              <span className="home-module-status">{STATUS_LABEL[module.status]}</span>
            </div>
            <p className="home-module-desc">{module.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
