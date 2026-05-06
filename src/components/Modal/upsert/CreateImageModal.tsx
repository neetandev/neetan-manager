import { useEffect, useState } from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import {
  FDD_PRESETS,
  HDD_PRESETS_IDE,
  HDD_PRESETS_SASI,
  STRINGS,
} from "./strings";
import { defaultHddPreset, newDriveId } from "./resolve";
import type { DriveImage } from "./types";

type Tab = "fdd" | "hdd";

interface Props {
  open: boolean;
  onClose: () => void;
  initialTab: Tab;
  resolvedMachine: string;
  onCreate: (image: DriveImage, tab: Tab) => void;
}

export function CreateImageModal({
  open,
  onClose,
  initialTab,
  resolvedMachine,
  onCreate,
}: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [fddPreset, setFddPreset] = useState<string>("2hd");
  const [hddPreset, setHddPreset] = useState<string>(
    defaultHddPreset(resolvedMachine),
  );
  const [filename, setFilename] = useState<string>("~/games/new-image.d88");

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setHddPreset(defaultHddPreset(resolvedMachine));
    setFddPreset("2hd");
    setFilename(
      initialTab === "fdd" ? "~/games/new-image.d88" : "~/games/new-image.hdi",
    );
  }, [open, initialTab, resolvedMachine]);

  const onChangeTab = (next: Tab) => {
    setTab(next);
    if (next === "fdd" && !filename.endsWith(".d88")) {
      setFilename("~/games/new-image.d88");
    } else if (next === "hdd" && !filename.endsWith(".hdi")) {
      setFilename("~/games/new-image.hdi");
    }
  };

  const onConfirm = () => {
    let type: string;
    if (tab === "fdd") {
      type = "D88";
    } else {
      type = hddPreset.toUpperCase();
    }
    onCreate(
      {
        id: newDriveId(),
        path: filename,
        type,
      },
      tab,
    );
    onClose();
  };

  return (
    <Modal
      title={STRINGS.createImage.title}
      open={open}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {STRINGS.createImage.cancel}
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {STRINGS.createImage.create}
          </Button>
        </>
      }
    >
      <div className="submodal-tabs">
        <button
          type="button"
          className={`submodal-tab${tab === "fdd" ? " on" : ""}`}
          onClick={() => onChangeTab("fdd")}
        >
          {STRINGS.createImage.tabs.fdd}
        </button>
        <button
          type="button"
          className={`submodal-tab${tab === "hdd" ? " on" : ""}`}
          onClick={() => onChangeTab("hdd")}
        >
          {STRINGS.createImage.tabs.hdd}
        </button>
      </div>

      <div className="submodal-body">
        <div className="form-cell">
          <label className="field-name">{STRINGS.createImage.output}</label>
          <div className="path-row">
            <input
              type="text"
              className="input mono"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                /* TODO: Tauri save dialog */
              }}
            >
              Browse…
            </button>
          </div>
        </div>

        <div className="form-cell">
          <label className="field-name">{STRINGS.createImage.diskType}</label>
          {tab === "fdd" ? (
            <div className="preset-grid">
              {FDD_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`preset${fddPreset === p.id ? " on" : ""}`}
                  onClick={() => setFddPreset(p.id)}
                >
                  <span className="preset-name">{p.label}</span>
                  <span className="preset-detail">{p.detail}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="preset-grid three">
              <div className="preset-group-label">
                {STRINGS.createImage.sasiGroup}
              </div>
              {HDD_PRESETS_SASI.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`preset${hddPreset === p.id ? " on" : ""}`}
                  onClick={() => setHddPreset(p.id)}
                >
                  <span className="preset-name">{p.label}</span>
                  <span className="preset-detail">{p.detail}</span>
                </button>
              ))}
              <div className="preset-group-label">
                {STRINGS.createImage.ideGroup}
              </div>
              {HDD_PRESETS_IDE.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`preset${hddPreset === p.id ? " on" : ""}`}
                  onClick={() => setHddPreset(p.id)}
                >
                  <span className="preset-name">{p.label}</span>
                  <span className="preset-detail">{p.detail}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
