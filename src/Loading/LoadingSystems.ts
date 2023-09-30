import Assets from "../Assets";
import loadJsonAsset from "../Engine/Assets/JsonAsset";
import { generateSingleSpriteAtlas, generateTiledSpriteAtlas, loadSpriteAtlasAsset } from "../Engine/Assets/SpriteAtlasAsset";
import loadTextureAsset from "../Engine/Assets/TextureAsset";
import createTilemapFromLdtkJson from "../Engine/Assets/TilemapAsset";
import Vec2 from "../Engine/Math/Vec2";
import AssetsResource from "../Engine/Resources/AssetsResource";
import Update from "../Engine/Update";
import States from "../States";

export function loadAssets(update:Update) {
  const assets = update.resource<AssetsResource>(AssetsResource.NAME);


  assets.add(loadTextureAsset(Assets.GUY_TEXTURE, 'assets/guy.png'));
  assets.add(loadSpriteAtlasAsset(Assets.GUY_ATLAS, 'assets/guy.json'));

  assets.add(loadTextureAsset(Assets.CITY_TEXTURE, 'assets/city-texture.png'));
  assets.add(loadJsonAsset(Assets.CITY_LDTK, 'assets/city.ldtk'));
}

export function checkLoadingProgress(update:Update) {
  const assets = update.resource<AssetsResource>(AssetsResource.NAME);
  
  const isLoaded = assets.isLoaded(Assets.GUY_TEXTURE)
    && assets.isLoaded(Assets.GUY_ATLAS)
    && assets.isLoaded(Assets.CITY_TEXTURE)
    && assets.isLoaded(Assets.CITY_LDTK);

  if (isLoaded) {

    const ldtk = assets.assume<any>(Assets.CITY_LDTK)!;

    let tilemap = createTilemapFromLdtkJson(Assets.CITY_TILEMAP, ldtk, 'Level_0', 'Background');
    assets.add(tilemap);

    let tilemapAtlas = generateTiledSpriteAtlas(Assets.CITY_ATLAS, new Vec2(16, 16), new Vec2(27, 18), new Vec2(0, 0));
    assets.add(tilemapAtlas);

    update.exitState(States.LOADING);
    update.enterState(States.MAIN_MENU);
  }
}


