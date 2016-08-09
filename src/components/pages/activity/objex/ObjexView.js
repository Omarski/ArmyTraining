
var React = require('react');
var ObjexGameView = require('./ObjexGameView');
var AudioPlayer = require('../../../widgets/AudioPlayer');
var PopupView = require('./../../../widgets/PopupView');
var PageHeader = require('../../../widgets/PageHeader');
var Utils = require('../../../widgets/Utils.js');

function getPageState(props) {

    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        audioObj:null,
        audioBgObj:null,
        audioController:"",
        popupObj:null,
        mediaPath:'data/media/',
        loadedObjexColl:{},
        loadCounter:0,
        totalImages:0,
        showGame:false,
        currentLevel:1,
        levelsColl:[],
        levelStats:{basic:[], advanced:[]},
        advancedLevel:false,
        showAdvanced:false,
        jsonLoaded: false
    };
    
    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
    }

    return data;
}

var ObjexView = React.createClass({

    getInitialState: function() {

        var pageState = getPageState(this.props);
        return pageState;
    },

    componentDidMount: function() {

        //dim speech and pause
        $("#audioControlIcon , #audioControlButton").css({"opacity": ".5", "pointer-events": "none"});

        var self = this;
        var data = {};

        if (!self.state.jsonLoaded) {
            $.getJSON(self.props.page.info.property[0].value).done(function (mainJSON) {
                data.gameData = mainJSON;
                $.getJSON(data.gameData.levels.level1).done(function (level1JSON) {
                    data.level1Data = level1JSON;
                    $.getJSON(data.gameData.levels.level2).done(function (level2JSON) {
                        data.level2Data = level2JSON;
                        self.setState({
                                gameData: data.gameData,
                                level1Data: data.level1Data,
                                level2Data: data.level2Data
                            },
                            function () {
                                self.prepIntroPopup();
                                self.setState({jsonLoaded:true});
                            });
                    });
                });
            });
        }
    },

    prepObjex: function(){

        var self = this;
        var loadedObjexColl = [];

        self.setState({loadCounter:0}, function(){

            self.state["level"+self.state.currentLevel+"Data"].objects.map(function(img,index){

                var fullImg = new Image();
                var iconImg = new Image();
                fullImg.src = self.state.mediaPath + img.src;
                iconImg.src = self.state.mediaPath + img.src2;
                fullImg.url = img.src;
                iconImg.url = img.src2;
                fullImg.onload = self.loadCounter;
                iconImg.onload = self.loadCounter;

                var artifactObj = {
                    hog_id:img.hog_id,
                    fullImgSrc: fullImg.src,
                    iconImgSrc: iconImg.src,
                    fullImgUrl: fullImg.url,
                    iconImgUrl: iconImg.url,
                    spotX: img.spotX,
                    spotY: img.spotY,
                    tooltip: self.getObjexText(img.hog_id,"tooltip"),
                    abbreviation: self.getObjexText(img.hog_id,"abbreviation"),
                    title: self.getObjexText(img.hog_id,"title"),
                    description: self.getObjexText(img.hog_id,"description")
                };

                loadedObjexColl.push(artifactObj);
            });

            //load bgs
            var backgroundImg = new Image();
            backgroundImg.src = self.state.mediaPath + self.state["level"+self.state.currentLevel+"Data"].backgroundImage.src;
            backgroundImg.onload = self.loadCounter;
            console.log("Loading bg: " + backgroundImg.src);

            var totalImages = 41; //update when json combined

            self.setState({totalImages:totalImages, loadedObjexColl:loadedObjexColl});
        });
    },

    loadCounter: function(){
        var self = this;
        self.state.loadCounter++;
        console.log("Loading: " + self.state.loadCounter);
        if (self.state.loadCounter === self.state.totalImages){
            this.onObjexReady();
        }
    },

    onObjexReady: function(){
        var self = this;
        setTimeout(function () {
            self.setState({showGame:true});
        }, 100);
    },

    prepLevels: function(){

        var self = this;
        var levelsColl = [];
        var levelIconPos = [null,[{x:425, y:195}, {x:425, y:275}]];

        for (var i = 0 ; i < 2; i++){ //levels.length

            var mode = (self.state.advancedLevel) ? "advanced":"basic";
            var levelObj = {
                level: i + 1,
                posX:levelIconPos[1][i].x, //levels.length - 1
                posY:levelIconPos[1][i].y, //levels.length - 1
                locked: (!(i === 0) && self.state.levelStats[mode].indexOf(i) === -1),
                completed: false
            };
            levelsColl.push(levelObj);
        }

        this.setState({levelsColl:levelsColl}, function(){
            self.prepLevelsPopup();
        });

    },

    prepIntroPopup: function(){

        var self = this;
        var popBg = self.state.mediaPath + self.state.gameData.ui_images.briefing_screen_background;

        var popupObj = {
            id:"Intro",
            onClickOutside: null,
            popupStyle: {height:'100%', width:'100%', top:'0%', left:'0%', background:'url('+popBg+') no-repeat', backgroundSize:'1000px 504px', zIndex:'6'},

            content: function(){

                return(
                    <div className="objex-view-popCont">
                        <div className="objex-view-textIntroTitle">Helping Locals</div>
                        <div className="objex-view-textIntro">{self.state.gameData.text_assets["text_your_mission_"+self.state.currentLevel]}</div>
                        <div className="objex-view-introButtonCont">
                            <button type="button" className="btn btn-default objex-view-btn" onClick={self.closeIntro}>Continue</button>
                        </div>
                    </div>

                )
            }
        };

        self.displayPopup(popupObj);

        var debriefAudio = self.state.mediaPath + self.state.gameData.sound_files.audio_briefing;
        self.playAudio({id:"debrief", autoPlay:true, sources:[{format:"mp3", url:debriefAudio}]});
    },

    prepLevelsPopup: function(){

        var self = this;
        var popBg = self.state.mediaPath + self.state.gameData.ui_images.menu_screen_background;
        var iconBg = self.state.mediaPath + self.state.gameData.ui_images.menu_button_background;

        var lockImg = self.state.mediaPath + self.state.gameData.ui_images.menu_button_lock_icon;
        var lockStyle = {background: 'url('+lockImg+') no-repeat 100% 100%'};

        var advImg = self.state.advancedLevel ? self.state.mediaPath + "objex/img/advancedLevelOn.png": self.state.mediaPath + "objex/img/advancedLevelOff.png";
        var advStyle = {background: 'url('+advImg+') no-repeat 100% 100%', cursor:'pointer',
            opacity:self.state.showAdvanced ?'1':'.5', pointerEvents:self.state.showAdvanced ? 'auto':'none'};

        var levelIcons = self.state.levelsColl.map(function(levelObj,index){

            var locked = self.state.levelsColl[index].locked;
            var levelIconStyle = {left:levelObj.posX+'px', top:levelObj.posY+'px',
                background: 'url('+iconBg+') no-repeat 100% 100%', pointerEvents:locked ? 'none':'auto'};
            return(
                <div id={"objexViewLevelIcon"+parseInt(index+1)} key={index}
                     className="objex-view-popLevelIconCont"
                     style={levelIconStyle}
                     onClick={self.onLevelClick}>
                    {locked ? <div className="objex-view-popLevelIconLock" style={lockStyle}></div>:null}
                    <div className="objex-view-popLevelIconText">{"Level "+levelObj.level}</div>
                </div>
            )
        });

        var popupObj = {
            id:"Levels",
            onClickOutside: null,
            popupStyle: {height:'100%', width:'100%', top:0, left:0,
                         background: 'url('+popBg+') no-repeat', backgroundSize:'1000px 504px', zIndex:'6'},

            content: function(){

                return(
                    <div className="objex-view-popCont">
                        <div className="objex-view-textLevelTitle">Select Level</div>
                        {levelIcons}
                        <div className="objex-view-popLevelAdvancedIcon"
                                                         style={advStyle}
                                                         onClick={self.updateAdvClick}>
                        </div>
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);
    },

    updateAdvClick: function(){

        var self = this;
        self.setState({advancedLevel:!self.state.advancedLevel}, function(){
            self.prepLevels();
        });
    },

    prepLevelCompletePopup: function(){

        var self = this;
        this.prepPopup("LevelOrRoundDone",

        function(){

                return(
                    <div className="objex-view-popCont">
                        <div className="objex-view-textComplete">Level complete!</div>
                        <div className="objex-view-completedButtonCont">
                            <div type="button" className="btn btn-default objex-view-btn" onClick={self.menuToLevels}>Main Menu</div>
                            {self.state.currentLevel < self.state.levelsColl.length ? <div type="button" className="btn btn-default objex-view-btn" onClick={self.onNextLevel}>Next Level</div>:null}
                        </div>
                    </div>
                )
            });
    },

    prepBasicCompletePopup: function(){

        var self = this;
        var advancedText = self.state.gameData.text_assets.text_advanced_unlocked;

        this.prepPopup("BasicLevelDone",
            function(){

                return(
                    <div className="objex-view-popCont">
                        <div className="objex-view-textAdvanced">{advancedText}</div>
                        <div className="objex-view-advancedButtonCont">
                            <div type="button" className="btn btn-default objex-view-btn" onClick={self.advancedPopupExit}>Main Menu</div>
                        </div>
                    </div>
                )
            });
    },

    advancedPopupExit: function(){
        this.menuToLevels();
        this.updateAdvClick();
    },

    prepGameCompletePopup: function(){

        var gameDoneText = this.state.gameData.text_assets.text_advanced_complete;

        this.prepPopup("GameDone",
            function(){

                return(
                    <div className="objex-view-popCont">
                        <div className="objex-view-textGameDone">{gameDoneText}</div>
                    </div>
                )
            });
    },
    
    prepTimeUpPopup: function(){

        var self = this;
        this.prepPopup("TimeUp",
            function(){

                return(
                    <div className="objex-view-popCont">
                        <div className="objex-view-textTimeUp">Out of time!</div>
                        <div className="objex-view-noTimeButtonCont">
                            <div type="button" className="btn btn-default objex-view-btn" onClick={self.menuToLevels}>Main Menu</div>
                        </div>
                    </div>
                )
            });
    },

    prepPopup: function(id, content){

        var self = this;
        var popBg = self.state.mediaPath + self.state.gameData.ui_images.menu_screen_background;

        var popupObj = {
            id:id,
            onClickOutside: null,
            popupStyle: {height:'100%', width:'100%', top:'0%', left:'0%', background:'url('+popBg+') no-repeat', backgroundSize:'1000px 504px', zIndex:'6'},

            content: content
            };

        self.displayPopup(popupObj);
    },

    closeIntro: function(){
        this.viewUpdate({task:"buttonAudio", value:null});
        this.setState({audioObj:null});
        this.prepLevels();
        this.bgAudio();
    },

    menuToLevels: function(){

        var self=this;
        self.viewUpdate({task:"buttonAudio", value:null});
        self.setState({popupObj:null}, function(){
            setTimeout(function(){
                self.prepLevels()},300);
            });
    },

    onNextLevel: function(){

        var self=this;
        var level = (self.state.currentLevel < 2) ? self.state.currentLevel +1:2;

        self.setState({popupObj:null, currentLevel: level}, function() {
            self.prepObjex();
            self.viewUpdate({task:"buttonAudio", value:null});
            self.bgAudio();
        });
    },

    onLevelClick: function(e){

        var self = this;
        var level = parseInt(e.currentTarget.id.substring(18));

        this.setState({popupObj:null, currentLevel:level}, function(){
            self.prepObjex();
            self.viewUpdate({task:"successAudio", value:null});
        });
    },

    displayPopup: function(popupObj){
        this.setState({popupObj:popupObj});
    },

    onClosePopup: function(){
        this.setState(({popupObj:null, audioObj:null}));
    },

    playAudio: function(audioObj){
        var self = this;

        this.setState({audioObj:audioObj}, function(){
            if (!audioObj.loop) {
                $("#"+audioObj.id).on("ended", function(){
                    self.setState({audioObj:null});
                });
            }
        });
    },

    playBgAudio: function(audioObj){
        var self = this;

        this.setState({audioBgObj:audioObj}, function(){
            if (!audioObj.loop) {
                $("#"+audioObj.id).on("ended", function(){
                    self.setState({audioBgObj:null});
                });
            }
        });
    },

    setAudioControl: function(mode){
        this.setState({audioController:mode});
    },

    bgAudio: function(){

        var bgAudio = this.state.mediaPath + this.state.gameData.sound_files.audio_music;
        this.playBgAudio({id:"music", autoPlay:true, loop:true, sources:[{format:"mp3", url:bgAudio}]});
    },

    getObjexText:function(hog_id,key){
        var self = this;
        var objexTextColl = self.state.gameData.hidden_objects;
        var objex = objexTextColl[hog_id];
        return objex[key];
    },

    viewUpdate: function(update){

        var self = this;
        switch (update.task){

            case "levelDone":
                var currentLevel = self.state.currentLevel;
                var levelStats = self.state.levelStats;
                var mode = (self.state.advancedLevel) ? "advanced":"basic";

                levelStats[mode].push(currentLevel);

                self.setState({levelStats:levelStats, showGame:false}, function(){

                    if (self.state.levelStats[mode].length === self.state.levelsColl.length){
                        if (self.state.advancedLevel) {
                            self.prepGameCompletePopup();
                        }else{
                            self.prepBasicCompletePopup();
                            self.setState({showAdvanced:true});
                        }

                    }else{
                        self.prepLevelCompletePopup();
                    }

                    self.viewUpdate({task:"buttonAudio", value:null});
                });
                break;

            case "timeUp":
                this.setState({showGame:false},function(){
                    self.prepTimeUpPopup();
                });

                var timeUpAudio = self.state.mediaPath + self.state.gameData.sound_files.audio_button_click;
                self.playAudio({id:"success", autoPlay:true, sources:[{format:"mp3", url:timeUpAudio}]});
                break;

            case "advancedLevel":
                self.setState({advancedLevel:true});
                break;

            case "successAudio":
                var successAudio = self.state.mediaPath + self.state.gameData.sound_files.audio_success;
                self.playAudio({id:"success", autoPlay:true, sources:[{format:"mp3", url:successAudio}]});
                break;

            case "buttonAudio":
                var levelPopAudio = self.state.mediaPath + self.state.gameData.sound_files.audio_button_click;
                self.playAudio({id:"success", autoPlay:true, sources:[{format:"mp3", url:levelPopAudio}]});
                break;

            case "coinAudio":
                var coinAudio = self.state.mediaPath + self.state.gameData.sound_files.audio_hint;
                self.playAudio({id:"hint", autoPlay:true, sources:[{format:"mp3", url:coinAudio}]});
                break;
        }
    },


    render: function() {

        var self = this;
        var state = self.state;
        var page  = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var blockStyle = {position:'relative', width:'1000px', height:'504px', marginLeft:'auto', marginRight:'auto'};

        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="missionConnectViewBlock">

                    {self.state.audioObj ?
                        <AudioPlayer
                            id = {self.state.audioObj.id}
                            sources    = {self.state.audioObj.sources}
                            autoPlay   = {self.state.audioObj.autoPlay}
                        /> : null}

                    {self.state.audioBgObj ?
                        <AudioPlayer
                            id = {self.state.audioBgObj.id}
                            sources    = {self.state.audioBgObj.sources}
                            autoPlay   = {self.state.audioBgObj.autoPlay}
                            loop       = {self.state.audioBgObj.loop}
                        /> : null}

                    {self.state.popupObj ?
                        <PopupView
                            id = {"objexIntro"}
                            backgroundStyle = {{width:'1000px', height:'505px'}}
                            popupStyle = {self.state.popupObj.popupStyle}
                            onClickOutside = {self.state.popupObj.onClickOutside}
                        >
                            {self.state.popupObj.content()}
                        </PopupView>:null}
                    
                    {state.showGame ? <ObjexGameView
                        mediaPath = {state.mediaPath}
                        gameData = {state.gameData}
                        levelData = {state["level"+state.currentLevel+"Data"]}
                        loadedObjexColl = {state.loadedObjexColl}
                        viewUpdate = {self.viewUpdate}
                        levelStats = {self.state.levelStats}
                        advancedLevel = {self.state.advancedLevel}
                    />:null}
                </div>
            </div>
        );
    },

    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = ObjexView;