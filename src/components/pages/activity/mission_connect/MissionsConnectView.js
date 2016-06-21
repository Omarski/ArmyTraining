/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var MissionConnectGameView = require('./MissionConnectGameView');
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
        loadedImageColl:[],
        loadCounter:0,
        totalImages:0,
        mapReady:false,
        scoreObj:{}
    };
    
    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.gameData = JSON.parse(data.page.info.property[1].value);
    }

    return data;
}

var MissionConnectView = React.createClass({
    getInitialState: function() {

        var pageState = getPageState(this.props);
        return pageState;
    },

    componentDidMount: function() {
        this.preloadImages();
    },

    preloadImages: function(){

        var self = this;
        var imageColl = [];
        var chars = self.state.gameData.networkGameNodes;

        //save urls
        chars.map(function(img,index){

            imageColl.push({
                charOrig: self.state.mediaPath + img.nodeImageName,
                house: self.state.mediaPath + img.availableImageName,
                charIcon: self.state.mediaPath + img.availableIconImageName,
                charIconCheck: self.state.mediaPath + img.passedImageName
            });
        });

        var loadedImageColl = [];

        for (var i=0 ; i < imageColl.length; i++){

            var loadedObj = {};

            for (var key in imageColl[i]){
                loadedObj[key] = new Image();
                loadedObj[key].src = imageColl[i][key];
                loadedObj[key].onload = self.loadCounter;
                loadedObj[key+"Url"] = imageColl[i][key];
                loadedObj[key+"Width"] = loadedObj[key].width;
                loadedObj[key+"Height"] = loadedObj[key].height;
            }


            loadedImageColl.push(loadedObj);
        }

        var backgroundMap = new Image();
        backgroundMap.src = self.state.mediaPath + self.state.gameData.backgroundImageName;
        backgroundMap.onload = self.loadCounter;

        self.setState({totalImages:(imageColl.length * 4) + 1, loadedImageColl:loadedImageColl}); //plus background img
    },

    loadCounter: function(){
        var self = this;
        self.state.loadCounter++;
        if (self.state.loadCounter == self.state.totalImages){
            this.onImagesPreLoaded();
        }
    },

    onImagesPreLoaded: function(){

        var self = this;
        self.setState({mapReady:true});
        //self.prepIntroPopup();
        console.log("Images loaded..");
    },

    viewUpdate: function(status){

    },

    replayGame: function(){

        var self = this;
    },

    prepIntroPopup: function(){

        var self = this;

        var popupObj = {
            id:"Intro",
            onClickOutside: null,
            popupStyle: {height:'50%', width:'60%', top:'20%', left:'20%', background:'#fff', opacity:1, zIndex:'6'},

            content: function(){

                return(
                    <div className="popup-view-content">
                        <div className="popup-view-bodyText">
                            {self.state.gameData.briefingText}
                        </div>
                        <div className="popup-view-buttonCont">
                            <button type="button" className="btn btn-default"
                                    onClick={self.onClosePopup}>Start</button>
                        </div>
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);

        var debriefAudio = self.state.mediaPath + self.state.gameData.briefingAudioName;
        if (debriefAudio) self.playAudio({id:"missionConnectDebrief", autoPlay:true, sources:[{format:"mp3", url:debriefAudio}]});
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

    displayPopup: function(popupObj){
        this.setState({popupObj:popupObj});
    },

    onClosePopup: function(){
        this.setState(({popupObj:null, audioObj:null}));
    },

    render: function() {
        var self = this;
        var state = self.state;
        var page  = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var blockStyle = {position:'relative', width:'768px', height:'504px', marginLeft:'auto', marginRight:'auto'};

        var mapUrl = self.state.mediaPath + self.state.gameData.backgroundImageName;
        var backMapStyle = {background:'url('+mapUrl+') no-repeat', backgroundSize:'768px 504px'};

        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="missionConnectViewBlock">

                    {self.state.popupObj ?
                        <PopupView
                            id = {"missionConnectIntro"}
                            popupStyle = {self.state.popupObj.popupStyle}
                            onClickOutside = {self.state.popupObj.onClickOutside}
                        >
                            {self.state.popupObj.content()}
                        </PopupView>:null}
                    
                    {state.mapReady ? <MissionConnectGameView
                        gameData = {state.gameData}
                        mediaPath = {state.mediaPath}
                        images = {state.loadedImageColl}
                        viewUpdate = {self.viewUpdate}
                    />:null}
                    
                    <div className="mission-connect-view-mapCont" style={backMapStyle}>

                    </div>
                </div>
            </div>
        );
    },

    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = MissionConnectView;