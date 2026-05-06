import { CopyIcon, PencilIcon, PlusIcon, TrashIcon } from "../../icons/Icons";
import { useAppDispatch, useAppState } from "../../state/AppContext";

export function ActionGroup() {
  const { selected } = useAppState();
  const dispatch = useAppDispatch();
  const hasSelection = selected !== null;
  const open = (kind: "add" | "edit" | "duplicate" | "delete") =>
    dispatch({ type: "OPEN_MODAL", kind });

  return (
    <div className="action-group" role="group" aria-label="Library actions">
      <button
        type="button"
        className="action-btn"
        onClick={() => open("add")}
        title="Add game"
      >
        <PlusIcon size={13} />
        <span>Add</span>
      </button>
      <button
        type="button"
        className="action-btn"
        onClick={() => open("edit")}
        disabled={!hasSelection}
        title={hasSelection ? "Edit selected game" : "Select a game to edit"}
      >
        <PencilIcon size={13} />
        <span>Edit</span>
      </button>
      <button
        type="button"
        className="action-btn"
        onClick={() => open("duplicate")}
        disabled={!hasSelection}
        title={
          hasSelection ? "Duplicate selected game" : "Select a game to duplicate"
        }
      >
        <CopyIcon size={13} />
        <span>Duplicate</span>
      </button>
      <span className="action-sep" aria-hidden="true" />
      <button
        type="button"
        className="action-btn action-btn-danger"
        onClick={() => open("delete")}
        disabled={!hasSelection}
        title={hasSelection ? "Delete selected game" : "Select a game to delete"}
      >
        <TrashIcon size={13} />
        <span>Delete</span>
      </button>
    </div>
  );
}
