<template>
  <q-page class="flex">
    <div class="q-pa-md" style="width: 100%; padding: 0 !important">
      <q-card>
        <q-tabs v-model="tab" align="left" dense>
          <q-tab name="tab1" label="Tab 1" :ripple="false" />
        </q-tabs>

        <q-tab-panels v-model="tab" keep-alive>
          <q-tab-panel
            name="tab1"
            style="padding: 0; height: calc(100vh - 75px)"
          >
            <input type="text" v-model="input" />
            <div>{{ peerId }}</div>
            <button @click="connect()">Connect</button>
            <div>{{ status }}</div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "TestT",
  methods: {
    connect() {
      this.dataConnection = this.peer.connect(this.input);
      this.dataConnection.on("open", () => (this.status = "OK!"));
      this.dataConnection.on("close", () => (this.status = "OH SHIT!"));
    },
  },
  setup() {
    return {
      tab: ref("tab1"),
      input: ref(""),
      peerId: ref(""),
      status: ref(""),
      dataConnection: null,
    };
  },
  mounted() {
    this.peer.on("open", (id) => {
      this.peerId = id;
    });

    this.peer.on("connection", (c) => {
      this.dataConnection = c;
      this.dataConnection.on("open", () => (this.status = "OK!"));
      this.dataConnection.on("close", () => (this.status = "OH SHIT!"));
    });
  },
});
</script>
