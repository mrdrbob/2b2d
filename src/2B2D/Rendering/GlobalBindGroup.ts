import Vec2 from "../Math/Vec2";

export default class GlobalBindGroup {
  sampler: GPUSampler;
  values: Float32Array;
  buffer: GPUBuffer;
  layout: GPUBindGroupLayout;
  group: GPUBindGroup;

  private lastZoom: Vec2 = Vec2.ONE;
  private lastCameraPosition: Vec2 = Vec2.ZERO;

  constructor(private device: GPUDevice) {
    this.sampler = device.createSampler({
      magFilter: 'nearest',
      minFilter: 'nearest',
    });

    this.values = new Float32Array([
      1, 1, // Zoom
      0, 0, // Camera position
    ]);

    this.buffer = device.createBuffer({
      label: 'global uniform',
      size: this.values.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    this.layout = device.createBindGroupLayout({
      label: 'Global bind group layout',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }, // Global uniform
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} }, // Sampler
      ]
    });

    this.group = device.createBindGroup({
      label: 'Global bind group',
      layout: this.layout,
      entries: [
        { binding: 0, resource: { buffer: this.buffer } },
        { binding: 1, resource: this.sampler }
      ]
    });
  }

  update(zoom: Vec2, cameraPosition: Vec2) {
    const noChange =
      this.lastZoom.x == zoom.x &&
      this.lastZoom.y == zoom.y &&
      this.lastCameraPosition.x == cameraPosition.x &&
      this.lastCameraPosition.y == cameraPosition.y
      ;

    if (noChange) {
      return;
    }

    this.values.set([
      zoom.x, zoom.y,
      cameraPosition.x, cameraPosition.y
    ], 0);
    this.device.queue.writeBuffer(this.buffer, 0, this.values);

    this.lastZoom = zoom;
    this.lastCameraPosition = cameraPosition;
  }
}