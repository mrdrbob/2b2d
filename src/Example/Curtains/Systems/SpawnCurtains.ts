import Depth from "../../../2B2D/Components/Depth";
import Gradient from "../../../2B2D/Components/Gradient";
import Parent from "../../../2B2D/Components/Parent";
import Position from "../../../2B2D/Components/Position";
import RenderOrder from "../../../2B2D/Components/RenderOrder";
import Visible from "../../../2B2D/Components/Visibility";
import Color from "../../../2B2D/Math/Color";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Depths from "../../Depths";
import CameraSpawnedSignal from "../../Init/Signals/CameraSpawnedSignal";
import Layers from "../../Layers";
import CurtainController from "../Components/CurtainController";

export default function SpawnCurtains(update: Update, signals: CameraSpawnedSignal[]) {
  if (signals.length == 0)
    return;

  const cameraParent = signals[0].entity;
  const size = Vec2.from(100, 75);

  const controller = update.spawn(
    new Parent(cameraParent),
    Position.from(0, 0),
    new CurtainController(),
    new Visible(true),
    new RenderOrder(Layers.curtains),
    new Depth(Depths.Curtains)
  );

  // Top panel
  update.spawn(
    new Parent(controller),
    Position.from(0, size.y * 2, 0),
    new Gradient(
      Color.Black(0),
      Color.Black(0),
      Color.Black(1),
      Color.Black(1),
      size
    )
  );

  // Center panel
  update.spawn(
    new Parent(controller),
    Position.from(0, 0, 0),
    Gradient.SolidBox(
      Color.Black(1),
      size
    )
  );

  // Bottom panel
  update.spawn(
    new Parent(controller),
    Position.from(0, -size.y * 2, 0),
    new Gradient(
      Color.Black(1),
      Color.Black(1),
      Color.Black(0),
      Color.Black(0),
      size
    )
  );
}