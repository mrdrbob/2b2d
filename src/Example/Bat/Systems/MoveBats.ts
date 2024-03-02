import Position, { PositionComponent } from "../../../2B2D/Components/Position";
import Update from "../../../2B2D/Update";
import Bat, { BatComponent } from "../Components/Bat";

export default function MoveBats(update:Update) {
  const query = update.query([ Bat.name, Position.name ]);
  const delta = update.delta();

  for (const entity of query) {
    const [ bat, position ] = entity.components as [ BatComponent, PositionComponent ];

    bat.time += delta;
    while (bat.time >= bat.totalTime) {
      bat.time -= bat.totalTime;
    }

    const currentTransition = bat.transitions.find(x => bat.time >= x.startTime && bat.time < x.endTime);
    if (!currentTransition)
      continue;

    const diff = currentTransition.end.sub(currentTransition.start);
    if (diff.x == 0 && diff.y == 0) {
      position.pos = currentTransition.start;
      continue;
    }

    const time = bat.time - currentTransition.startTime;
    const totalTime = currentTransition.endTime - currentTransition.startTime;
    const progress = diff.scalarMultiply(time / totalTime);
    position.pos = currentTransition.start.add(progress);
  }
}