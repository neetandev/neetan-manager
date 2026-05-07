import {useTranslation} from "react-i18next";
import {CloseIcon, SearchIcon} from "../../icons/Icons";
import {useAppDispatch, useAppState} from "../../state/AppContext";

export function SearchInput() {
    const {t} = useTranslation();
    const {query} = useAppState();
    const dispatch = useAppDispatch();

    return (
        <div className={`search-input${query ? " has-value" : ""}`}>
      <span className="search-input-icon" aria-hidden="true">
        <SearchIcon size={13}/>
      </span>
            <input
                type="search"
                className="search-input-field"
                placeholder={t("toolbar.searchPlaceholder")}
                value={query}
                onChange={(e) => dispatch({type: "SET_QUERY", query: e.target.value})}
                aria-label={t("toolbar.searchAriaLabel")}
            />
            {query && (
                <button
                    type="button"
                    className="search-input-clear"
                    aria-label={t("toolbar.searchClear")}
                    onClick={() => dispatch({type: "SET_QUERY", query: ""})}
                >
                    <CloseIcon size={11}/>
                </button>
            )}
        </div>
    );
}
