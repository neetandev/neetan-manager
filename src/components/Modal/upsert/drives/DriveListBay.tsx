import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { STRINGS } from "../strings";
import type { DriveImage } from "../types";
import { DriveRow } from "./DriveRow";

interface Props {
  bayKey: "fdd1" | "fdd2" | "cdrom";
  display: string;
  fieldKey: string;
  images: DriveImage[];
  onChange: (next: DriveImage[]) => void;
  onAddExisting: () => void;
  onCreateNew?: () => void;
  banner?: ReactNode;
  hasBanner?: boolean;
}

export function DriveListBay({
  bayKey,
  display,
  fieldKey,
  images,
  onChange,
  onAddExisting,
  onCreateNew,
  banner,
  hasBanner,
}: Props) {
  const dragIndex = useRef<number | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const onDragStart = (idx: number) => (e: DragEvent<HTMLDivElement>) => {
    dragIndex.current = idx;
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${bayKey}:${idx}`);
  };

  const onDragOver = (idx: number) => (e: DragEvent<HTMLDivElement>) => {
    if (dragIndex.current === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dropTargetIdx !== idx) setDropTargetIdx(idx);
  };

  const onDragLeave = () => {
    setDropTargetIdx(null);
  };

  const onDrop = (idx: number) => (e: DragEvent<HTMLDivElement>) => {
    if (dragIndex.current === null) return;
    e.preventDefault();
    const from = dragIndex.current;
    const to = idx;
    if (from === to) {
      dragIndex.current = null;
      setDropTargetIdx(null);
      setDraggingIdx(null);
      return;
    }
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
    dragIndex.current = null;
    setDropTargetIdx(null);
    setDraggingIdx(null);
  };

  const onDragEnd = () => {
    dragIndex.current = null;
    setDropTargetIdx(null);
    setDraggingIdx(null);
  };

  const onRemove = (idx: number) => {
    const next = images.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  const meta = STRINGS.drives.listMeta(images.length);
  const blockClass = `drive-block${hasBanner ? " has-banner" : ""}`;

  return (
    <>
      {banner}
      <div className={blockClass}>
        <div className="drive-block-head">
          <div className="drive-name">
            <strong>{display}</strong>
            <span className="field-key">{fieldKey}</span>
          </div>
          <div className="drive-meta">{meta}</div>
        </div>
        {images.length > 0 && (
          <div className="drive-list">
            {images.map((img, idx) => (
              <DriveRow
                key={img.id}
                image={img}
                isDragging={draggingIdx === idx}
                isDropTarget={dropTargetIdx === idx && draggingIdx !== idx}
                onDragStart={onDragStart(idx)}
                onDragOver={onDragOver(idx)}
                onDrop={onDrop(idx)}
                onDragEnd={onDragEnd}
                onDragLeave={onDragLeave}
                onRemove={() => onRemove(idx)}
              />
            ))}
          </div>
        )}
        <div className="drive-foot">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onAddExisting}
          >
            {STRINGS.drives.addExisting}
          </button>
          {onCreateNew && (
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={onCreateNew}
            >
              {STRINGS.drives.createNew}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
