import Builder from "../../2B2D/Builder";
import InitState from "./States/InitState";
import AwaitLoaded from "./Systems/AwaitLoaded";
import LoadAssets from "./Systems/LoadAssets";
import SetupRendering from "./Systems/SetupRendering";
import SpawnControls from "./Systems/SpawnControls";

export default function InitPlugin(builder: Builder) {
  builder.startState(InitState);

  builder.schedule.enter(InitState, SetupRendering);
  builder.schedule.enter(InitState, LoadAssets);
  builder.schedule.enter(InitState, SpawnControls);
  builder.schedule.update(InitState, AwaitLoaded);
}
