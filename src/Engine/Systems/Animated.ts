import { SpriteAtlas } from "../Assets/SpriteAtlasAsset";
import Animated, { AnimationData, FrameData } from "../Components/Animated";
import Sprite from "../Components/Sprite";
import AssetsResource from "../Resources/AssetsResource";
import Update from "../Update";

export function updateAnimatedSprites(update:Update) {
  const query = update.queryCached('updateAnimatedSprites', [ Sprite.NAME, Animated.NAME ]);
  const assets = update.resource(AssetsResource.NAME)! as AssetsResource;


  for (const entity of query) {
    const [ sprite, animation ] = entity.components as [Sprite, Animated];

    if (!animation.tag)
      continue;

    if (animation.tag != animation.previousTag) {
      const atlas = assets.assume<SpriteAtlas>(sprite.atlas);

      const tag = atlas.meta.frameTags.find(x => x.name == animation.tag)!;
      let totalTime = 0;
      const frames:FrameData[] = [];
      for (let i = tag.from; i <= tag.to; i++) {
        const frame = atlas.frames[i.toString()];
        frames.push({
          startTime: totalTime,
          endTime: totalTime + frame.duration,
          frame: i.toString()
        });
        totalTime += frame.duration;
      }

      const data:AnimationData = {
        frames: frames,
        totalTime: totalTime,
      };

      animation.animation = data;
    }

    if (!animation.animation)
      continue;

    animation.time += update.deltaTime();
    while (animation.time >= animation.animation.totalTime) {
      animation.time -= animation.animation.totalTime;
    }

    const currentFrame = animation.animation.frames.find(x => animation.time >= x.startTime && animation.time < x.endTime);
    if (!currentFrame)
      continue;

    sprite.frame = currentFrame.frame;
  }
}
