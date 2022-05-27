<template>
  <textarea :foldgutter="true" ref="editor"></textarea>
</template>

<script>
import { defineComponent } from "vue";
import { useWindowSize } from "vue-window-size";

/** Editor */
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";

/** Themes */
import "codemirror/theme/monokai.css";

/** Language modes */
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/clike/clike.js";

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
  watch: {
    /** Watch window resize (to calculate editors height) */
    windowHeight: function () {
      this.cm.setSize(
        null,
        document.querySelector(".CodeMirror").parentElement.clientHeight
      );
    },
  },
  methods: {
    /** Codemirror command caller */
    execCommand(command) {
      this.cm.execCommand(command);
      this.cm.focus();
    },
    updateValue(value) {
      const cursor = this.cm.getCursor();
      this.cm.replaceRange(
        value,
        { line: 0, ch: 0 },
        { line: this.cm.lastLine() + 1, ch: 0 },
        "automerge"
      );
      this.cm.setCursor(cursor);
    },
  },
  setup() {
    const { height } = useWindowSize();
    return {
      windowHeight: height,
    };
  },
  mounted() {
    /** Init Codemirror instance */
    this.cm = CodeMirror.fromTextArea(this.$refs.editor, {
      theme: "monokai",
      mode: "text/javascript", // text/x-java text/javascript text/x-c++src text/x-csharp
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
