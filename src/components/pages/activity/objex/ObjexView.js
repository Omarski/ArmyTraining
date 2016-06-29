/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var ObjexGameView = require('./ObjexGameView');
var AudioPlayer = require('../../../widgets/AudioPlayer');
var PopupView = require('./../../../widgets/PopupView');
var PageHeader = require('../../../widgets/PageHeader');

function getPageState(props) {

    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        audioObj:null,
        audioController:"",
        popupObj:null,
        mediaPath:'data/media/',
        loadedObjexColl:{},
        loadCounter:0,
        totalImages:0,
        showGame:false,
        currentLevel:null,
        levelsColl:[],
        levelStats:{hints:6}
    };
    
    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.level1 = props.level1;
        data.level2 = props.level2;
        data.gameData   = JSON.parse(data.page);
        data.level1Data = JSON.parse(data.page.levels.level1);
        data.level2Data = JSON.parse(data.page.levels.level2);
    }

    return data;
}

var ObjexView = React.createClass({

    getInitialState: function() {

        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function(){
    },

    componentDidMount: function() {
        this.prepObjex();
        this.prepLevels();
    },

    prepObjex: function(){

        var self = this;
        var loadedObjexColl = [];

        for (var i = 1 ; i < 3; i++){ //self.gameData.levels.length

            self.state["level"+i+"Data"].objects.map(function(img,index){

                var fullImg = new Image();
                var iconImg = new Image();
                fullImg.src = self.state.mediaPath + img.src;
                iconImg.src = self.state.mediaPath + img.src2;
                fullImg.onload = self.loadCounter;
                iconImg.onload = self.loadCounter;

                var artifactObj = {
                    hog_id:img.hog_id,
                    fullImgSrc: fullImg.src,
                    iconImgSrc: iconImg.src,
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
            backgroundImg.src = self.state.mediaPath + self.state["level"+i+"Data"].backgroundImage.src;
            backgroundImg.onload = self.loadCounter;
        }

        var totalImages = 42; //update when json combined

        self.setState({totalImages:totalImages, loadedObjexColl:loadedObjexColl});
    },

    prepLevels: function(){

        var levelsColl = [];
        var levelIconPos = [null,[{x:310, y:80}, {x:310, y:240}]];

        for (var i = 0 ; i < 2; i++){ //levels.length
            var levelObj = {
                level: i + 1,
                posX:levelIconPos[1].x, //levels.length - 1
                posY:levelIconPos[1].y, //levels.length - 1
                locked: !(i === 0),
                completed: false
            };

            levelsColl.push(levelObj);
        }

        this.setState({levelsColl:levelsColl});
    },

    getObjexText:function(hog_id,key){
        var self = this;
        var objexTextColl = self.state.gameData.hidden_objects;
        var objex = objexTextColl[hog_id];
        return objex[key];
    },

    loadCounter: function(){
        var self = this;
        self.state.loadCounter++;
        console.log("Loaded "+self.state.loadCounter);
        if (self.state.loadCounter == self.state.totalImages){
            this.onObjexReady();
        }
    },

    onObjexReady: function(){

        var self = this;
        //self.prepIntroPopup();
        self.prepLevelsPopup();
    },

    viewUpdate: function(update){

        switch (update.task){

        }
    },

    onLevelClick: function(e){
        var level = e.target.id.substring(18);
        self.setState({showGame:true, currentLevel:level});

    },

    replayGame: function(){

        var self = this;
    },

    prepIntroPopup: function(){

        var self = this;
        var origImg;
        var imgStyle;

        var popupObj = {
            id:"Intro",
            onClickOutside: null,
            popupStyle: {height:'50%', width:'60%', top:'20%', left:'20%', background:'#fff', opacity:1, zIndex:'6'},

            content: function(){

                return(
                    <div className="mission-connect-view-popCont">
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);
    },

    prepLevelsPopup: function(){

        var self = this;
        var popBg = self.state.mediaPath + self.self.gameData.ui_images.briefing_screen_background;
        var iconBg = self.state.mediaPath + self.self.gameData.ui_images.menu_button_background;
        var levelIcons = self.levelsColl.map(function(levelObj,index){

            var levelIconStyle = {left:levelObj.x, top:levelObj.y, background: 'url('+iconBg+') no-repeat 100% 100%'};

            return(
                <div id={"objexViewLevelIcon"+index}
                     className="objex_view_popLevelIconCont"
                     style={levelIconStyle}
                     onClick={self.onLevelClick}>
                    <div className="objex_view_popLevelIconText">{"Level "+levelObj.level}</div>
                </div>
            )
        });

        var popupObj = {
            id:"Levels",
            onClickOutside: null,
            popupStyle: {height:'80%', width:'80%', top:'10%', left:'10%',
                        background: 'url('+popBg+') no-repeat 100% 100%', zIndex:'6'},

            content: function(){

                return(
                    <div className="objex-view-popCont">
                        {levelIcons}
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);
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

    setAudioControl: function(mode){
        this.setState({audioController:mode});
    },

    render: function() {

        var self = this;
        var state = self.state;
        var page  = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var blockStyle = {position:'relative', width:'768px', height:'504px', marginLeft:'auto', marginRight:'auto'};

        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="missionConnectViewBlock">

                    {self.state.popupObj ?
                        <PopupView
                            id = {"objexIntro"}
                            popupStyle = {self.state.popupObj.popupStyle}
                            onClickOutside = {self.state.popupObj.onClickOutside}
                        >
                            {self.state.popupObj.content()}
                        </PopupView>:null}
                    
                    {state.mapReady ? <ObjexGameView
                        gameData = {state.gameData}
                        mediaPath = {state.mediaPath}
                        loadedObjexColl = {state.loadedObjexColl}
                        levelObjexColl = {state["level"+state.currentLevel+"Data"].objects}
                        viewUpdate = {self.viewUpdate}
                        levelStats = {self.state.levelStats}
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