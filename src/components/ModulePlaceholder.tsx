import { LEGACY_APP_PATH } from "@/modules/registry";
import type { ModuleStatus } from "@/modules/types";

/**
 * The screen an un-ported module shows.
 *
 * Two jobs. For a `legacy` module it hands the user a one-tap route to the
 * working feature, so nothing is lost while the port is in flight. For a
 * `planned` module it says plainly that the thing isn't built, rather than
 * pretending with an empty panel.
 *
 * Deleting a call to this component is the last step of porting a module.
 */
export function ModulePlaceholder({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: ModuleStatus;
}) {
  return (
    <div className="placeholder">
      <h2>{title}</h2>
      <p>{description}</p>

      {status === "legacy" ? (
        <>
          <p>
            This module hasn't been rebuilt in the new app yet — it's still running in the classic
            single-page version, exactly as it works today. Nothing has changed about it.
          </p>
          <div className="placeholder-actions">
            <a className="btn primary" href={LEGACY_APP_PATH}>
              Open the classic app
            </a>
          </div>
        </>
      ) : (
        <p>
          Not built yet. It's on the roadmap — see <code>docs/roadmap.md</code> for where it sits in
          the order.
        </p>
      )}
    </div>
  );
}
