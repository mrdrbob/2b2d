import Builder from "../../2B2D/Builder";
import LoadedSignal from "../Init/Signals/LoadedSignal";
import SpawnLogo from "./Systems/SpawnLogo";

export default function LogoPlugin(builder: Builder) {
  builder.signals.handle(LoadedSignal, SpawnLogo);
}