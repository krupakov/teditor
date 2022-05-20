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

/** Refresh tab on load */
import "codemirror/addon/display/autorefresh.js";

export default defineComponent({
  name: "code-editor",
  props: {
    documentKey: String,
    mode: String,
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
    /** Watch document content prop for update */
    value: function () {
      if (this.value == this.cm.getValue()) {
        return;
      }

      const cursor = this.cm.getCursor();
      this.cm.setValue(this.value);
      this.cm.setCursor(cursor);
    },
  },
  methods: {
    /** Codemirror command caller */
    execCommand(command) {
      this.cm.execCommand(command);
      this.cm.focus();
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
      mode: this.mode || "text/javascript",
      lineNumbers: true,
      lineWrapping: true,
      styleActiveLine: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      autoRefresh: true,
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

    /** Updating document content prop */
    this.cm.on("change", (cm) => {
      this.emitter.emit("setDocumentValue", {
        key: this.documentKey,
        value: cm.getValue(),
      });
    });

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

    /** Handle event call from other components */
    this.emitter.on("execCommand", (command) => {
      this.execCommand(command);
    });

    /** Setting fixed size for the editor */
    this.cm.setSize(
      null,
      document.querySelector(".CodeMirror").parentElement.clientHeight
    );

    /** Asking user to confirm before leaving the page */
    window.onbeforeunload = function () {
      return false;
    };
  },
});
</script>
