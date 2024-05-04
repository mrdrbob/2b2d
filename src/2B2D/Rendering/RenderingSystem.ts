import Camera from "../Components/Camera";
import Position from "../Components/Position";
import Update from "../Update";
import GlobalBindGroup from "./GlobalBindGroup";
import Renderer from "./Renderer";
import { createColorTargets, createDepthStencil, createQuadVertexBuffer, initCanvas } from "./Utilities";

export default class RenderingSystem {
  context: GPUCanvasContext;
  presentationFormat: GPUTextureFormat;
  quadBuffer: { layout: GPUVertexBufferLayout; buffer: GPUBuffer; };
  globalBindGroup: GlobalBindGroup;
  renderOrder: string[] = [];
  defaultDepth: number = 0.5;

  renderers = new Array<Renderer>();
  colorTagets: GPUColorTargetState[];
  primitiveState: GPUPrimitiveState;
  depthStencil: { texture: GPUTexture; attachment: GPURenderPassDepthStencilAttachment; state: GPUDepthStencilState; };

  constructor(public device: GPUDevice, public width: number, public height: number) {
    const canvas = initCanvas(width, height);

    this.context = canvas.getContext('webgpu')! as GPUCanvasContext;
    this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.presentationFormat,
    });

    this.quadBuffer = createQuadVertexBuffer(this.device);
    this.globalBindGroup = new GlobalBindGroup(this.device);
    this.colorTagets = createColorTargets(this.presentationFormat);
    this.primitiveState = { topology: 'triangle-list' };
    this.depthStencil = createDepthStencil(this.device, this.width, this.height);
  }

  draw(update: Update) {
    const query = update.ecs.single(Camera, Position);
    if (!query)
      return;

    const [camera, position] = query.components;
    const pos = update.resolve.position(query.entity, position).roundTens();
    this.globalBindGroup.update(camera.zoom, pos);

    const commandEncoder = this.device.createCommandEncoder();
    const renderPassDescriptor: GPURenderPassDescriptor = {
      label: 'renderer pass',
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView({ label: 'Color attachment texture view' }),
          clearValue: [0.3, 0.3, 0.3, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
      depthStencilAttachment: this.depthStencil.attachment,
    };

    for (const renderer of this.renderers) {
      renderer.prepare(update);
    }
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    for (const renderer of this.renderers) {
      renderer.draw(undefined, passEncoder);
    }
    for (const layer of this.renderOrder) {
      for (const renderer of this.renderers) {
        renderer.draw(layer, passEncoder);
      }
    }

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }
}