<template>
  <q-page class="flex">
    <!-- <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    /> -->
    <div class="q-pa-md" style="width: 100%; padding: 0 !important">
      <q-card>
        <q-tabs v-model="tab" align="left" dense>
          <q-tab name="tab1" label="Tab 1" :ripple="false" />
          <q-tab name="tab2" label="Tab 2" :ripple="false" />
        </q-tabs>

        <q-tab-panels v-model="tab" keep-alive>
          <q-tab-panel
            name="tab1"
            style="padding: 0; height: calc(100vh - 75px)"
          >
            <code-editor></code-editor>
          </q-tab-panel>

          <q-tab-panel
            name="tab2"
            style="padding: 0; height: calc(100vh - 75px)"
          >
            <code-editor></code-editor>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import CodeEditor from "components/code-editor";

export default defineComponent({
  name: "IndexPage",
  components: {
    CodeEditor,
  },
  setup() {
    return {
      tab: ref("tab1"),
    };
  },
});
</script>
