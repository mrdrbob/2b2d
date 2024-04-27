import Builder from "../../2B2D/Builder";
import CameraSpawnedSignal from "../Init/Signals/CameraSpawnedSignal";
import CurtainMovementCompleteSignal from "./Signals/CurtainMovementCompleteSignal";
import HideOpenedCurtain from "./Systems/HideOpenedCurtain";
import SpawnCurtains from "./Systems/SpawnCurtains";

export default function CurtainsPlugin(builder: Builder) {
  builder.signals.handle(CameraSpawnedSignal, SpawnCurtains);
  builder.signals.handle(CurtainMovementCompleteSignal, HideOpenedCurtain);
}