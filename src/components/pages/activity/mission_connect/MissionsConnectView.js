/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var MissionConnectGameView = require('./MissionConnectGameView');
var tempJson = require('./testJson');
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
        //data.gameData = JSON.parse(data.page.info.property[1].value);
        data.gameData = JSON.parse(testJson);
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

        chars.map(function(chars,index){

            chars.map(function(img,index){

                imageColl.push({
                    charOrig: self.state.mediaPath + img.nodeImageName,
                    house: self.state.mediaPath + img.availableImageName,
                    charIcon: self.state.mediaPath + img.availableIconImageName,
                    charIconCheck: self.state.mediaPath + img.passedImageName
                });
            });
            
            self.setState({totalImages:(imageColl.length * 4) + 1}); //plus background img

            var loadedImageColl = [];

            for (var i=0 ; i < imageColl.length; i++){

                var loadedObj = {};
                
                for (var key in imageColl[i]){
                    loadedObj[key] = new Image();
                    loadedObj[key].src = imageColl[i][key];
                    loadedObj[key].onload = self.loadCounter;
                }

                loadedImageColl[parseInt(chars.nodeNumber)] = loadedObj;
            }

            var backgroundMap = new Image();
            backgroundMap.src = self.state.mediaPath + self.state.gameData.backgroundImageName;
            backgroundMap.onload = self.loadCounter;

            self.setState({loadedImageColl:loadedImageColl});
            
        });
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
        console.log("Images loaded..");
    },

    viewUpdate: function(status){

    },

    replayGame: function(){

        var self = this;
    },

    updateHudDisplay: function(){

        var self = this;
        switch(self.state.phase){
            case "start":
                self.setState({phase:"play", showHUD:true});
                break;
        }
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

    render: function() {
        var self = this;
        var state = self.state;
        var page  = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var blockStyle = {position:'relative', width:'768px', height:'504px', marginLeft:'auto', marginRight:'auto'};

        var mapUrl = self.state.mediaPath + self.state.gameData.backgroundImageName;
        var backMapStyle = {background:'url('+mapUrl+') no-repeat 100% 100%'};

        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="missionConnectViewBlock">

                    <div className="mission-connect-view-mapCont" style={backMapStyle}>
                        {state.mapReady ? <MissionConnectGameView
                            gameData = {state.gameData}
                            images = {state.loadedImageColl}
                            viewUpdate = {self.viewUpdate}
                        />
                        :null}
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