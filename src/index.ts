
import GameEngineBuilder from './Engine/GameEngine';
import Layers from './Layers';
import addLoading from './Loading/LoadingPlugin';
import addMainMenu from './Game/GamePlugin';
import States from './States';

async function main() {
  const builder = new GameEngineBuilder();
  
  builder.layers.add(Layers.BACKGROUND);
  builder.layers.add(Layers.FOREGROUND);

  addLoading(builder);
  addMainMenu(builder);
  
  const engine = await builder.finish(800, 600, 2);


  engine.execute([States.LOADING]);
  
};

main().catch(console.error);
