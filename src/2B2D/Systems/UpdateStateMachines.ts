import StateMachine from "../Components/StateMachine";
import Update from "../Update";

export default function UpdateStateMachines(update: Update) {
  const query = update.ecs.query(StateMachine);
  for (const entity of query) {
    const [state] = entity.components;

    state.update(update);
  }
}