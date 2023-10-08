import Camera from "../Engine/Components/Camera";
import Gradient from "../Engine/Components/Gradient";
import Position from "../Engine/Components/Position";
import Tag from "../Engine/Components/Tag";
import Color from "../Engine/Math/Color";
import Vec2 from "../Engine/Math/Vec2";
import Update from "../Engine/Update";
import Layers from "../Layers";
import { Curtain, OnCompleteArg } from "./Plugin";

export default function spawnCurtains(update:Update, post:(u:OnCompleteArg) => void) {
  const hud = update.query([ Camera.NAME, Position.NAME ])[0].components[1] as Position;

  update.spawn([
    Position.fromXY(0, 460).follow(hud),
    new Gradient(Layers.OVERLAYS, 
      Color.Black(1), Color.Black(1),
      Color.Black(0), Color.Black(0),
      new Vec2(210, 160)
    ),
    new Curtain(new Vec2(0, 460), new Vec2(0, 150), 1000 ),
    new Tag('curtain:top')
  ]);
  update.spawn([
    Position.fromXY(0, 300).follow(hud),
    new Gradient(Layers.OVERLAYS, 
      Color.Black(1), Color.Black(1),
      Color.Black(1), Color.Black(1),
      new Vec2(210, 160)
    ),
    new Curtain(new Vec2(0, 300), new Vec2(0, 0), 1000 ),
    new Tag('curtain:middle')
  ]);
  update.spawn([
    Position.fromXY(0, 150).follow(hud),
    new Gradient(Layers.OVERLAYS, 
      Color.Black(0), Color.Black(0),
      Color.Black(1), Color.Black(1),
      new Vec2(210, 150),
    ),
    new Curtain(new Vec2(0, 150), new Vec2(0, -150), 1000, post),
  ]);
}