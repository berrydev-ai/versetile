import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Home } from "@/components/Home";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";
import { SongProjectProvider } from "@/song/SongProjectContext";
import { ROUTED_MODULES } from "@/modules/registry";

/**
 * Routes are generated from the module registry, so there is no second list to
 * keep in sync with the tabs. Adding a module adds its route automatically.
 */
export default function App() {
  return (
    <SongProjectProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />

          {ROUTED_MODULES.map(({ id, path, Component }) => (
            <Route key={id} path={`/${path}`} element={<Component />} />
          ))}

          <Route
            path="*"
            element={
              <ModulePlaceholder
                title="Not found"
                description="That page doesn't exist. Pick a module from the tabs above."
                status="planned"
              />
            }
          />
        </Routes>
      </AppShell>
    </SongProjectProvider>
  );
}
