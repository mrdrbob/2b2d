import Depth from "../../../2B2D/Components/Depth";
import Position from "../../../2B2D/Components/Position";
import RenderOrder from "../../../2B2D/Components/RenderOrder";
import Sprite from "../../../2B2D/Components/Sprite";
import SpriteTween from "../../../2B2D/Components/SpriteTween";
import Timeline from "../../../2B2D/Components/Timeline";
import Color from "../../../2B2D/Math/Color";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Curtains from "../../Curtains/Curtains";
import Depths from "../../Depths";
import GameAssets from "../../GameAssets";
import CameraParent from "../../Init/Components/CameraParent";
import Layers from "../../Layers";
import DeathCleanup from "../Components/DeathCleanup";
import DeathScreenExitSignal from "../Signals/DeathScreenExitSignal";
import DeathState from "../States/DeathState";

export default function SpawnDeathScreen(update: Update) {
  const camera = update.ecs.single(CameraParent, Position)!;
  const [ _c, camPos ] = camera.components;
  camPos.position = Vec2.ZERO;
  
  update.spawn(
    new Position(Vec2.ZERO),
    new Depth(Depths.BG),
    new Sprite(GameAssets.died.bg.handle),
    DeathCleanup.Tag
  );

  update.spawn(
    new Position(new Vec2(0, -30)),
    new Depth(Depths.Hud),
    new RenderOrder(Layers.over),
    new Sprite(
      GameAssets.died.guy.handle,
      '0',
      Vec2.ONE,
      Color.White(0)
    ),
    SpriteTween.build()
      .andThen(1000, x => x.pos(new Vec2(0, 0)).color(Color.White(0.7)))
      .andThen(1000, x => x.pos(new Vec2(0, 30)).color(Color.White(0)))
      .chain(),
    DeathCleanup.Tag
  );

  update.spawn(
    new Position(new Vec2(0, -10)),
    new Depth(Depths.Hud),
    new RenderOrder(Layers.over),
    new Sprite(
      GameAssets.died.message.handle,
      '0',
      Vec2.ONE,
      Color.White(0)
    ),
    SpriteTween.build()
      .andThen(1500)
      .andThen(1500, x => x.pos(new Vec2(0, 20)).color(Color.White(1)))
      .andThen(1500)
      .chain(),
    DeathCleanup.Tag
  );

  Curtains.Open(update, 'Death');

  update.spawn(
    new Timeline([
      { time: 3500, action: (update) => Curtains.Close(update, 'Final') },
      { time: 4500, action: (update) => {
        update.schedule.exit(DeathState);
        update.signals.send(DeathScreenExitSignal);
      } }
    ])
  );
}