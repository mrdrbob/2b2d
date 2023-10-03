import Camera from "../Engine/Components/Camera";
import Position from "../Engine/Components/Position";
import Update from "../Engine/Update";
import { Hud } from "./Components";

export function spawnHud(update:Update) {
  const cameraPosition = Position.fromXY(0, 0);

  update.spawn([
    Camera.TAG,
    cameraPosition
  ]);

  update.spawn([
    Hud.TAG,
    Position.fromXY(0, 0).follow(cameraPosition)
  ]);
}