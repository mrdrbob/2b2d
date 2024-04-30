
const quadTriangles = new Float32Array(
  [-0.5, -0.5,
    0.5,  0.5,
    0.5, -0.5,

    -0.5, -0.5,
    -0.5, 0.5,
    0.5,  0.5]
);

export function createQuadVertexBuffer(device: GPUDevice) {
  const layout: GPUVertexBufferLayout = {
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

  const buffer = device.createBuffer({
    label: 'quad vertex buffer',
    size: quadTriangles.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true
  });

  new Float32Array(buffer.getMappedRange()).set(quadTriangles);
  buffer.unmap();

  return {
    layout, buffer
  }
}

export function initCanvas(width: number, height: number) {
  const gameDiv = document.getElementById('game')!;
  const canvas = document.createElement('canvas');
  canvas.width = width * (window.devicePixelRatio || 1);
  canvas.height = height * (window.devicePixelRatio || 1);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  gameDiv.appendChild(canvas);
  return canvas;
}

export function createDepthStencil(device: GPUDevice, width: number, height: number) {
  const texture = device.createTexture({
    size: { width: width * (window.devicePixelRatio || 1), height: height * (window.devicePixelRatio || 1) },
    format: 'depth24plus-stencil8',
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const attachment: GPURenderPassDepthStencilAttachment = {
    view: texture.createView(),
    depthLoadOp: 'clear',
    depthStoreOp: 'store',
    depthClearValue: 1.0,
    stencilClearValue: 1.0,
    stencilLoadOp: 'clear',
    stencilStoreOp: 'store',
  };

  const state: GPUDepthStencilState = {
    format: 'depth24plus-stencil8',
    depthWriteEnabled: true,
    depthCompare: 'less',
  };

  return { texture, attachment, state };
}

export function createColorTargets(presentationFormat: GPUTextureFormat): GPUColorTargetState[] {
  return [
    {
      format: presentationFormat,
      blend: {
        color: {
          srcFactor: "src-alpha",
          dstFactor: 'one-minus-src-alpha',
          operation: 'add'
        },
        alpha: {
          srcFactor: 'one',
          dstFactor: 'one-minus-src-alpha',
          operation: 'add'
        }
      },
      writeMask: GPUColorWrite.ALL
    }
  ]
}