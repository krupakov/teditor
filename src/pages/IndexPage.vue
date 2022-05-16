<template>
  <q-page class="flex">
    <!-- <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    /> -->
    <div class="q-pa-md" style="width: 100%; padding: 0 !important">
      <div class="tabs row no-wrap">
        <div
          class="tab"
          :style="{
            background: key == currentWindow ? activeTabStyles.background : '',
          }"
          v-for="(file, key, index) in files"
          :key="key"
          @click="tabClickHandler($event, key, index, file.name)"
        >
          <input
            :style="{
              color: key == currentWindow ? activeTabStyles.color : '',
            }"
            type="text"
            autocomplete="off"
            :value="file.name"
            disabled
          />
          <div
            :style="{
              color: key == currentWindow ? activeTabStyles.color : '',
            }"
            class="tab-close"
            :ref="'close_' + key"
          ></div>
        </div>
        <div
          class="tab-add"
          v-if="Object.keys(files).length"
          @click="newTab()"
        ></div>
      </div>

      <div
        class="row"
        :style="{
          'box-shadow': activeTabStyles.shadow,
        }"
      >
        <div
          class="tab-content col"
          v-for="(file, key) in files"
          :key="'window_' + key"
          v-show="key == currentWindow"
        >
          <code-editor :ref="'editor_' + key"></code-editor>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import CodeEditor from "components/code-editor";
import ConfirmDialog from "components/confirm-dialog";

export default defineComponent({
  name: "IndexPage",
  components: {
    CodeEditor,
  },
  setup() {
    return {
      files: ref({}),
      currentWindow: ref(""),
      activeTabStyles: ref({
        background: "",
        color: "",
        shadow: "",
      }),
    };
  },
  mounted() {
    this.emitter.on("newTab", () => {
      this.newTab();
    });

    this.getTabStyles();
  },
  methods: {
    getTabStyles() {
      return new Promise((resolve, reject) => {
        const wait = setInterval(function () {
          if (document.querySelector(".CodeMirror")) {
            clearInterval(wait);
            resolve();
          }
        }, 250);
      }).then(() => {
        let editor = document.querySelector(".CodeMirror");
        this.activeTabStyles.background = window
          .getComputedStyle(editor)
          .getPropertyValue("background");
        this.activeTabStyles.color = window
          .getComputedStyle(editor)
          .getPropertyValue("color");
        this.activeTabStyles.shadow =
          "0 10px 0 " +
          window
            .getComputedStyle(editor)
            .getPropertyValue("background")
            .match(/rgb\(.*\)/gi)[0];
      });
    },
    newTab() {
      let newKey = (Math.random() + 1).toString(36).substring(2);

      this.files[newKey] = {
        name: "Undefined",
        mode: "text/javascript",
      };
      this.currentWindow = newKey;
    },
    tabClickHandler(event, key, index, filename) {
      if (event.target == this.$refs["close_" + key][0]) {
        this.$q
          .dialog({
            component: ConfirmDialog,
            componentProps: {
              title: "Close - " + filename,
              message: "Your changes will be lost. Continue?",
            },
          })
          .onOk(() => {
            let newCurrent = this.currentWindow,
              keys = Object.keys(this.files);

            delete this.files[key];

            if (this.currentWindow == key) {
              newCurrent = keys[index - 1] || keys[index + 1] || "";
            }

            this.currentWindow = "";
            this.currentWindow = newCurrent;
          });
      } else {
        this.currentWindow = key;
      }
    },
  },
});
</script>
