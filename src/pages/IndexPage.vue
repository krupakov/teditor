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
            background: key == currentTab ? activeTabStyles.background : '',
          }"
          v-for="(document, key, index) in documents"
          :key="key"
          @click="
            tabClickHandler($event, key, index, document.name, !!document.value)
          "
        >
          <input
            :style="{
              color: key == currentTab ? activeTabStyles.color : '',
            }"
            type="text"
            autocomplete="off"
            :value="document.name"
            disabled
          />
          <div
            :style="{
              color: key == currentTab ? activeTabStyles.color : '',
            }"
            class="tab-close"
            :ref="'close_' + key"
          ></div>
        </div>
        <div
          class="tab-add"
          v-if="Object.keys(documents).length"
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
          v-for="(document, key) in documents"
          :key="'tab_' + key"
          v-show="key == currentTab"
        >
          <code-editor
            :ref="'editor_' + key"
            :documentKey="key"
            :mode="document.mode"
            v-model:value="document.value"
          ></code-editor>
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
      documents: ref({}),
      currentTab: ref(""),
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
    this.emitter.on("setDocumentValue", (data) => {
      this.setDocumentValue(data.key, data.value);
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

      this.documents[newKey] = {
        name: "Undefined",
        mode: "", // text/x-java text/javascript text/x-c++src text/x-csharp
        value: "",
      };
      this.currentTab = newKey;
    },
    closeTab(key, index) {
      let newCurrent = this.currentTab,
        keys = Object.keys(this.documents);

      delete this.documents[key];

      if (this.currentTab == key) {
        newCurrent = keys[index - 1] || keys[index + 1] || "";
      }

      this.currentTab = "";
      this.currentTab = newCurrent;
    },
    tabClickHandler(event, key, index, name, isEdited) {
      if (event.target == this.$refs["close_" + key][0]) {
        if (!isEdited) {
          this.closeTab(key, index);
          return;
        }

        this.currentTab = key;
        this.$q
          .dialog({
            component: ConfirmDialog,
            componentProps: {
              title: "Close - " + name,
              message: "Your changes will be lost. Continue?",
            },
          })
          .onOk(() => {
            this.closeTab(key, index);
          });
      } else {
        this.currentTab = key;
      }
    },
    setDocumentValue(key, value) {
      this.documents[key].value = value;
    },
  },
});
</script>
