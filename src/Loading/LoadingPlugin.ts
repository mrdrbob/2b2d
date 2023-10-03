import Assets from "../Assets";
import { Curtain } from "../Curtain/Plugin";
import loadJsonAsset from "../Engine/Assets/JsonAsset";
import LdtkData from "../Engine/Assets/Ldtk";
import { generateSingleSpriteAtlas, generateTiledSpriteAtlas, loadSpriteAtlasAsset } from "../Engine/Assets/SpriteAtlasAsset";
import loadTextureAsset from "../Engine/Assets/TextureAsset";
import createTilemapFromLdtkJson from "../Engine/Assets/TilemapAsset";
import Gradient from "../Engine/Components/Gradient";
import Position from "../Engine/Components/Position";
import GameEngineBuilder from "../Engine/GameEngine";
import Color from "../Engine/Math/Color";
import Vec2 from "../Engine/Math/Vec2";
import AssetsResource from "../Engine/Resources/AssetsResource";
import Update from "../Engine/Update";
import Layers from "../Layers";
import States from "../States";

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

  // Spawn a black screen while things load.
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
  ]);

  if (isLoaded) {
    assets.add(generateSingleSpriteAtlas(Assets.MENU_ATLAS, new Vec2(200, 150)));

    const ldtk = assets.assume<LdtkData>(Assets.PLATFORM_JSON);
    assets.add(createTilemapFromLdtkJson(Assets.PLATFORM_TILEMAPS[0].BG_TILES, ldtk, 'Level_0', 'Background'));
    assets.add(generateTiledSpriteAtlas(Assets.PLATFORM_ATLAS.BG, new Vec2(24, 24), new Vec2(6, 2), new Vec2(0, 0)));

    assets.add(createTilemapFromLdtkJson(Assets.PLATFORM_TILEMAPS[0].TILES, ldtk, 'Level_0', 'Tiles'));
    assets.add(generateTiledSpriteAtlas(Assets.PLATFORM_ATLAS.TILES, new Vec2(18, 18), new Vec2(20, 9), new Vec2(0, 0)));

    update.exitState(States.LOADING);
    update.enterState(States.MAIN_MENU);
  }
}


export default function addLoading(builder:GameEngineBuilder) {
  builder.systems.enter(States.LOADING, loadAssets);
  builder.systems.update(States.LOADING, checkLoadingProgress);
}