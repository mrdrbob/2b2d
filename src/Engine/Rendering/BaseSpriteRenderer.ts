import AssetsResource from "../Resources/AssetsResource";
import CameraResource from "../Resources/CameraResource";
import Update from "../Update";
import { Renderer, RenderingSystem } from "./Renderer";
import SpriteRendererPipeline from "./SpriteRendererPipeline";

const quadTriangles = new Float32Array(
  [-0.5, -0.5,
    0.5,  0.5,
    0.5, -0.5,
  
   -0.5,  -0.5,
   -0.5,   0.5,
    0.5,   0.5]
);

export default abstract class BaseSpriteRender implements Renderer {
  public parent!: RenderingSystem;
  public vertexBufferLayout!: GPUVertexBufferLayout;
  public vertexBuffer!: GPUBuffer;
  private pipelines:Map<string, SpriteRendererPipeline> = new Map<string, SpriteRendererPipeline>();


  async initialize(parent:RenderingSystem) {
    this.parent = parent;

    // Create a fill the vertex buffer
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

    this.vertexBuffer = this.parent.device.createBuffer({
      size: quadTriangles.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });

    new Float32Array(this.vertexBuffer.getMappedRange()).set(quadTriangles);
    this.vertexBuffer.unmap();
  }

  protected batches:Set<string> = new Set<string>();
  beginFrame(passEncoder: GPURenderPassEncoder): void {
    this.batches.clear();
  }

  getOrCreatePipeline(textureName:string, assets:AssetsResource) {
    let pipeline = this.pipelines.get(textureName);
      
    if (!pipeline) {
      // const texture = assets.assume<ImageBitmap>(textureName);
      pipeline = new SpriteRendererPipeline(this, textureName);
      let gpuTexture = this.parent.ensureTextureLoaded(textureName, assets);

      pipeline.initialize(gpuTexture);
      this.pipelines.set(textureName, pipeline);
    }

    return pipeline;
  }

  abstract draw(update: Update, layer:string): void;

  endFrame(passEncoder: GPURenderPassEncoder, camera:CameraResource): void {
    for (const batch of this.batches) {
      const pipeline = this.pipelines.get(batch)!;

      pipeline.endFrame(passEncoder, camera);
    }
  }


}
