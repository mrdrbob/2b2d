import Delay from "../Components/Delay";
import Update from "../Update";

export default function updateDelays(update:Update) {
  const query = update.queryCached('updateDelays', [ Delay.NAME ]);

  const delta = update.deltaTime();
  for (const entity of query) {
    const [ delay ] = entity.components as [ Delay ];
    delay.time -= delta;
    if (delay.time < 0) {
      update.despawn(entity.entity);
      delay.andThen(update);
    }
  }
}