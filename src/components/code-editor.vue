<template>
  <textarea :foldgutter="true" ref="editor"></textarea>
</template>

<script>
import { defineComponent } from "vue";
import { useStore } from "stores/main";
import { useWindowSize } from "vue-window-size";

/** Editor */
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";

/** Themes */
import "codemirror/theme/dracula.css";
import "codemirror/theme/eclipse.css";
import "codemirror/theme/idea.css";
import "codemirror/theme/lucario.css";
import "codemirror/theme/mbo.css";
import "codemirror/theme/material.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/moxer.css";
import "codemirror/theme/neat.css";
import "codemirror/theme/nord.css";
import "codemirror/theme/oceanic-next.css";
import "codemirror/theme/paraiso-light.css";
import "codemirror/theme/yonce.css";

/** Language modes */
import "codemirror/mode/clike/clike.js";
import "codemirror/mode/go/go.js";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/php/php.js";
import "codemirror/mode/python/python.js";
import "codemirror/mode/ruby/ruby.js";
import "codemirror/mode/rust/rust.js";
import "codemirror/mode/swift/swift.js";

/** Code folding */
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/markdown-fold.js";
import "codemirror/addon/fold/xml-fold.js";

/** Autoclose / Match brackets */
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/edit/closebrackets.js";

/** Hints */
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/javascript-hint.js";
import "codemirror/addon/hint/anyword-hint.js";

/** Search / Replace */
import "codemirror-search-replace/src/search.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/matchesonscrollbar.js";
import "codemirror/addon/scroll/annotatescrollbar.js";

/** Comments */
import "codemirror/addon/comment/comment.js";

/** Line highlighting */
import "codemirror/addon/selection/active-line.js";

export default defineComponent({
  name: "code-editor",
  props: {
    documentKey: String,
    value: String,
  },
  computed: {
    theme() {
      return this.store.editorTheme;
    },
    mode() {
      return this.store.editorMode;
    },
  },
  watch: {
    /** Watch window resize (to calculate editors height) */
    windowHeight: function () {
      this.cm.setSize(
        null,
        document.querySelector(".CodeMirror").parentElement.clientHeight
      );
    },
    theme: function () {
      this.cm.setOption("theme", this.store.editorTheme.toLowerCase());
    },
    mode: function () {
      this.cm.setOption("mode", this.cmMode(this.store.editorMode));
    },
  },
  methods: {
    /** Codemirror command caller */
    execCommand(command) {
      this.cm.execCommand(command);
      this.cm.focus();
    },
    /** Translate lang name to Codemirror mode value */
    cmMode(mode) {
      switch (mode) {
        case "C++":
          return "text/x-c++src";
        case "C#":
          return "text/x-csharp";
        case "JavaScript":
          return "text/javascript";
        case "Rust":
          return "text/x-rustsrc";
        case "Go":
        case "Java":
        case "PHP":
        case "Python":
        case "Ruby":
        case "Swift":
          return "text/x-" + mode.toLowerCase();
        default:
          return "text/javascript";
      }
    },
    updateValue(value) {
      const view = this.cm.getScrollInfo();
      const cursor = this.cm.getCursor();
      const selections = this.cm.listSelections();

      this.cm.replaceRange(
        value,
        { line: 0, ch: 0 },
        { line: this.cm.lastLine() },
        "automerge"
      );

      setTimeout(() => {
        this.cm.setCursor(cursor);
        this.cm.scrollTo(view.left, view.top);
        this.cm.setSelections(selections, null, {
          scroll: false,
        });
      }, 0);
    },
    setAnchor(data) {
      this.removeAnchor(data.peerId);

      let stPos, edPos;
      this.anchorMap[data.peerId] = [];

      if (data.stIndex !== data.edIndex) {
        stPos = this.cm.posFromIndex(data.stIndex);
        edPos = this.cm.posFromIndex(data.edIndex);

        this.anchorMap[data.peerId].push(
          this.cm.markText(stPos, edPos, {
            className: "selection selection-" + data.peerId,
          })
        );
      }

      if (data.stIndex === data.edIndex) {
        data.stIndex = Math.max(0, data.stIndex - 1);
      }

      const index = data.prefixed ? data.stIndex : data.edIndex;
      stPos = this.cm.posFromIndex(index + (data.prefixed ? 0 : -1));
      edPos = this.cm.posFromIndex(index + (data.prefixed ? 1 : 0));

      this.anchorMap[data.peerId].push(
        this.cm.markText(stPos, edPos, {
          className:
            " cursor " +
            (data.prefixed ? "left-" + data.peerId : "right-" + data.peerId),
        })
      );
    },
    removeAnchor(peerId) {
      if (peerId in this.anchorMap) {
        this.anchorMap[peerId].forEach((m) => m.clear());
        delete this.anchorMap[peerId];
      }
    },
  },
  setup() {
    const store = useStore();
    const { height } = useWindowSize();
    return {
      windowHeight: height,
      anchorMap: {},
      store,
    };
  },
  mounted() {
    /** Init Codemirror instance */
    this.cm = CodeMirror.fromTextArea(this.$refs.editor, {
      theme: this.store.editorTheme.toLowerCase() || "neat",
      mode: this.cmMode(this.store.editorMode),
      lineNumbers: true,
      lineWrapping: true,
      styleActiveLine: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      tabSize: 2,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      foldGutter: true,
      extraKeys: {
        "Cmd-/": "toggleComment",
        "Ctrl-/": "toggleComment",
      },
    });
    this.cm.setValue(this.value);

    /** Clear history on load */
    this.cm.doc.clearHistory();
    this.cm.refresh();

    /** Enable hints on user input */
    this.cm.on("inputRead", function (cm) {
      if (cm.state.completionActive) {
        return;
      }
      let cur = cm.getCursor();
      let token = cm.getTokenAt(cur);
      if (token.type && token.type != "comment") {
        CodeMirror.commands.autocomplete(cm, null, {
          completeSingle: false,
        });
      }
    });

    /** Make changes to Automerge */
    this.cm.on("change", (cm, change) => {
      this.emitter.emit("handleChanges", {
        key: this.documentKey,
        origin: change.origin,
        stIndex: cm.indexFromPos(change.from),
        delta: change.removed.join("\n").length,
        text: change.text.join("\n"),
      });
    });

    /** Send user's cursor activity to peers */
    this.cm.on("cursorActivity", (cm) => {
      const stIndex = cm.indexFromPos(cm.getCursor("start")),
        edIndex = cm.indexFromPos(cm.getCursor("end")),
        hdIndex = cm.indexFromPos(cm.getCursor("head"));

      const prefixed = hdIndex === stIndex && stIndex !== edIndex;

      this.emitter.emit("handleCursorActivity", {
        key: this.documentKey,
        stIndex: stIndex,
        edIndex: edIndex,
        prefixed: prefixed,
      });
    });

    /** Handle event call from other components */
    this.emitter.on("execCommand" + this.documentKey, (command) => {
      this.execCommand(command);
    });

    /** Refresh on call */
    this.emitter.on("refresh" + this.documentKey, () => {
      setTimeout(() => {
        this.cm.refresh();
      }, 1);
    });

    /** Update editor content on call */
    this.emitter.on("updateValue" + this.documentKey, (value) => {
      this.updateValue(value);
    });

    /** Show cursor activity of other users */
    this.emitter.on("setAnchor" + this.documentKey, (data) => {
      this.setAnchor(data);
    });

    /** Remove cursor activity of a user */
    this.emitter.on("removeAnchor", (peerId) => {
      this.removeAnchor(peerId);
    });

    /** Set fixed size for the editor */
    this.cm.setSize(
      null,
      document.querySelector(".CodeMirror").parentElement.clientHeight
    );

    /** Ask user to confirm before leaving the page */
    window.onbeforeunload = function () {
      return false;
    };
  },
});
</script>
