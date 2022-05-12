<template>
  <q-page class="flex">
    <!-- <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    /> -->
    <div class="q-pa-md" style="width: 100%; padding: 0 !important">
      <q-card>
        <q-tabs v-model="currentFile" align="left" dense>
          <q-tab
            v-for="(file, index) in files"
            :key="'tab_' + index"
            :name="index"
            :label="file.name"
            :ripple="false"
          >
            <div @click="closeFile(index)" class="q-tab-close"></div>
          </q-tab>
        </q-tabs>

        <q-tab-panels v-model="currentFile" keep-alive>
          <q-tab-panel
            v-for="(file, index) in files"
            :key="'panel_' + index"
            :name="index"
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
      files: [
        { name: 'Tab 1', mode: 'text/javascript' },
        { name: 'Tab 2', mode: 'text/javascript' },
        { name: 'Tab 3', mode: 'text/javascript' },
      ],
      currentFile: ref(0),
    };
  },
  methods: {
    closeFile(index) {
      if (index > -1) {
        this.files.splice(index, 1)
      }
    }
  },
});
</script>
