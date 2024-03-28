import Builder from "../../2B2D/Builder";
import { PlayerDamangedSignal } from "../Player/Systems/TakeEnemyDamage";
import ReactToHits from "./Systems/ReactToHits";

export default function ShakerPlugin(builder:Builder) {
  builder.handle(PlayerDamangedSignal, ReactToHits);
}