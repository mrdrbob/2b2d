import { Layer } from "../Layer";
import Update from "../Update";

export default interface Renderer {
  name: string,
  beginFrame(update:Update): void;
  drawLayer(passEncoder:GPURenderPassEncoder, layer:Layer): void;
  endFrame(): void;
  cleanup(): void;
}
