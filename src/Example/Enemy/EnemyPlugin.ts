import Builder from "../../2B2D/Builder";
import States from "../States";
import DetectEnemyCollisions from "./Systems/DetectEnemyCollisions";

export default function EnemyPlugin(builder:Builder) {
  builder.update(States.Gameloop, DetectEnemyCollisions);
}