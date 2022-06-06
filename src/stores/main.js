import { defineStore } from "pinia";

export const useStore = defineStore("main", {
  state: () => {
    return {
      panel: true,
      theme: "Neat",
    };
  },
  getters: {
    sidePanel: (state) => state.panel,
    editorTheme: (state) => state.theme,
  },
  actions: {
    toggleSidePanel() {
      this.panel = !this.panel;
    },
    setEditorTheme(theme) {
      this.theme = theme;
    },
  },
});
