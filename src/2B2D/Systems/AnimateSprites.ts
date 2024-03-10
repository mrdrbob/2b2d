import { Handle } from "../Asset";
import { SpriteAtlas } from "../Assets/SpriteAtlasAsset";
import Animated from "../Components/Animated";
import Sprite from "../Components/Sprite";
import Update from "../Update";

export interface Frame {
  startTime: number,
  endTime: number,
  frame: string
}

export interface AnimationData {
  totalTime: number,
  frames: Frame[]
};

// A map of animation data for each tag in the sprite
// Makes looking up which frame should be showing for a given timeframe
// easier.
const animationDataCache = new Map<Handle, Map<string, AnimationData>>();

function generateAnimationData(atlas: SpriteAtlas) {
  let tagMap = new Map<string, AnimationData>();

  for (const tag of atlas.meta.frameTags) {
    let totalTime = 0;
    const frames = new Array<Frame>();
    for (let i = tag.from; i <= tag.to; i++) {
      const frame = atlas.frames[i.toString()];
      frames.push({
        startTime: totalTime,
        endTime: totalTime + frame.duration,
        frame: i.toString()
      });
      totalTime += frame.duration;
    }

    let data: AnimationData = { totalTime, frames };
    tagMap.set(tag.name, data);
  }

  return tagMap;
}

export default function AnimateSprites(update: Update) {
  const query = update.query([Animated.NAME, Sprite.NAME]);
  const assets = update.assets();

  for (const entity of query) {
    const [animation, sprite] = entity.components as [Animated, Sprite];

    if (!animation.tag)
      continue;

    let precomputedAnimations = animationDataCache.get(sprite.atlas);
    if (!precomputedAnimations) {
      const atlas = assets.assume<SpriteAtlas>(sprite.atlas);
      precomputedAnimations = generateAnimationData(atlas);
      animationDataCache.set(sprite.atlas, precomputedAnimations);
    }

    const animations = precomputedAnimations.get(animation.tag);
    if (!animations)
      continue;

    if (!animation.previousTag || animation.previousTag != animation.tag) {
      animation.time = 0;
      animation.previousTag = animation.tag;
    } else {
      animation.time += update.delta();
    }
    while (animation.time >= animations.totalTime) {
      animation.time -= animations.totalTime;
    }

    const currentFrame = animations.frames.find(x => animation.time >= x.startTime && animation.time < x.endTime);
    if (!currentFrame)
      continue;

    sprite.frame = currentFrame.frame;
  }
}