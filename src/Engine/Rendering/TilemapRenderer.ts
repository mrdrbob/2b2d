import { SpriteAtlas } from "../Assets/SpriteAtlasAsset";
import { TilemapData } from "../Assets/TilemapAsset";
import Position from "../Components/Position";
import Tilemap from "../Components/Tilemap";
import Vec2 from "../Math/Vec2";
import AssetsResource from "../Resources/AssetsResource";
import CameraResource from "../Resources/CameraResource";
import Update from "../Update";
import { Renderer, RenderingSystem } from "./Renderer";
import TilemapRendererPipeline from "./TilemapRendererPipeline";

const quadTriangles = new Float32Array(
  [-0.5, -0.5,
    0.5,  0.5,
    0.5, -0.5,
  
   -0.5,  -0.5,
   -0.5,   0.5,
    0.5,   0.5]
);

export default class TilemapRenderer implements Renderer {
  public vertexBufferLayout!: GPUVertexBufferLayout;
  public vertexBuffer!: GPUBuffer;
  public parent!: RenderingSystem;
  private pipelines:Map<number, TilemapRendererPipeline> = new Map<number, TilemapRendererPipeline>();
  private batches:Set<number> = new Set<number>();

  async initialize(parent: RenderingSystem) {
    this.parent = parent;
    
    this.vertexBufferLayout = {
      arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: 'float32x2'
        }
      ]
    };

    this.vertexBuffer = parent.device.createBuffer({
      size: quadTriangles.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true
    });
    new Float32Array(this.vertexBuffer.getMappedRange()).set(quadTriangles);
    this.vertexBuffer.unmap();
  }

  beginFrame(passEncoder: GPURenderPassEncoder): void {
    this.batches.clear();
  }

  getOrCreatePipeline(entity:number, textureName:string, tilemapName:string, atlasName:string, assets:AssetsResource) {
    let pipeline = this.pipelines.get(entity);
    if (pipeline)
      return pipeline;

    pipeline = new TilemapRendererPipeline(this, `tm: ${entity}`);
    const tilemap = assets.assume<TilemapData>(tilemapName);
    const atlas = assets.assume<SpriteAtlas>(atlasName);
    const gpuTexture = this.parent.ensureTextureLoaded(textureName, assets);
    pipeline.initialize(gpuTexture, tilemap, atlas);
    this.pipelines.set(entity, pipeline);
    return pipeline;
  }

  draw(update: Update, layer: string): void {
    var query = update.query([ Tilemap.NAME, Position.NAME ]);
    var assets = update.resource<AssetsResource>(AssetsResource.NAME);
    var camera = update.resource<CameraResource>(CameraResource.NAME);

    for (const entity of query) {
      const [sprite, position] = entity.components as [Tilemap, Position];
      if (sprite.layer != layer)
        continue;

      this.batches.add(entity.entity);
      const pipeline = this.getOrCreatePipeline(entity.entity, sprite.texture, sprite.tilemap, sprite.atlas, assets)!;
      const texture = assets.assume<ImageBitmap>(sprite.texture);
      const tilemap = assets.assume<TilemapData>(sprite.tilemap);

      const texel = new Vec2(
        (this.parent.devicePixelRatio * this.parent.zoom) / (this.parent.width * 0.5),
        (this.parent.devicePixelRatio * this.parent.zoom) / (this.parent.height * 0.5)
      );
      pipeline.draw(
        position.pos, 
        tilemap.mapTileCount.multiply(tilemap.tileSize), 
        camera.position, 
        texel
      );
    }
  }

  endFrame(passEncoder: GPURenderPassEncoder, camera: CameraResource): void {
    for (const batch of this.batches) {
      const pipeline = this.pipelines.get(batch)!;

      pipeline.endFrame(passEncoder, camera);
    }
  }


}
