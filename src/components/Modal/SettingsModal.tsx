import { useCallback, useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { getPortableDirectory, setPortableDirectory } from "../../lib/api";
import { PORTABLE_DIRECTORY_HELP } from "../../lib/copy";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FieldState {
  value: string | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
}

const INITIAL: FieldState = {
  value: null,
  loading: true,
  busy: false,
  error: null,
};

export function SettingsModal({ open: isOpen, onClose }: Props) {
  const [field, setField] = useState<FieldState>(INITIAL);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setField({ ...INITIAL, loading: true });
    getPortableDirectory()
      .then((value) => {
        if (cancelled) return;
        setField({ value, loading: false, busy: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setField({
          value: null,
          loading: false,
          busy: false,
          error: errorMessage(err),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const apply = useCallback(async (next: string | null) => {
    setField((s) => ({ ...s, busy: true, error: null }));
    try {
      await setPortableDirectory(next);
      const fresh = await getPortableDirectory();
      setField({ value: fresh, loading: false, busy: false, error: null });
    } catch (err) {
      setField((s) => ({ ...s, busy: false, error: errorMessage(err) }));
    }
  }, []);

  const onBrowse = useCallback(async () => {
    setField((s) => ({ ...s, error: null }));
    let picked: string | string[] | null = null;
    try {
      picked = await open({
        directory: true,
        multiple: false,
        title: "Select portable directory",
      });
    } catch (err) {
      setField((s) => ({ ...s, error: errorMessage(err) }));
      return;
    }
    if (typeof picked === "string") {
      void apply(picked);
    }
  }, [apply]);

  const onClear = useCallback(() => {
    void apply(null);
  }, [apply]);

  return (
    <Modal
      title="Settings"
      open={isOpen}
      onClose={onClose}
      footer={
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="setting-row">
        <div className="setting-row-head">
          <label className="setting-label">Portable directory</label>
          <p className="setting-help">{PORTABLE_DIRECTORY_HELP}</p>
        </div>

        <div className="setting-value-strip" aria-busy={field.loading}>
          {field.loading ? (
            <span className="setting-value setting-value-skeleton">Loading…</span>
          ) : field.value ? (
            <span className="setting-value setting-value-set">{field.value}</span>
          ) : (
            <span className="setting-value setting-value-unset">Not set</span>
          )}
        </div>

        <div className="setting-actions">
          <Button
            variant="primary"
            onClick={onBrowse}
            disabled={field.loading || field.busy}
          >
            Browse…
          </Button>
          {field.value !== null && (
            <Button
              variant="ghost"
              onClick={onClear}
              disabled={field.loading || field.busy}
            >
              Clear
            </Button>
          )}
        </div>

        {field.error && (
          <div className="setting-error" role="alert">
            {field.error}
          </div>
        )}
      </div>
    </Modal>
  );
}

function errorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}
