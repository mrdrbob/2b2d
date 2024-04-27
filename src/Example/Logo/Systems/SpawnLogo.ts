import TextureAsset from "../../../2B2D/Assets/TextureAsset";
import Animated from "../../../2B2D/Components/Animated";
import Depth from "../../../2B2D/Components/Depth";
import Position from "../../../2B2D/Components/Position";
import RenderOrder from "../../../2B2D/Components/RenderOrder";
import Sprite from "../../../2B2D/Components/Sprite";
import SpriteTween from "../../../2B2D/Components/SpriteTween";
import Timeline from "../../../2B2D/Components/Timeline";
import Color from "../../../2B2D/Math/Color";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Depths from "../../Depths";
import GameAssets from "../../GameAssets";
import Layers from "../../Layers";
import Logo from "../Components/Logo";
import LogoCompleteSignal from "../Signals/LogoCompleteSignal";

export default function SpawnLogo(update: Update) {
  const tween = SpriteTween.build()
    .andThen(1000, s => s.color(Color.White(1)))
    .andThen(1000)
    .andThen(1000, s => s.color(Color.White(0)))
    .chain();

  update.spawn(
    new RenderOrder(Layers.logo),
    Position.from(0, 0),
    new Depth(Depths.Logo),
    new Sprite(GameAssets.logo.handle, '10', Vec2.ONE, Color.White(0)),
    new Animated('Still'),
    tween,
    Logo.Tag
  );

  // Get the full length of the animatoin
  const texture = update.assets().assume<TextureAsset>(GameAssets.logo.handle);
  const frame = texture.atlas.meta.frameTags.find(x => x.name == 'Shine')!;
  let len = 0;
  for (let t = frame.from; t <= frame.to; t++) {
    len += texture.atlas.frames[t].duration;
  }

  update.spawn(
    new Timeline([
      { time: 1000, action: (update) => { 
        const logo = update.ecs.single(Logo, Animated);
        if (!logo)
          return;
        const [ _, animated ] = logo.components;
        animated.tag = 'Shine';
      } },
      { time: 1000 + len, action: (update) => { 
        const logo = update.ecs.single(Logo, Animated);
        if (!logo)
          return;
        const [ _, animated ] = logo.components;
        animated.tag = 'Still';
      } },
      {
        time: 1000 + len + 500, action: (update) => {
          update.signals.send(LogoCompleteSignal);
        }
      }
    ])
  )


}