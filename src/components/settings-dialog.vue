<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">{{ $t("settings.title") }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-toggle
          v-model="dark"
          color="accent"
          :label="$t('settings.dark')"
          left-label
        />
      </q-card-section>
      <q-card-section class="q-pt-none">
        {{ $t("settings.theme") }}&nbsp;&nbsp;
        <select class="theme-select" v-model="editorTheme">
          <option>Dracula</option>
          <option>Eclipse</option>
          <option>Idea</option>
          <option>Lucario</option>
          <option>Mbo</option>
          <option>Material</option>
          <option>Monokai</option>
          <option>Moxer</option>
          <option>Neat</option>
          <option>Nord</option>
          <option>Oceanic-next</option>
          <option>Paraiso-light</option>
          <option>Yonce</option>
        </select>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from "vue";
import { useStore } from "stores/main";
import { useQuasar, useDialogPluginComponent } from "quasar";
import { store } from "quasar/wrappers";

export default {
  emits: [...useDialogPluginComponent.emits],
  setup() {
    const $q = useQuasar();
    const store = useStore();
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();

    return {
      dark: ref($q.dark.isActive),
      editorTheme: ref(store.editorTheme),
      dialogRef,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
      store,
    };
  },
  watch: {
    dark: function () {
      this.$q.dark.set(this.dark);
      localStorage.setItem("dark", this.dark);
    },
    editorTheme: function () {
      this.store.setEditorTheme(this.editorTheme);
      localStorage.setItem("theme", this.editorTheme);
    },
  },
};
</script>
