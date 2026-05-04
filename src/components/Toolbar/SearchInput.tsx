import { CloseIcon, SearchIcon } from "../../icons/Icons";
import { useAppDispatch, useAppState } from "../../state/AppContext";

export function SearchInput() {
  const { query } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div className={`search-input${query ? " has-value" : ""}`}>
      <span className="search-input-icon" aria-hidden="true">
        <SearchIcon size={13} />
      </span>
      <input
        type="search"
        className="search-input-field"
        placeholder="Search titles, developers, years…"
        value={query}
        onChange={(e) => dispatch({ type: "SET_QUERY", query: e.target.value })}
        aria-label="Search games"
      />
      {query && (
        <button
          type="button"
          className="search-input-clear"
          aria-label="Clear search"
          onClick={() => dispatch({ type: "SET_QUERY", query: "" })}
        >
          <CloseIcon size={11} />
        </button>
      )}
    </div>
  );
}
