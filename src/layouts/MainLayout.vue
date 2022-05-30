<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <div class="q-pa-sm q-pl-md row items-center header-row">
        <svg
          width="20"
          height="20"
          viewBox="0 0 1200 1270"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M300 0.794922L0 174L300 347.205V274H500V1096.25H500.003L600 1269.45L699.997 1096.25H700L700 1096.24L700 274H900V347.205L1200 174L900 0.794922V74H300V0.794922Z"
            fill="#00CFB3"
          />
        </svg>
        <div class="cursor-pointer non-selectable header-item">
          {{ this.$t("layout.file") }}
          <q-menu :transition-duration="0" no-focus no-refocus>
            <q-list dense style="min-width: 100px">
              <q-item clickable v-close-popup>
                <q-item-section @click="emit('newTab')">{{
                  this.$t("layout.newFile")
                }}</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section @click="openFile()">{{
                  this.$t("layout.openFile")
                }}</q-item-section>
                <input
                  id="openFile"
                  name="openFile"
                  type="file"
                  @change="onChooseFile"
                  style="display: none"
                />
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup>
                <q-item-section @click="saveFile()">{{
                  this.$t("layout.saveFile")
                }}</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup>
                <q-item-section>{{
                  this.$t("layout.settings")
                }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <div class="q-ml-md cursor-pointer non-selectable header-item">
          {{ this.$t("layout.edit") }}
          <q-menu auto-close :transition-duration="0" no-focus no-refocus>
            <q-list dense style="min-width: 100px">
              <q-item clickable>
                <q-item-section @click="execCommand('undo')">{{
                  this.$t("layout.undo")
                }}</q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section @click="execCommand('redo')">{{
                  this.$t("layout.redo")
                }}</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable>
                <q-item-section @click="execCommand('find')">{{
                  this.$t("layout.find")
                }}</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable>
                <q-item-section @click="execCommand('selectAll')">{{
                  this.$t("layout.selectAll")
                }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <div class="q-ml-md cursor-pointer non-selectable header-item">
          {{ this.$t("layout.view") }}
          <q-menu auto-close :transition-duration="0" no-focus no-refocus>
            <q-list dense style="min-width: 100px">
              <q-item clickable>
                <q-item-section @click="emit('sidePanel')">{{
                  this.$t("layout.connection")
                }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </div>
    </q-header>

    <q-page-container>
      <router-view ref="page" />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MainLayout",
  setup() {
    return {
      file: ref(),
    };
  },
  methods: {
    execCommand(command) {
      this.emitter.emit("execCommand", command);
    },
    emit(method) {
      this.emitter.emit(method);
    },
    onChooseFile(event) {
      let input = event.target;
      if (!input.files[0]) {
        return;
      }
      let fr = new FileReader();
      fr.onload = (event) => {
        this.emitter.emit("newTab", {
          name: input.files[0].name,
          value: event.target.result.replace(/[\r]/g, ""),
        });
      };
      fr.readAsText(input.files[0]);
    },
    openFile() {
      document.getElementById("openFile").click();
    },
    saveFile() {
      this.emitter.emit("saveFile");
    },
  },
});
</script>
