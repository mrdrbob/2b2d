import Timeline from "../../../2B2D/Components/Timeline";
import Update from "../../../2B2D/Update";
import Curtains from "../../Curtains/Curtains";
import GameLoopState from "../../States/GameLoopState";
import DeathState from "../States/DeathState";

export default function HandlePlayerDeath(update: Update) {
  update.spawn(
    new Timeline([
      { time: 1000, action: (update) => Curtains.Close(update, 'Death') },
      { time: 2000, action: (update) => {
        update.schedule.exit(GameLoopState);
        update.schedule.enter(DeathState);
      } }
    ])
  );
}