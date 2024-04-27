import Builder from "../../2B2D/Builder";
import GameLoopState from "../States/GameLoopState";
import SpawnHud from "./Systems/SpawnHud";
import UpdateHud from "./Systems/UpdateHud";

export default function HudPlugin(builder: Builder) {
  builder.schedule.enter(GameLoopState, SpawnHud);
  builder.schedule.update(GameLoopState, UpdateHud);
}