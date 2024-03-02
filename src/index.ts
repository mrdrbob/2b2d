import Builder from "./2B2D/Builder";
import GamePlugin from "./Example/GamePlugin";
import States from "./Example/States";

async function main() {
  const builder = new Builder();

  // Scheduel all the game systems and signals
  builder.plugin(GamePlugin);

  // Start of in the Init state.
  builder.command({ type: 'enter-state', state: States.Init });

  const engine = await builder.finish();
  engine.start();
};


main().catch(console.error);
