import Component from "../Component";
import Camera from "../Components/Camera";
import Position from "../Components/Position";
import Vec2 from "../Math/Vec2";
import Update from "../Update";
import Renderer from "./Renderer";

const quadTriangles = new Float32Array(
  [-0.5, -0.5,
    0.5, 0.5,
    0.5, -0.5,

   -0.5, -0.5,
   -0.5, 0.5,
    0.5, 0.5]
);

export type CreateRenderer = (system:RenderingSystem) => Renderer;

export default class RenderingSystem {
  device!: GPUDevice;
  context!: GPUCanvasContext;
  presentationFormat!: GPUTextureFormat;
  vertexBufferLayout!: GPUVertexBufferLayout;
  vertexBuffer!: GPUBuffer;
  worldUniformBuffer!: GPUBuffer;
  worldUniformBufferValues!: Float32Array;
  frameUniformBufferValues!: Float32Array;
  frameUniformBuffer!: GPUBuffer;
  sampler!: GPUSampler;

  width = 800;
  height = 600;
  zoom = 8;


  async init() {
    const canvas = this.initCanvas();

    const adapter = await navigator.gpu?.requestAdapter();
    this.device = await adapter?.requestDevice()!;

    this.context = canvas.getContext('webgpu')! as GPUCanvasContext;
    this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: this.presentationFormat,
    });

    this.createQuadVertexBuffer();
    this.createWorldUniformBuffer();
    this.createFrameUniformBuffer();
    this.createSampler();
  }

  initCanvas() {
    const gameDiv = document.getElementById('game')!;
    const canvas = document.createElement('canvas');
    canvas.width = this.width * (window.devicePixelRatio || 1);
    canvas.height = this.height * (window.devicePixelRatio || 1);
    canvas.style.width = this.width + 'px';
    canvas.style.height = this.height + 'px';

    gameDiv.appendChild(canvas);
    return canvas;
  }

  // A vertex buffer with two triangles that make a square
  // Edges are in the range of -0.5 and 0.5
  private createQuadVertexBuffer() {
    this.vertexBufferLayout = {
      arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT, // vec2f * 4 bytes
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x2" // vec2f
        }
      ],
      stepMode: 'vertex'
    };
  
    this.vertexBuffer = this.device.createBuffer({
      size: quadTriangles.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
  
    new Float32Array(this.vertexBuffer.getMappedRange()).set(quadTriangles);
    this.vertexBuffer.unmap();
  }

  // Uniform buffer of screen width and height inversions
  private createWorldUniformBuffer() {
    this.worldUniformBufferValues = new Float32Array([
      (this.zoom) / (this.width), (this.zoom) / (this.height)
    ]);
    this.worldUniformBuffer = this.device.createBuffer({
      label: 'world uniform buffer',
      size: this.worldUniformBufferValues.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    this.device.queue.writeBuffer(this.worldUniformBuffer, 0, this.worldUniformBufferValues);
  }

  // Uniform buffer for the camera position
  private createFrameUniformBuffer() {
    // Frame uniform buffer
    this.frameUniformBufferValues = new Float32Array([
      0, 0 // Camera position
    ]);
    this.frameUniformBuffer = this.device.createBuffer({
      label: 'frame uniform buffer',
      size: this.frameUniformBufferValues.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
  }

  // The nearest neighbor sampler shared between pipelines
  private createSampler() {
    this.sampler = this.device.createSampler({
      magFilter: 'nearest',
      minFilter: 'nearest',
    })
  }

  draw(update:Update) {
    // Get a list of renderers that are ready to execute
    const renderers = Array.from(update.data.renderers.values());
    if (renderers.length === 0)
      return;

    let cameraPosition = new Vec2(0, 0);
    const camera = update.single([ Camera, Position.NAME ]);
    if (camera) {
      const [ _, position ] = camera.components as [ Component, Position ];
      cameraPosition = update.resolvePosition(camera.entity, position);
    }

    // Start the GPU stuff.
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
    };
  
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);

    this.frameUniformBufferValues.set([cameraPosition.x, cameraPosition.y]);
    this.device.queue.writeBuffer(this.frameUniformBuffer, 0, this.frameUniformBufferValues, 0);

    for (const renderer of renderers) {
      renderer.beginFrame(update);
    }

    for (const layer of update.data.layers) {
      for (const renderer of renderers) {
        renderer.drawLayer(passEncoder, layer);
      }
    }

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);

    for (const renderer of renderers) {
      renderer.endFrame();
    }
  }
}