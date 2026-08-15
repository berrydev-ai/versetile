import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createEmptySongProject, type SongProject } from "./types";
import { readJson, writeJson, STORAGE_KEYS } from "@/lib/storage";

/**
 * The Song Project, shared across every module.
 *
 * Deliberately plain React context over a state library. The object is small,
 * updates are user-paced (nobody types 60 times a second), and every module
 * reads far more than it writes -- none of the problems a store library solves
 * are present. If that stops being true, this file is the only thing that has to
 * change; modules only ever see the `useSongProject()` hook.
 *
 * IMPORTANT: audio never comes through here. The Looper's clock, its buffers and
 * its rAF loop stay entirely outside React. A module may write a small
 * *reference* to a loop into the project once a take is finished, and that is
 * all. Putting audio state into React state is how you turn a sample-accurate
 * looper into a janky one.
 */

interface SongProjectContextValue {
  project: SongProject;
  /** Apply a partial patch. `updatedAt` is stamped automatically. */
  update: (patch: Partial<Omit<SongProject, "id" | "createdAt" | "schemaVersion">>) => void;
  /** Discard everything and start a blank song. */
  reset: () => void;
}

const SongProjectContext = createContext<SongProjectContextValue | null>(null);

function loadInitialProject(): SongProject {
  const stored = readJson<SongProject>(STORAGE_KEYS.songProject);
  // A stored project from a future/unknown schema is ignored rather than half
  // read -- same defensive stance the legacy IndexedDB restore takes.
  if (stored && stored.schemaVersion === 1) return stored;
  return createEmptySongProject();
}

export function SongProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<SongProject>(loadInitialProject);

  // Persist on a trailing debounce. Without it, dragging a tempo slider writes to
  // localStorage on every animation frame.
  const saveTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => writeJson(STORAGE_KEYS.songProject, project), 400);
    return () => window.clearTimeout(saveTimer.current);
  }, [project]);

  const update = useCallback<SongProjectContextValue["update"]>((patch) => {
    setProject((prev) => ({ ...prev, ...patch, updatedAt: Date.now() }));
  }, []);

  const reset = useCallback(() => setProject(createEmptySongProject()), []);

  const value = useMemo<SongProjectContextValue>(
    () => ({ project, update, reset }),
    [project, update, reset],
  );

  return <SongProjectContext.Provider value={value}>{children}</SongProjectContext.Provider>;
}

export function useSongProject(): SongProjectContextValue {
  const ctx = useContext(SongProjectContext);
  if (!ctx) {
    throw new Error("useSongProject must be used inside <SongProjectProvider>");
  }
  return ctx;
}
