import { create } from 'zustand';

const defaultPageState = {
  searchText: '',
  filters: {},
  pagination: {
    current: 1,
    pageSize: 20,
  },
  sorting: {},
  drawerVisible: false,
  selectedRecord: null,
  downloading: false,
};

const useDataPageStore = create((set, get) => ({
  // State per pageKey
  pageStates: {},

  // Initialize page state if it doesn't exist
  ensurePageState: (pageKey) => {
    const state = get();
    if (!state.pageStates[pageKey]) {
      set((prevState) => ({
        pageStates: {
          ...prevState.pageStates,
          [pageKey]: { ...defaultPageState },
        },
      }));
    }
  },

  // Set state for a specific page
  setPageState: (pageKey, updates) => {
    set((state) => {
      const currentState = state.pageStates[pageKey] || defaultPageState;
      return {
        pageStates: {
          ...state.pageStates,
          [pageKey]: {
            ...currentState,
            ...updates,
          },
        },
      };
    });
  },

  // Actions for a specific page
  setSearchText: (pageKey, searchText) => {
    set((state) => {
      const currentState = state.pageStates[pageKey] || defaultPageState;
      return {
        pageStates: {
          ...state.pageStates,
          [pageKey]: {
            ...currentState,
            searchText,
            pagination: { ...currentState.pagination, current: 1 },
          },
        },
      };
    });
  },

  setFilters: (pageKey, filters) => {
    set((state) => {
      const currentState = state.pageStates[pageKey] || defaultPageState;
      return {
        pageStates: {
          ...state.pageStates,
          [pageKey]: {
            ...currentState,
            filters,
            pagination: { ...currentState.pagination, current: 1 },
          },
        },
      };
    });
  },

  setFilterValue: (pageKey, fieldName, value) => {
    set((state) => {
      const currentState = state.pageStates[pageKey] || defaultPageState;
      return {
        pageStates: {
          ...state.pageStates,
          [pageKey]: {
            ...currentState,
            filters: {
              ...currentState.filters,
              [fieldName]: value,
            },
            pagination: { ...currentState.pagination, current: 1 },
          },
        },
      };
    });
  },

  setPagination: (pageKey, pagination) => {
    set((state) => {
      const currentState = state.pageStates[pageKey] || defaultPageState;
      return {
        pageStates: {
          ...state.pageStates,
          [pageKey]: {
            ...currentState,
            pagination,
          },
        },
      };
    });
  },

  setSorting: (pageKey, sorting) => {
    set((state) => {
      const currentState = state.pageStates[pageKey] || defaultPageState;
      return {
        pageStates: {
          ...state.pageStates,
          [pageKey]: {
            ...currentState,
            sorting,
          },
        },
      };
    });
  },

  setDrawerVisible: (pageKey, visible) => {
    set((state) => {
      const currentState = state.pageStates[pageKey] || defaultPageState;
      return {
        pageStates: {
          ...state.pageStates,
          [pageKey]: {
            ...currentState,
            drawerVisible: visible,
          },
        },
      };
    });
  },

  setSelectedRecord: (pageKey, record) => {
    set((state) => {
      const currentState = state.pageStates[pageKey] || defaultPageState;
      return {
        pageStates: {
          ...state.pageStates,
          [pageKey]: {
            ...currentState,
            selectedRecord: record,
          },
        },
      };
    });
  },

  setDownloading: (pageKey, downloading) => {
    set((state) => {
      const currentState = state.pageStates[pageKey] || defaultPageState;
      return {
        pageStates: {
          ...state.pageStates,
          [pageKey]: {
            ...currentState,
            downloading,
          },
        },
      };
    });
  },

  resetPageState: (pageKey) => {
    set((state) => {
      const newPageStates = { ...state.pageStates };
      delete newPageStates[pageKey];
      return { pageStates: newPageStates };
    });
  },

  resetFilters: (pageKey, defaultPageSize = 20) => {
    set((state) => {
      const currentState = state.pageStates[pageKey] || defaultPageState;
      return {
        pageStates: {
          ...state.pageStates,
          [pageKey]: {
            ...currentState,
            searchText: '',
            filters: {},
            pagination: { current: 1, pageSize: defaultPageSize },
            sorting: {},
          },
        },
      };
    });
  },
}));

export default useDataPageStore;

