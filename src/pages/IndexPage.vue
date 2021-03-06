<template>
  <q-page class="flex">
    <div class="q-pa-md" style="width: 100%; padding: 0 !important">
      <div
        class="greeting column"
        v-if="!Object.keys(documents).length && !$q.loading.isActive"
      >
        <svg
          width="200"
          height="200"
          viewBox="0 0 1200 1270"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M300 0.794922L0 174L300 347.205V274H500V1096.25H500.003L600 1269.45L699.997 1096.25H700L700 1096.24L700 274H900V347.205L1200 174L900 0.794922V74H300V0.794922Z"
            fill="#00CFB3"
          />
        </svg>
        <q-btn
          color="accent"
          icon="note_add"
          :label="$t('index.newFile')"
          @click="newTab()"
        />
      </div>

      <div class="tabs row no-wrap">
        <div
          class="tab"
          :style="{
            background: key == currentTab ? activeTabStyles.background : '',
          }"
          v-for="(document, key, index) in documents"
          :key="key"
          @click="tabClickHandler($event, key, index, document.name)"
        >
          <input
            :style="{
              color: key == currentTab ? activeTabStyles.color : '',
            }"
            type="text"
            autocomplete="off"
            v-model="document.name"
            readonly="true"
            ondblclick="this.readOnly=''"
            onblur="this.readOnly='true'"
            @blur="updateDocName(key)"
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
            :value="automerge[key].value.toString()"
          ></code-editor>
        </div>
        <div
          class="side-panel col-3 order-last"
          v-if="store.sidePanel && Object.keys(documents).length"
        >
          <div class="close" @click="store.toggleSidePanel()">
            <i
              class="q-icon notranslate material-icons"
              aria-hidden="true"
              role="presentation"
              >close</i
            >
          </div>
          <div class="row side-panel-row">
            <input type="text" :value="connectUrl + peerId" disabled />
            <q-btn flat color="color" icon="content_copy" @click="copyLink" />
            <div class="peers-count">
              <div
                class="led"
                :style="{
                  'background-color':
                    Object.keys(connectedPeers).length == 0
                      ? 'var(--q-negative)'
                      : 'var(--q-positive)',
                  'box-shadow':
                    Object.keys(connectedPeers).length == 0
                      ? '0 0 5px var(--q-negative)'
                      : '0 0 5px var(--q-positive)',
                }"
              ></div>
              <span class="counter"
                >{{ Object.keys(connectedPeers).length }}
                {{ $t("index.peer.counter") }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, computed, ref } from "vue";
import { useQuasar, useMeta } from "quasar";
import { useStore } from "stores/main";
import CodeEditor from "components/code-editor";
import ShowDialog from "components/show-dialog";
import * as Automerge from "automerge";

export default defineComponent({
  name: "IndexPage",
  components: {
    CodeEditor,
  },
  computed: {
    theme() {
      return this.store.editorTheme;
    },
  },
  watch: {
    theme: function () {
      this.updateTabStyles();
    },
  },
  setup() {
    const $q = useQuasar();
    const store = useStore();

    const dark =
      localStorage.getItem("dark") !== null
        ? JSON.parse(localStorage.getItem("dark"))
        : $q.dark.isActive;

    $q.dark.set(dark);

    const theme = localStorage.getItem("theme");
    if (theme) {
      store.setEditorTheme(theme);
    }

    return {
      automerge: Automerge.init(),
      documents: ref({}),
      currentTab: ref(""),
      activeTabStyles: ref({
        background: "",
        color: "",
        shadow: "",
      }),
      peerId: ref(""),
      connectUrl: ref(""),
      connectedPeers: ref({}),
      store,
    };
  },
  mounted() {
    const appTitle = computed(() => this.$t("appTitle"));

    useMeta(() => {
      return { title: appTitle.value };
    });

    this.connectUrl =
      window.location.origin + window.location.pathname + "?connect=";

    /** Event bus handlers */
    this.emitter.on("newTab", (data) => {
      if (data) {
        this.newTab(data.name, data.value);
      } else {
        this.newTab();
      }
    });
    this.emitter.on("handleChanges", (data) => {
      this.handleChanges(data);
    });
    this.emitter.on("handleCursorActivity", (data) => {
      this.handleCursorActivity(data);
    });
    this.emitter.on("execCommand", (command) => {
      this.emitter.emit("execCommand" + this.currentTab, command);
    });
    this.emitter.on("saveFile", () => {
      this.saveFile();
    });

    this.updateTabStyles();

    /** PeerJs */
    this.peer.on("open", (id) => {
      this.peerId = id;

      /** Connect peers on load */
      if (this.$route.query.hasOwnProperty("connect")) {
        this.connect();
      }
    });

    this.peer.on("connection", (connection) => {
      connection.on("open", () => {
        this.addStyleTag(connection.peer);

        /** Send object snapshot */
        let changes = [];
        const automergeChanges = Automerge.getChanges(
          Automerge.init(),
          this.automerge
        );

        for (const change of automergeChanges) {
          changes.push(change.toString());
        }
        connection.send({
          type: "input",
          changes: changes,
        });

        this.connectedPeers[connection.peer] = connection;

        connection.on("data", (data) => {
          switch (data.type) {
            case "input":
              /** Build Uint8Array from string */
              changes = [];
              for (const change of data.changes) {
                changes.push(
                  Uint8Array.from(
                    change.replace("[", "").replace("]", "").split(",")
                  )
                );
              }

              /** Apply changes to automerge */
              let patch;
              [this.automerge, patch] = Automerge.applyChanges(
                this.automerge,
                changes
              );

              /** Apply changes to reactive object */
              let newDocuments = {};
              Object.keys(this.automerge).forEach((i) => {
                newDocuments[i] = {
                  name: this.automerge[i].name,
                };
              });
              this.documents = newDocuments;

              /** Update editor content */
              Object.keys(this.automerge).forEach((i) => {
                this.emitter.emit(
                  "updateValue" + i,
                  this.automerge[i].value.toString()
                );
              });

              /** Set new active tab */
              if (!this.documents.hasOwnProperty(this.currentTab)) {
                this.currentTab = Object.keys(this.documents)[0];
              }

              /** Broadcast change to other peers */
              this.broadcast(data, connection.peer);
              break;
            case "cursor":
              this.emitter.emit("setAnchor" + data.changes.key, {
                peerId: connection.peer,
                ...data.changes,
              });
              break;
          }
        });
      });
      connection.on("close", () => {
        this.onConnectionClose(connection.peer);
      });
    });

    this.peer.on("disconnected", () => {
      this.peer.reconnect();
      setTimeout(() => {
        if (this.peer.disconnected) {
          this.$q.dialog({
            component: ShowDialog,
            componentProps: {
              title: this.$t("errorTitle"),
              message: this.$t("index.peer.disconnectedMessage"),
              cancelBtn: false,
            },
          });
        }
      }, 5000);
    });

    this.peer.on("error", (err) => {
      if (err.type == "peer-unavailable" || err.type == "server-error") {
        this.$q.loading.hide();
        this.$q.dialog({
          component: ShowDialog,
          componentProps: {
            title: this.$t("errorTitle"),
            message: this.$t("index.peer.errorMessage"),
            cancelBtn: false,
          },
        });
      }
    });
  },
  methods: {
    updateTabStyles() {
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
    addStyleTag(peerId) {
      let total = 0;
      for (let c of peerId) total += c.charCodeAt(0);

      let hex = total.toString(16);
      while (hex.length < 3) hex += hex[hex.length - 1];
      hex = hex.substr(0, 3);

      let color = "#";
      for (let c of hex) color += `${c}0`;

      let style = document.createElement("style");
      style.type = "text/css";
      style.setAttribute("id", peerId);
      style.appendChild(
        document.createTextNode(`
        .selection-${peerId} {
          background-color: ${color};
        }
        .left-${peerId} {
          box-shadow: -1px 0 0 0 ${color};
          animation: cursor-left 1s step-end infinite;
        }
        .right-${peerId} {
          box-shadow: 1px 0 0 0 ${color};
          animation: cursor-right 1s step-end infinite;
        }
      `)
      );
      document.getElementsByTagName("head")[0].appendChild(style);
    },
    copyLink() {
      const clipboardData = window.clipboardData || navigator.clipboard;

      clipboardData.writeText(this.connectUrl + this.peerId);
    },
    newTab(name = "Undefined", value = "") {
      let newKey = (Math.random() + 1).toString(36).substring(2);

      /** Make change */
      this.automerge = Automerge.change(this.automerge, "newTab", (docs) => {
        docs[newKey] = {
          name: name,
          value: new Automerge.Text(value),
        };
      });

      this.documents[newKey] = {
        name: name,
      };

      /** Broadcast change */
      let change = Automerge.getLastLocalChange(this.automerge);
      this.broadcast({
        type: "input",
        changes: [change.toString()],
      });

      this.currentTab = newKey;
    },
    closeTab(key, index) {
      let newCurrent = this.currentTab,
        keys = Object.keys(this.documents);

      /** Make change */
      this.automerge = Automerge.change(this.automerge, "closeTab", (docs) => {
        delete docs[key];
      });

      delete this.documents[key];

      /** Broadcast change */
      let change = Automerge.getLastLocalChange(this.automerge);
      this.broadcast({
        type: "input",
        changes: [change.toString()],
      });

      if (this.currentTab == key) {
        newCurrent = keys[index - 1] || keys[index + 1] || "";
      }

      this.currentTab = "";
      this.currentTab = newCurrent;
    },
    tabClickHandler(event, key, index, name) {
      if (event.target == this.$refs["close_" + key][0]) {
        if (!this.automerge[key].value.length) {
          this.closeTab(key, index);
          return;
        }

        this.currentTab = key;
        this.$q
          .dialog({
            component: ShowDialog,
            componentProps: {
              title: this.$t("index.fileCloseTitle") + name,
              message: this.$t("index.changesLostMessage"),
            },
          })
          .onOk(() => {
            this.closeTab(key, index);
          });
      } else {
        this.currentTab = key;
      }
      this.emitter.emit("refresh" + key);
    },
    updateDocName(key) {
      /** Make change */
      this.automerge = Automerge.change(this.automerge, "changes", (docs) => {
        docs[key].name = this.documents[key].name;
      });

      /** Broadcast change */
      let change = Automerge.getLastLocalChange(this.automerge);
      this.broadcast({
        type: "input",
        changes: [change.toString()],
      });
    },
    /** Make changes to Automerge */
    handleChanges(data) {
      if (data.origin == "automerge") return;

      /** Make change */
      this.automerge = Automerge.change(this.automerge, "changes", (docs) => {
        docs[data.key].value.deleteAt(data.stIndex, data.delta);
        docs[data.key].value.insertAt(data.stIndex, ...data.text.split(""));
      });

      /** Broadcast change */
      let change = Automerge.getLastLocalChange(this.automerge);
      this.broadcast({
        type: "input",
        changes: [change.toString()],
      });

      /** Apply changes to reactive object */
      let newDocuments = {};
      Object.keys(this.automerge).forEach((i) => {
        newDocuments[i] = {
          name: this.automerge[i].name,
        };
      });
      this.documents = newDocuments;
    },
    /** Send user's cursor activity to peers */
    handleCursorActivity(data) {
      this.broadcast({
        type: "cursor",
        changes: data,
      });
    },
    /** Save file */
    saveFile() {
      if (!this.automerge[this.currentTab].value.length) return;

      let pom = document.createElement("a");
      pom.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," +
          encodeURIComponent(this.automerge[this.currentTab].value)
      );
      pom.setAttribute("download", this.automerge[this.currentTab].name);

      if (document.createEvent) {
        let event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        pom.dispatchEvent(event);
      } else {
        pom.click();
      }
    },
    /** Connect to peer */
    connect() {
      let connection = this.peer.connect(this.$route.query.connect);

      this.store.toggleSidePanel();

      this.$q.loading.show({
        message: this.$t("index.peer.connectingMessage"),
      });

      connection.on("open", () => {
        this.$q.loading.hide();
        this.connectedPeers[connection.peer] = connection;
        this.addStyleTag(connection.peer);

        connection.on("data", (data) => {
          switch (data.type) {
            case "input":
              /** Build Uint8Array from string */
              let changes = [];
              for (const change of data.changes) {
                changes.push(
                  Uint8Array.from(
                    change.replace("[", "").replace("]", "").split(",")
                  )
                );
              }

              /** Apply changes to automerge */
              let patch;
              [this.automerge, patch] = Automerge.applyChanges(
                this.automerge,
                changes
              );

              /** Apply changes to reactive object */
              let newDocuments = {};
              Object.keys(this.automerge).forEach((i) => {
                newDocuments[i] = {
                  name: this.automerge[i].name,
                };
              });
              this.documents = newDocuments;

              /** Update editor content */
              Object.keys(this.automerge).forEach((i) => {
                this.emitter.emit(
                  "updateValue" + i,
                  this.automerge[i].value.toString()
                );
              });

              /** Set new active tab */
              if (!this.documents.hasOwnProperty(this.currentTab)) {
                this.currentTab = Object.keys(this.documents)[0];
              }

              /** Broadcast change to other peers */
              this.broadcast(data, connection.peer);
              break;
            case "cursor":
              this.emitter.emit("setAnchor" + data.changes.key, {
                peerId: connection.peer,
                ...data.changes,
              });
              break;
          }
        });
      });
      connection.on("close", () => {
        this.onConnectionClose(connection.peer);
      });
    },
    onConnectionClose(peerId) {
      delete this.connectedPeers[peerId];
      this.emitter.emit("removeAnchor", peerId);

      let style = document.getElementById(peerId);
      style.parentNode.removeChild(style);
    },
    /** Send changes */
    broadcast(data, exclude = "") {
      Object.keys(this.connectedPeers).forEach((i) => {
        if (i != exclude) {
          this.connectedPeers[i].send(data);
        }
      });
    },
  },
});
</script>
