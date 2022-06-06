import { defineStore } from "pinia";

export const useStore = defineStore("main", {
  state: () => {
    return {
      panel: true,
      theme: "Neat",
      mode: "JavaScript",
    };
  },
  getters: {
    sidePanel: (state) => state.panel,
    editorTheme: (state) => state.theme,
    editorMode: (state) => state.mode,
  },
  actions: {
    toggleSidePanel() {
      this.panel = !this.panel;
    },
    setEditorTheme(theme) {
      this.theme = theme;
    },
    setEditorMode(mode) {
      this.mode = mode;
    },
  },
});
