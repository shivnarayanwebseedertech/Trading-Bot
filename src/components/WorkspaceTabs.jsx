import React from "react";

export default function WorkspaceTabs({
  workspaces,
  activeIdx,
  setActiveIdx,
  addTab,
  closeTab,
  renameTab,
  exportWorkspace, // function to export workspace
  importWorkspace, // function to start import workflow
  setWorkspaces, // needed to pass to importWorkspace to update state
  setActiveIdx: setActiveTabIdx, // to switch to newly imported workspace
}) {
  // Handle import button click and pass setWorkspaces/setActiveTabIdx to importWorkspace helper
  const handleImportClick = () => {
    if (typeof importWorkspace === "function") {
      importWorkspace(setWorkspaces, setActiveTabIdx);
    }
  };

  return (
    <div className="flex items-center border-b bg-white dark:bg-gray-800 px-2">
      {workspaces.map((ws, i) => (
        <div
          key={ws.id}
          className={`flex items-center px-4 py-2 cursor-pointer border-r last:border-r-0 select-none
            ${
              i === activeIdx
                ? "bg-blue-50 dark:bg-blue-900 font-bold text-blue-700"
                : "text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            }
          `}
          onClick={() => setActiveIdx(i)}
          role="tab"
          aria-selected={i === activeIdx}
          tabIndex={i === activeIdx ? 0 : -1}
          aria-label={`Workspace tab ${ws.label || ws.symbol || "Chart"}`}
        >
          <input
            className={`bg-transparent font-semibold outline-none ring-0 rounded px-1 mr-2 max-w-[80px] ${
              i === activeIdx ? "" : "pointer-events-none"
            }`}
            value={ws.label || ws.symbol || "Chart"}
            onChange={(e) => renameTab(i, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            disabled={i !== activeIdx}
            maxLength={18}
            aria-label={`Rename workspace tab ${
              ws.label || ws.symbol || "Chart"
            }`}
            style={{ width: "80px" }}
          />
          {workspaces.length > 1 && (
            <button
              className="ml-1 text-lg text-gray-400 hover:text-red-500 focus:outline-none"
              aria-label={`Close workspace tab ${
                ws.label || ws.symbol || "Chart"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(i);
              }}
              type="button"
            >
              &times;
            </button>
          )}
        </div>
      ))}

      {/* Export button */}
      <button
        className="ml-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold"
        type="button"
        aria-label="Export current workspace"
        onClick={() => {
          if (typeof exportWorkspace === "function" && workspaces[activeIdx]) {
            exportWorkspace(workspaces[activeIdx]);
          }
        }}
      >
        Export
      </button>

      {/* Import button */}
      <button
        className="ml-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold"
        type="button"
        aria-label="Import workspace"
        onClick={handleImportClick}
      >
        Import
      </button>

      {/* Add tab button */}
      <button
        className="ml-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
        aria-label="Add new workspace tab"
        onClick={addTab}
        type="button"
      >
        +
      </button>
    </div>
  );
}
