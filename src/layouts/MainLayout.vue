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
          File
          <q-menu :transition-duration="0" no-focus no-refocus>
            <q-list dense style="min-width: 100px">
              <q-item clickable v-close-popup>
                <q-item-section @click="emit('newTab')">New</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>Open...</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup>
                <q-item-section>Save</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>Save as...</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup>
                <q-item-section>Settings</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <div class="q-ml-md cursor-pointer non-selectable header-item">
          Edit
          <q-menu auto-close :transition-duration="0" no-focus no-refocus>
            <q-list dense style="min-width: 100px">
              <q-item clickable>
                <q-item-section @click="execCommand('undo')"
                  >Undo</q-item-section
                >
              </q-item>
              <q-item clickable>
                <q-item-section @click="execCommand('redo')"
                  >Redo</q-item-section
                >
              </q-item>

              <q-separator />

              <q-item clickable>
                <q-item-section>Find</q-item-section>
              </q-item>
              <q-item clickable>
                <q-item-section>Replace</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable>
                <q-item-section @click="execCommand('selectAll')"
                  >Select All</q-item-section
                >
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <div class="q-ml-md cursor-pointer non-selectable header-item">
          View
          <q-menu auto-close :transition-duration="0" no-focus no-refocus>
            <q-list dense style="min-width: 100px">
              <q-item clickable v-close-popup>
                <q-item-section>P2P Connection</q-item-section>
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
import { defineComponent } from "vue";

export default defineComponent({
  name: "MainLayout",
  methods: {
    execCommand(command) {
      this.emitter.emit("execCommand", command);
    },
    emit(method) {
      this.emitter.emit(method);
    },
  },
});
</script>
