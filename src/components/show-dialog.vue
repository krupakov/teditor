<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none" style="overflow-wrap: break-word">
        {{ message }}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="$t('ok')" color="accent" @click="onDialogOK" />
        <q-btn
          flat
          :label="$t('cancel')"
          color="accent"
          v-if="cancelBtn"
          @click="onDialogCancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDialogPluginComponent } from "quasar";

export default {
  props: {
    title: {
      required: false,
      type: String,
    },
    message: {
      required: false,
      type: String,
    },
    cancelBtn: {
      required: false,
      default: true,
      type: Boolean,
    },
  },
  emits: [...useDialogPluginComponent.emits],
  setup() {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();

    return {
      dialogRef,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
    };
  },
};
</script>
