import { SpriteAtlas } from "../Assets/SpriteAtlasAsset";
import Position from "../Components/Position";
import Sprite from "../Components/Sprite";
import Vec2 from "../Math/Vec2";
import AssetsResource from "../Resources/AssetsResource";
import CameraResource from "../Resources/CameraResource";
import Update from "../Update";
import BaseSpriteRender from "./BaseSpriteRenderer";

export default class SpriteRenderer extends BaseSpriteRender {

  draw(update: Update, layer:string): void {
    var query = update.query([ Sprite.NAME, Position.NAME ]);
    var assets = update.resource<AssetsResource>(AssetsResource.NAME);
    var camera = update.resource<CameraResource>(CameraResource.NAME);
    
    for (const entity of query) {
      const [sprite, position] = entity.components as [Sprite, Position];
      if (sprite.layer != layer)
        continue;

      const pos = position.pos;
      const atlas = assets.assume<SpriteAtlas>(sprite.atlas);
      const frame = atlas.frames[sprite.frame];
      const atlasPos = new Vec2(frame.frame.x + 1, frame.frame.y + 1);
      const size = new Vec2(frame.spriteSourceSize.w, frame.spriteSourceSize.h);
      const offset = new Vec2(frame.spriteSourceSize.x, frame.spriteSourceSize.y);

      let pipeline = this.getOrCreatePipeline(sprite.texture, assets);

      pipeline.draw(position.pos, size, offset, atlasPos);
      this.batches.add(sprite.texture);
    }
  }
}