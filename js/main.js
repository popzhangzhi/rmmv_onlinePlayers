//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);
//加载scene_boot，SceneManager为整个场景的启动器
window.onload = function() {
    SceneManager.run(Scene_Boot);
};
