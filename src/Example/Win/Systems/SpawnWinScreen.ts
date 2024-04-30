import Position from "../../../2B2D/Components/Position";
import Sprite from "../../../2B2D/Components/Sprite";
import Timeline from "../../../2B2D/Components/Timeline";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Curtains from "../../Curtains/Curtains";
import GameAssets from "../../GameAssets";
import CameraParent from "../../Init/Components/CameraParent";
import WinCleanup from "../Components/WinCleanup";
import WinScreenExitSignal from "../Signals/WinScreenExitSignal";
import WinState from "../States/WinState";

export default function SpawnWinScreen(update: Update) {
  const camera = update.ecs.single(CameraParent, Position);
  if (camera) {
    const [_c, cameraPos] = camera.components;
    cameraPos.position = Vec2.ZERO;
  }

  update.spawn(
    new Position(Vec2.ZERO),
    new Sprite(GameAssets.win.handle),
    WinCleanup.Tag
  );

  Curtains.Open(update, 'Win');

  update.spawn(
    new Timeline([
      { time: 2000, action: (u) => Curtains.Close(u, 'Win') },
      {
        time: 3000, action: (u) => {
          u.schedule.exit(WinState);
          u.signals.send(WinScreenExitSignal);
        }
      }
    ])
  )
}