import { create } from 'zustand';

const normalizeColumns = (columns = []) =>
  Array.isArray(columns)
    ? columns
        .filter((col) => col && col.name)
        .map((col) => ({
          name: col.name,
          label: col.label || '',
          type: col.type || 'string',
        }))
    : [];

const areColumnsEqual = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].name !== b[i].name || a[i].label !== b[i].label || a[i].type !== b[i].type) {
      return false;
    }
  }
  return true;
};

const usePageConfigColumnsStore = create((set, get) => ({
  availableColumns: [],
  setAvailableColumns: (columns = []) => {
    const normalized = normalizeColumns(columns);
    const current = get().availableColumns;
    if (areColumnsEqual(current, normalized)) {
      return;
    }
    set({ availableColumns: normalized });
  },
  resetAvailableColumns: () => {
    if (get().availableColumns.length > 0) {
      set({ availableColumns: [] });
    }
  },
}));

export default usePageConfigColumnsStore;

