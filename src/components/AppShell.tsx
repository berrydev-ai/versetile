import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Brand } from "./Brand";
import { ModuleTabs } from "./ModuleTabs";

/**
 * The frame every module renders inside: header with brand and tabs, a main
 * area, a footer.
 *
 * Kept deliberately thin. The shell decides nothing about a module's content --
 * no shared toolbar, no shared controls bar. The legacy app had one global
 * controls strip that every tab had to opt out of (the Looper hid it entirely),
 * and that coupling is exactly what a module boundary is for.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="app-header">
        <div className="app-header-titles">
          <Link to="/" className="app-brand-link" aria-label="Versetile home">
            <Brand />
          </Link>
          <div className="app-subtitle">Every chord. Every shape. Every scale. Every fret.</div>
        </div>
        <ModuleTabs />
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        Built for writing songs. All chord and scale audio is synthesized in-browser.
      </footer>
    </>
  );
}
