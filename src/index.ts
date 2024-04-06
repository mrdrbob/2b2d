import Builder from "./2B2D/Builder";
import GamePlugin from "./Example/GamePlugin";

async function main() {
  const builder = new Builder();

  // Scheduel all the game systems and signals
  builder.plugin(GamePlugin);

  const engine = await builder.finish();
  engine.start();
};


main().catch(console.error);
