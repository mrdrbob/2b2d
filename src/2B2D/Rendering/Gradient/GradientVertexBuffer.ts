// The Vertex buffer will be made up of 6 Vec2 values repeating:
//   @location(0) vertex: vec2f,    // The offset (-1..1)
//   @location(1) rg: vec2f,        // Red / Green color
//   @location(2) ba: vec2f,        // Blue / Alpha component
//   @location(3) grad_size:vec2f,  // Size of the entire gradient
//   @location(4) grad_pos:vec2f,   // Position in space
//   @location(5) grad_depth:vec2f, // Depth + 0

import Gradient from "../../Components/Gradient";
import Vec2 from "../../Math/Vec2";

const VERTEX_PER_INSTANCE = 6; // Two triangles
const VECS_PER_VERTEX = 6; // Each vertex of each triangle has 6 Vec2 values
const VALUES_PER_VEC2 = 2; // Obviously a Vec2 has 2 values, but this makes the `* 2` more obvious in code.

const MAX_GRADIENTS = 256;

const NORTH = 1;
const SOUTH = -1;
const WEST = -1;
const EAST = 1;

class Batch {
  array: Float32Array;
  buffer: GPUBuffer;
  count = 0;

  constructor(private device: GPUDevice, private layer: string) {
    this.array = new Float32Array(MAX_GRADIENTS * VERTEX_PER_INSTANCE * VECS_PER_VERTEX * VALUES_PER_VEC2);
    this.buffer = device.createBuffer({
      label: `gradient vertex buffer ${layer}`,
      size: this.array.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
  }

  writeToGPU() { this.device.queue.writeBuffer(this.buffer, 0, this.array, 0, this.vertexCount()); }

  reset() { this.count = 0; }

  instances() { return this.count * VERTEX_PER_INSTANCE; }
  vertexCount() { return this.count * VERTEX_PER_INSTANCE * VECS_PER_VERTEX * VALUES_PER_VEC2; }
  size() { return this.vertexCount() * Float32Array.BYTES_PER_ELEMENT; }
}

export default class GradientVertexBuffer {
  batches = new Map<string, Batch>();
  layout: GPUVertexBufferLayout;


  constructor(private device: GPUDevice) {
    const attrs = new Array<GPUVertexAttribute>();
    for (let x = 0; x < VECS_PER_VERTEX; x++) {
      attrs.push({
        shaderLocation: x,
        offset: (VALUES_PER_VEC2 * x) * Float32Array.BYTES_PER_ELEMENT,
        format: 'float32x2'
      });
    }

    this.layout = {
      arrayStride: Float32Array.BYTES_PER_ELEMENT * VECS_PER_VERTEX * VALUES_PER_VEC2,
      attributes: attrs
    };
  }

  pushGradient(layer: string, grad: Gradient, pos: Vec2, depth: number) {
    let batch = this.batches.get(layer);
    if (!batch) {
      batch = new Batch(this.device, layer);
      this.batches.set(layer, batch);
    }
    batch.array.set(
      [
        // Triangle 1
        WEST, SOUTH,
        grad.sw.r, grad.nw.g, grad.sw.b, grad.sw.a,
        pos.x, pos.y,
        grad.size.x, grad.size.y,
        depth, 0,

        EAST, NORTH,
        grad.ne.r, grad.ne.g, grad.ne.b, grad.ne.a,
        pos.x, pos.y,
        grad.size.x, grad.size.y,
        depth, 0,

        EAST, SOUTH,
        grad.se.r, grad.se.g, grad.se.b, grad.se.a,
        pos.x, pos.y,
        grad.size.x, grad.size.y,
        depth, 0,

        // Triange 2
        WEST, SOUTH,
        grad.sw.r, grad.sw.g, grad.sw.b, grad.sw.a,
        pos.x, pos.y,
        grad.size.x, grad.size.y,
        depth, 0,

        WEST, NORTH,
        grad.nw.r, grad.nw.g, grad.nw.b, grad.nw.a,
        pos.x, pos.y,
        grad.size.x, grad.size.y,
        depth, 0,

        EAST, NORTH,
        grad.ne.r, grad.ne.g, grad.ne.b, grad.ne.a,
        pos.x, pos.y,
        grad.size.x, grad.size.y,
        depth, 0,
      ],
      batch.vertexCount()
    );

    batch.count += 1;
  }

  reset() {
    for (const batch of this.batches.values()) {
      batch.reset();
    }
  }

  cleanup() {
    for (const batch of this.batches.values()) {
      batch.buffer.destroy();
    }
  }
}