import LdktLevelsAsset from "../2B2D/Assets/LdktLevelsAsset";
import TextureAsset from "../2B2D/Assets/TextureAsset";
import { Handle } from "../2B2D/Handle";
import AssetsResource from "../2B2D/Resources/AssetsResource";
import AudioResource from "../2B2D/Resources/AudioResource";

interface LoadableAsset {
  handle: Handle,
  path: string
}

interface AsepriteAsset extends LoadableAsset {
  jsonPath: string
}

function loadSingles(assets:AssetsResource, ...data:LoadableAsset[]) {
  for (const item of data) {
    assets.add(TextureAsset.loadSingleSprite(item.handle, item.path));
  }
}

function loadLevels(assets:AssetsResource, ...data:LoadableAsset[]) {
  for (const item of data) {
    assets.add(LdktLevelsAsset.load(item.handle, item.path));
  }
}

function loadAseprites(assets:AssetsResource, ...data:AsepriteAsset[]) {
  for (const item of data) {
    assets.add(TextureAsset.loadSpriteWithAtlas(item.handle, item.path, item.jsonPath));
  }
}


function loadAudioClips(assets: AssetsResource, audio:AudioResource, ...data:LoadableAsset[]) {
  for (const item of data) {
    assets.add(audio.load(item.handle, item.path));
  }
}


const GameAssets = {
  // Single PNG assets
  menu: { handle: 'menu' as Handle, path: 'assets/main-menu.png' },
  died: {
    bg: { handle: 'death-bg' as Handle, path: 'assets/dead-bg.png' },
    guy: { handle: 'death-guy' as Handle, path: 'assets/dead-guy.png' },
    message: { handle: 'death-message' as Handle, path: 'assets/you-died.png' }
  },
  win: { handle: 'win' as Handle, path: 'assets/you-win.png' },

  // Levels
  ldkt: { handle: 'ldtk' as Handle, path: 'assets/platform.ldtk' },

  // Aseprite assets
  logo: { handle: 'logo' as Handle, path: 'assets/2b2d.png', jsonPath: 'assets/2b2d.json' },
  characters: { handle: 'characters' as Handle, path: 'assets/characters.png', jsonPath: 'assets/characters.json' },
  hud: { handle: 'hud' as Handle, path: 'assets/hud.png', jsonPath: 'assets/hud.json' },

  sound: {
    died: { handle: 'sound-died' as Handle, path: 'assets/died.opus' },
    drop: { handle: 'sound-drop' as Handle, path: 'assets/drop.opus' },
    flag: { handle: 'sound-flag' as Handle, path: 'assets/flag.opus' },
    hurt: { handle: 'sound-hurt' as Handle, path: 'assets/hurt.opus' },
    jump: { handle: 'sound-jump' as Handle, path: 'assets/jump.opus' },
    menu: { handle: 'sound-menu' as Handle, path: 'assets/menu.opus' },
  },

  load: (assets: AssetsResource) => {
    loadSingles(assets, GameAssets.menu, GameAssets.died.bg, GameAssets.died.guy, GameAssets.died.message, GameAssets.win);
    loadLevels(assets, GameAssets.ldkt);
    loadAseprites(assets, GameAssets.logo, GameAssets.characters, GameAssets.hud);
  },

  loadAudio: (assets: AssetsResource, audio:AudioResource) => {
    loadAudioClips(
      assets, 
      audio,
      GameAssets.sound.died,
      GameAssets.sound.drop,
      GameAssets.sound.flag,
      GameAssets.sound.hurt,
      GameAssets.sound.jump,
      GameAssets.sound.menu,
    )
  },
  
  isLoaded: (assets: AssetsResource) => {
    return assets.loaded([
      GameAssets.menu.handle,
      GameAssets.died.bg.handle, 
      GameAssets.died.guy.handle, 
      GameAssets.died.message.handle, 
      GameAssets.win.handle,
      GameAssets.ldkt.handle,
      GameAssets.logo.handle,
      GameAssets.characters.handle,
      GameAssets.hud.handle,
    ]);
  }
};

export default GameAssets;