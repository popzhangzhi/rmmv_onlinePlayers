//=============================================================================
// Server.js
//=============================================================================

/*:
 * @plugindesc make real-time msg by socket.io
 * @author 张智
 *
 * @param socketOpen
 * @desc open Server Scoket connection
 * @default true
 *
 *
 * @help todo.
 */


(function() {
    let parameters = PluginManager.parameters("Server");
    let socketOpen = !!parameters["socketOpen"] ? parameters["socketOpen"] :true;
    if (socketOpen == "false") {
        return;
    }
    // defaults to true, whether to include credentials (cookies, authorization headers, TLS client certificates, etc.) with cross-origin XHR polling requests.
    let query = {token : ""};

    let socketOptions = { withCredentials : false , path : "/socket.io", forceNew: false, query : query};
    let socket = io('http://localhost:8000',socketOptions);
   
    socket.on('connect', function(){
        console.log('sid',socket.id);
        //send msg and server response
        socket.emit('msg','hi',(res)=>{
            console.log("from server ack ",res);
        });

    });

    //receiving msg and response to server
    socket.on('Event', function(data,sendAckCb){
        // console.log(sendAckCb);
        let mycars=new Array("Saab","Volvo","BMW")
        sendAckCb(mycars);
    });
    socket.on('reconnect_attempt', () => {
        socket.io.opts.query = {
            token: 'fgh'
        }
        // console.log("attempt");
    });
    socket.on('reconnect', (attemptNumber) => {
        // ...
        console.log("reconnect")
    });
    socket.on('connect_timeout', (timeout) => {
        // ...
    });
    socket.on('error', (error) => {
        // ...
        console.log(error);
    });
    socket.on('disconnect', function(data){
        // socket.open();
        console.log('disconnect',data);
    });

    let offline = function(){
        socket.emit('offline','done', (res)=>{
            console.log(res);
            socket.close();
        });
    };
    let _onlinePlayers = {};
    let _onlineSprites = {};

    Game_Player.prototype.executeMove = function(direction) {
        this._transfer = $gamePlayer.isTransferring();
        this._mapId = this._transfer ? "0" : $gameMap.mapId().toString();
        this.moveStraight(direction);
        if (this._mapId === "0") return;
        socket.emit('moving', this.x, this.y, this._mapId);
    };
    //get IDs data
    socket.on('BroadGlobalUsersMapData',function(data,sendAckCb){

        console.log('BroadGlobalUsersMapData',data);

        if(SceneManager._scene.constructor !== Scene_Map)return ;
        SceneManager._scene.UpdateOnlinePlayer(data);


    });
    Scene_Map.prototype.UpdateOnlinePlayer = function(s) {
        this._transfer = $gamePlayer.isTransferring();
        this._mapId = this._transfer ? "0" : $gameMap.mapId().toString();
        console.log("当前地图mapId",this._mapId)
        if (this._mapId === "0") return;

       for(let key  in s){
           console.log(key,socket.id,s[key][3]);
            if (key == socket.id)continue;

            if(!_onlinePlayers[key]){
                _onlinePlayers[key] = new Game_Character();
                _onlinePlayers[key].setImage('Actor2', 1);
                _onlineSprites[key] = new Sprite_Character(_onlinePlayers[key]);
                _onlinePlayers[key].locate(s[key][1],s[key][2]);

            }
            if(this._mapId === s[key][3]){

                this._spriteset._tilemap.addChild(_onlineSprites[key]);
                console.log(_onlinePlayers[key])
                _onlinePlayers[key].moveStraight( _onlinePlayers[key].findDirectionTo(s[key][1],s[key][2]));

            }else {

            }

           // _onlineSprites[key]._destinationSprite = new Sprite_Destination();
           // _onlineSprites[key]._destinationSprite.z = 9;
           // this._spriteset._tilemap.addChild(_onlineSprites[key]);

        }









    };




})();
