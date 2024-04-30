import Gradient from "../../Components/Gradient";
import Position from "../../Components/Position";
import Update from "../../Update";
import Renderer from "../Renderer";
import RenderingSystem from "../RenderingSystem";
import wgsl from './Gradient.wgsl?raw';
import GradientVertexBuffer from "./GradientVertexBuffer";

const DEFAULT_LAYER = 'GRADIENT_DEFAULT_LAYER';

export class GradientRenderer implements Renderer {
  static readonly NAME: string = 'GradientRenderer';
  readonly name: string = GradientRenderer.NAME;
  vertexBuffer: GradientVertexBuffer;
  pipeline: GPURenderPipeline;

  static create(parent: RenderingSystem) { return new GradientRenderer(parent); }

  constructor(public parent: RenderingSystem) {
    this.vertexBuffer = new GradientVertexBuffer(parent.device);

    const module = this.parent.device.createShaderModule({
      label: 'gradient module',
      code: wgsl
    });

    const pipelineLayout = this.parent.device.createPipelineLayout({
      label: 'gradient pipeline',
      bindGroupLayouts: [
        parent.globalBindGroup.layout
      ]
    });

    this.pipeline = parent.device.createRenderPipeline({
      label: `gradient pipeline`,
      layout: pipelineLayout,
      vertex: {
        module: module,
        entryPoint: 'vs',
        buffers: [this.vertexBuffer.layout]
      },
      fragment: {
        module: module,
        entryPoint: 'fs',
        targets: this.parent.colorTagets,
      },
      depthStencil: this.parent.depthStencil.state,
      primitive: this.parent.primitiveState
    });
  }

  prepare(update: Update) {
    this.vertexBuffer.reset();
    const query = update.ecs.query(Gradient, Position);
    if (query.length == 0)
      return;

    // Fill the vertex buffer
    for (const entity of query) {
      const visible = update.resolve.visibility(entity.entity);
      if (!visible)
        continue;

      const [gradient, position] = entity.components;

      const pos = update.resolve.position(entity.entity, position);

      const order = update.resolve.renderOrder(entity.entity) || DEFAULT_LAYER;

      const depth = update.resolve.depth(entity.entity);

      this.vertexBuffer.pushGradient(order, gradient, pos, depth);
    }
  }

  draw(layer: string | undefined, passEncoder: GPURenderPassEncoder): void {
    const batch = this.vertexBuffer.batches.get(layer || DEFAULT_LAYER);
    if (!batch || batch.count == 0)
      return;

    batch.writeToGPU();

    // Set the pipeline and draw
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.parent.globalBindGroup.group);
    passEncoder.setVertexBuffer(0, batch.buffer, 0, batch.size());
    passEncoder.draw(batch.instances());
  }

  cleanup(): void {
    this.vertexBuffer.cleanup();
  }
}