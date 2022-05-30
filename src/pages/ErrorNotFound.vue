<template>
  <div class="fullscreen text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">404</div>

      <q-btn
        class="q-mt-xl"
        color="accent"
        unelevated
        to="/"
        :label="this.$t('goBack')"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ErrorNotFound",
});
</script>
