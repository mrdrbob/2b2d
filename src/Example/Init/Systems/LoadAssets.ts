import Update from "../../../2B2D/Update";
import GameAssets from "../../GameAssets";

export default function LoadAssets(update: Update) {
  const assets = update.assets();
  GameAssets.load(assets);

  GameAssets.loadAudio(assets, update.audio());
}