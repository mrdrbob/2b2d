import Builder from "../../2B2D/Builder";
import PlayerDamagedSignal from "../Player/Signals/PlayerDamagedSignal";
import ReactToHits from "./Systems/ReactToHits";

export default function ShakerPlugin(builder: Builder) {
  builder.signals.handle(PlayerDamagedSignal, ReactToHits);
}