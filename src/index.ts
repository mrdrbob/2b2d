
import { addCurtain } from './Curtain/Plugin';
import GameEngineBuilder from './Engine/GameEngine';
import addGamePlay from './Game/GamePlugin';
import addHud from './Hud/Plugin';
import Layers from './Layers';
import addLoading from './Loading/LoadingPlugin';
import addMainMenu from './Menu/MenuPlugin';
import States from './States';

async function main() {
  const builder = new GameEngineBuilder();
  
  builder.layers.add(Layers.BG);
  builder.layers.add(Layers.TILES);
  builder.layers.add(Layers.ENTITIES);
  builder.layers.add(Layers.FG);
  builder.layers.add(Layers.HUD);
  builder.layers.add(Layers.OVERLAYS);

  addHud(builder);
  addLoading(builder);
  addMainMenu(builder);
  addGamePlay(builder);
  addCurtain(builder);
  
  const engine = await builder.finish(800, 600, 2);

  engine.execute([States.SPAWN_CAM]);
  
};

main().catch(console.error);
