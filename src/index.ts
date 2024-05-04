import Builder from "./2B2D/Builder";
import GamePlugin from "./Example/GamePlugin";

async function main() {
  const builder = await Builder.create(800, 600);

  builder.plugin(GamePlugin);
  const engine = await builder.finish();

  engine.start();
};


main().catch(console.error);
