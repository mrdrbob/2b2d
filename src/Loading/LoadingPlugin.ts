import GameEngineBuilder from "../Engine/GameEngine";
import States from "../States";
import { checkLoadingProgress, loadAssets } from "./LoadingSystems";

export default function addLoading(builder:GameEngineBuilder) {
  builder.systems.enter(States.LOADING, loadAssets);
  builder.systems.update(States.LOADING, checkLoadingProgress);
}