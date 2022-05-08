import { boot } from "quasar/wrappers";
import Peer from "peerjs";

const peer = new Peer();

export default boot(({ app }) => {
  app.config.globalProperties.peer = peer;
});
