import Timer from "../Components/Timer";
import Update from "../Update";


export default function UpdateTimers(update:Update) {
  const timers = update.query([ Timer.NAME ]);
  if (timers.length === 0)
    return;

  const delta = update.delta();

  for (const entity of timers) {
    const [ timer ] = entity.components as [ Timer ];

    timer.currentTime += delta;
    if (timer.currentTime > timer.totalTime) {
      update.despawn(entity.entity);
      if (timer.completed)
        update.signals.send(timer.completed);
    }
  }
}