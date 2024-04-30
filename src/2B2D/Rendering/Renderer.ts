import Update from "../Update";
import RenderingSystem from "./RenderingSystem";

export default interface Renderer {
  name: string,
  prepare(update: Update): void;
  draw(layer: string | undefined, passEncoder: GPURenderPassEncoder): void;
  cleanup(): void;
}

export type CreateRenderer = (parent: RenderingSystem) => Renderer;
