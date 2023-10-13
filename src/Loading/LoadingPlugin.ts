import Assets from "../Assets";
import { Curtain } from "../Curtain/Plugin";
import spawnCurtains from "../Curtain/SpawnCurtains";
import loadJsonAsset from "../Engine/Assets/JsonAsset";
import LdtkData from "../Engine/Assets/Ldtk";
import { generateSingleSpriteAtlas, generateTiledSpriteAtlas, loadSpriteAtlasAsset } from "../Engine/Assets/SpriteAtlasAsset";
import loadTextureAsset from "../Engine/Assets/TextureAsset";
import createTilemapFromLdtkJson from "../Engine/Assets/TilemapAsset";
import Delay from "../Engine/Components/Delay";
import GameEngineBuilder from "../Engine/GameEngine";
import Vec2 from "../Engine/Math/Vec2";
import AssetsResource from "../Engine/Resources/AssetsResource";
import Update from "../Engine/Update";
import States from "../States";

function spawnLoading(update:Update) {
    // Spawn a black screen while things load.
    spawnCurtains(update, (args) => {
      args.update.exitState(States.PRELOAD);
      args.update.enterState(States.LOADING);
      args.update.despawn(args.entity);
    });
  
}

function loadAssets(update:Update) {
  const assets = update.resource<AssetsResource>(AssetsResource.NAME);

  assets.add(loadTextureAsset(Assets.MENU_TEXTURE, 'assets/main-menu.png'));

  // Level assets
  assets.add(loadJsonAsset<LdtkData>(Assets.PLATFORM_JSON, 'assets/platform.ldtk'));
  assets.add(loadTextureAsset(Assets.PLATFORM_BG_TEXTURE, 'assets/platform-bg-tiles.png'));
  assets.add(loadTextureAsset(Assets.PLATFORM_TILES_TEXTURE, 'assets/platform-tiles.png'));

  // Characters
  assets.add(loadTextureAsset(Assets.CHARACTERS_TEXTURE, 'assets/characters.png'));
  assets.add(loadSpriteAtlasAsset(Assets.CHARACTERS_ATLAS, 'assets/characters.json'));

  // Misc
  assets.add(loadTextureAsset(Assets.DEAD_PLAYER_TEXTURE, 'assets/dead-guy.png'));
  assets.add(loadTextureAsset(Assets.DEATH_SCREEN_TEXTURE, 'assets/dead-bg.png'));
  assets.add(loadTextureAsset(Assets.YOU_DIED_TEXTURE, 'assets/you-died.png'));
  assets.add(loadTextureAsset(Assets.YOU_WIN_TEXTURE, 'assets/you-win.png'));

  /*
  update.spawn([
    new Gradient(Layers.OVERLAYS, 
      Color.Black(1), Color.Black(1), 
      Color.Black(1), Color.Black(1), 
      new Vec2(210, 150)
    ),
    Position.fromXY(0, 0),
    new Curtain(new Vec2(0, 0), new Vec2(0, -300), 2000, Curtain.DespawnAfter ),
  ]);
  update.spawn([
    new Gradient(Layers.OVERLAYS, 
      Color.Black(1), Color.Black(1), 
      Color.Black(0), Color.Black(0), 
      new Vec2(210, 150)
    ),
    Position.fromXY(0, 150),
    new Curtain(new Vec2(0, 150), new Vec2(0, -150), 2000, Curtain.DespawnAfter ),
  ]);
  */
}

function checkLoadingProgress(update:Update) {
  const assets = update.resource<AssetsResource>(AssetsResource.NAME);
  
  const isLoaded = assets.isAllLoaded([
    Assets.MENU_TEXTURE,
    Assets.PLATFORM_JSON,
    Assets.PLATFORM_BG_TEXTURE,
    Assets.PLATFORM_TILES_TEXTURE,
    Assets.CHARACTERS_TEXTURE,
    Assets.CHARACTERS_ATLAS,
    Assets.DEAD_PLAYER_TEXTURE,
    Assets.DEATH_SCREEN_TEXTURE,
    Assets.YOU_DIED_TEXTURE,
    Assets.YOU_WIN_TEXTURE,
  ]);

  if (isLoaded) {
    assets.add(generateSingleSpriteAtlas(Assets.MENU_ATLAS, new Vec2(200, 150)));
    assets.add(generateSingleSpriteAtlas(Assets.DEAD_PLAYER_ATLAS, new Vec2(24, 24)));
    assets.add(generateSingleSpriteAtlas(Assets.DEATH_SCREEN_ATLAS, new Vec2(200, 150)));
    assets.add(generateSingleSpriteAtlas(Assets.YOU_WIN_ATLAS, new Vec2(200, 150)));
    assets.add(generateSingleSpriteAtlas(Assets.YOU_DIED_ATLAS, new Vec2(106, 21)));

    const ldtk = assets.assume<LdtkData>(Assets.PLATFORM_JSON);
    assets.add(generateTiledSpriteAtlas(Assets.PLATFORM_ATLAS.BG, new Vec2(24, 24), new Vec2(6, 2), new Vec2(0, 0)));
    assets.add(generateTiledSpriteAtlas(Assets.PLATFORM_ATLAS.TILES, new Vec2(18, 18), new Vec2(20, 9), new Vec2(0, 0)));

    for (let i = 0; i < ldtk.levels.length; i++) {
      assets.add(createTilemapFromLdtkJson(Assets.PLATFORM_TILEMAPS.BG_TILES + i.toString(), ldtk, 'Level_' + i.toString(), 'Background', 0));
      assets.add(createTilemapFromLdtkJson(Assets.PLATFORM_TILEMAPS.TILES[0] + i.toString(), ldtk, 'Level_' + i.toString(), 'Tiles', 0));
      assets.add(createTilemapFromLdtkJson(Assets.PLATFORM_TILEMAPS.TILES[1] + i.toString(), ldtk, 'Level_' + i.toString(), 'Tiles', 1));
      assets.add(createTilemapFromLdtkJson(Assets.PLATFORM_TILEMAPS.FG_TILES + i.toString(), ldtk, 'Level_' + i.toString(), 'Foreground', 0));
    }

    update.exitState(States.LOADING);
    update.enterState(States.MAIN_MENU);
  }
}


export default function addLoading(builder:GameEngineBuilder) {
  builder.systems.enter(States.PRELOAD, spawnLoading);
  builder.systems.enter(States.LOADING, loadAssets);
  builder.systems.update(States.LOADING, checkLoadingProgress);
}