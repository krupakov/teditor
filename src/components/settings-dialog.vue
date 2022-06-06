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
      <q-card-section class="q-pt-none flex items-center">
        {{ $t("settings.theme") }}&nbsp;&nbsp;&nbsp;
        <v-select
          :clearable="false"
          :options="themeOptions"
          v-model="editorTheme"
        ></v-select>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from "vue";
import { useStore } from "stores/main";
import { useQuasar, useDialogPluginComponent } from "quasar";
import vSelect from "vue-select";

export default {
  emits: [...useDialogPluginComponent.emits],
  components: {
    vSelect,
  },
  setup() {
    const $q = useQuasar();
    const store = useStore();
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();

    return {
      dark: ref($q.dark.isActive),
      editorTheme: ref(store.editorTheme),
      themeOptions: [
        "Dracula",
        "Eclipse",
        "Idea",
        "Lucario",
        "Mbo",
        "Material",
        "Monokai",
        "Moxer",
        "Neat",
        "Nord",
        "Oceanic-next",
        "Paraiso-light",
        "Yonce",
      ],
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
