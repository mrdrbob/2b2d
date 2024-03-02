import Builder from "../../2B2D/Builder";
import EnemyCollision from "../Enemy/Signals/EnemyCollisionSignal";
import States from "../States";
import MoveBats from "./Systems/MoveBats";
import ReactToStomps from "./Systems/ReactToStomps";
import SpawnBats from "./Systems/SpawnBats";

export default function BatPlugin(builder:Builder) {
  builder.enter(States.Gameloop, SpawnBats);
  builder.update(States.Gameloop, MoveBats);
  
  builder.handle(EnemyCollision.name, ReactToStomps);
}
