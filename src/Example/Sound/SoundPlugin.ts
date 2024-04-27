import Builder from "../../2B2D/Builder";
import Update from "../../2B2D/Update";
import BatStompedSignal from "../Bat/Signals/BatStompedSignal";
import GameAssets from "../GameAssets";
import PlayerDamagedSignal from "../Player/Signals/PlayerDamagedSignal";
import PlayerDiedSignal from "../Player/Signals/PlayerDiedSignal";
import PlayerJumpedSignal from "../Player/Signals/PlayerJumpedSignal";
import PlayerTouchedFlagSignal from "../Player/Signals/PlayerTouchedFlagSignal";

export default function SoundPlugin(builder: Builder) {
  builder.signals.handle(PlayerJumpedSignal, (update: Update) => {
    const audio = update.audio();
    audio.play(GameAssets.sound.jump.handle, true, 0.5);  
  });

  builder.signals.handle(PlayerDiedSignal, (update: Update) => {
    const audio = update.audio();
    audio.play(GameAssets.sound.died.handle, true, 0.7);  
  });

  builder.signals.handle(PlayerTouchedFlagSignal, (update: Update) => {
    const audio = update.audio();
    audio.play(GameAssets.sound.flag.handle, true, 0.7);  
  });

  builder.signals.handle(BatStompedSignal, (update: Update) => {
    const audio = update.audio();
    audio.play(GameAssets.sound.drop.handle, true, 0.7);  
  });

  builder.signals.handle(PlayerDamagedSignal, (update: Update) => {
    const audio = update.audio();
    audio.play(GameAssets.sound.hurt.handle, true, 0.7);  
  });
}