<template>
  <textarea :foldgutter="true" ref="editor"></textarea>
</template>

<script>
import { defineComponent } from "vue";
import { useWindowSize } from "vue-window-size";

// Editor
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";

// Themes
import "codemirror/theme/monokai.css";

// Modes (languages)
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/clike/clike.js";

// Brackets folding
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/markdown-fold.js";
import "codemirror/addon/fold/xml-fold.js";

// Autoclose and match for brackets
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/edit/closebrackets.js";

// Autocomplete hints
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/javascript-hint.js";
import "codemirror/addon/hint/anyword-hint.js";

// Search / Replace
import "codemirror-search-replace/src/search.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/matchesonscrollbar.js";
import "codemirror/addon/scroll/annotatescrollbar.js";

// Comments
import "codemirror/addon/comment/comment.js";

// Active line highlighting
import "codemirror/addon/selection/active-line.js";

// Refresh window once
import "codemirror/addon/display/autorefresh.js";

export default defineComponent({
  name: "code-editor",
  watch: {
    windowHeight: function () {
      this.cm.setSize(
        null,
        document.querySelector(".CodeMirror").parentElement.clientHeight
      );
    },
  },
  methods: {
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
    this.cm = CodeMirror.fromTextArea(this.$refs.editor, {
      theme: "monokai",
      mode: "text/javascript", // text/x-java text/javascript text/x-c++src text/x-csharp
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
    this.cm.setValue("console.log(123)");

    // Clear history to disable undo of the set value
    this.cm.doc.clearHistory();
    this.cm.refresh();

    // Autocomplete hints
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

    // Pass event to other components
    this.emitter.on("execCommand", (command) => {
      this.execCommand(command);
    });

    // Fixed height for the editor (important)
    this.cm.setSize(
      null,
      document.querySelector(".CodeMirror").parentElement.clientHeight
    );

    // Ask confirmation from user before leaving the page
    window.onbeforeunload = function () {
      return false;
    };
  },
});
</script>
