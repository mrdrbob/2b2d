import Vec2 from "../../Math/Vec2";

const VEC2_PER_QUAD = 3;
const FLOATS_PER_VEC2 = 2;
const MAX_TILEMAPS = 256;

const INSTANCE_SIZE = VEC2_PER_QUAD * FLOATS_PER_VEC2;
const INSTANCE_SIZE_BYTES = INSTANCE_SIZE * Float32Array.BYTES_PER_ELEMENT;

export default class TilemapBindGroup {
  layout: GPUBindGroupLayout;

  instances = new Map<string, TilemapFrameInstance>();
  groupsToRender = new Map<string, TilemapFrameInstance[]>();
  array: Float32Array;
  buffer: GPUBuffer;
  needsUpdate: boolean = false;

  count: number = 0;
  stride: number;


  constructor(public device: GPUDevice) {
    this.stride = Math.ceil(INSTANCE_SIZE_BYTES / device.limits.minUniformBufferOffsetAlignment) * device.limits.minUniformBufferOffsetAlignment;
    this.array = new Float32Array(this.stride * MAX_TILEMAPS)

    this.layout = device.createBindGroupLayout({
      label: 'tilemap bindgroup',
      entries: [
        { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform', hasDynamicOffset: true } }, // Quad details
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'uint' } }, // Atlas texture
        { binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} }, // Source texture
      ]
    });
    this.buffer = device.createBuffer({
      label: `tilemap quad buffer`,
      size: this.array.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  push(enitity: number, frame: number, layer: string, textureView: GPUTextureView, atlasView: GPUTextureView, position: Vec2, depth: number, size: Vec2, gridSize: number) {
    const cacheId = `${enitity}:${frame}`;
    let group = this.instances.get(cacheId);
    let arrayRequiresUpdate = false;
    if (group) {
      arrayRequiresUpdate = group.hasChanged(position, depth, size, gridSize);
    } else {
      const bindgroup = this.device.createBindGroup({
        label: `tilemap group ${cacheId}`,
        layout: this.layout,
        entries: [
          // Quad
          {
            binding: 0,
            resource: {
              buffer: this.buffer,
              offset: 0,
              size: INSTANCE_SIZE_BYTES * MAX_TILEMAPS
            }
          },
          { binding: 1, resource: atlasView }, // Atlas
          { binding: 2, resource: textureView }, // Source 
        ]
      });

      group = new TilemapFrameInstance(position, size, gridSize, bindgroup, this.count);
      this.instances.set(cacheId, group);

      this.count += 1;

      arrayRequiresUpdate = true;
    }

    if (arrayRequiresUpdate) {
      this.array.set(
        [
          position.x, position.y,
          size.x, size.y,
          depth, gridSize
        ],
        group.count * INSTANCE_SIZE
      );

      this.device.queue.writeBuffer(
        this.buffer,
        group.count * this.stride,
        this.array,
        group.count * INSTANCE_SIZE,
        INSTANCE_SIZE
      );

      this.needsUpdate = true;
    }

    let layerBatch = this.groupsToRender.get(layer);
    if (!layerBatch) {
      layerBatch = [];
      this.groupsToRender.set(layer, layerBatch);
    }
    layerBatch.push(group);
  }

  reset() {
    this.groupsToRender.clear();
    this.needsUpdate = false;
  }

  cleanup() {
    this.count = 0;
    this.buffer.destroy();
    this.instances.clear();
  }
}

class TilemapFrameInstance {
  constructor(
    public position: Vec2,
    public size: Vec2,
    public gridSize: number,
    public group: GPUBindGroup,
    public count: number,
  ) { }

  hasChanged(pos: Vec2, depth: number, size: Vec2, gridSize: number) {
    return pos.x != this.position.x || pos.y != this.position.y
      || size.x != this.size.x || size.y != this.size.y
      || depth != depth
      || gridSize != this.gridSize;
  }
}