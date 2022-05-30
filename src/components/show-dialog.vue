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
        <q-btn flat :label="this.$t('ok')" color="accent" @click="onDialogOK" />
        <q-btn
          flat
          :label="this.$t('cancel')"
          color="accent"
          v-if="cancelBtn"
          @click="onDialogCancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from "quasar";

const props = defineProps({
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
});

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();
</script>
