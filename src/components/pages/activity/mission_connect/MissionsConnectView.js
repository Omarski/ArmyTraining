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
        stats:{completed:0, hits:0, misses:0},
        objectNodesNum:0
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

    componentWillMount: function(){

        //find objective nodes
        var nodes = this.state.gameData.networkGameNodes.filter(function (obj) {
            return obj.gameObjective === true;
        });

        this.setState({objectNodesNum:nodes.length});
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
            }

            loadedImageColl.push(loadedObj);
        }

        //load bg
        var backgroundMap = new Image();
        backgroundMap.src = self.state.mediaPath + self.state.gameData.backgroundImageName;
        backgroundMap.onload = self.loadCounter;

        //load meter
        var meterColl = ["METER_6-0_01.png","METER_6-1_01.png",
                        "METER_6-2_01.png","METER_6-3_01.png",
                        "METER_6-4_01.png","METER_6-5_01.png",
                        "METER_6-6_01.png"];

        for (var x = 0; x < meterColl.length; x++){
            var meterPiece = new Image();
            meterPiece.src = self.state.mediaPath + meterColl[x];
            meterPiece.onload = self.loadCounter;
        }

        self.setState({totalImages:(imageColl.length * 4) + 1 + 7, loadedImageColl:loadedImageColl});
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
        self.prepIntroPopup();
    },

    viewUpdate: function(update){

        switch (update.task){

            case "leaderClicked":
                if (this.state.stats.completed === this.state.objectNodesNum){
                    this.prepLeaderPopup("won");
                }else this.prepLeaderPopup("incomplete");
                break;
           
            case "timeUp":
                this.prepLeaderPopup("lost");
                break;
            
            case "updateStats":
                this.setState({stats:update.value});
                break;
        }
    },

    replayGame: function(){

        var self = this;
        self.onClosePopup();
        self.setState({stats:{completed:0, hits:0, misses:0}, mapReady:false},
        function(){self.setState({mapReady:true})});
    },

    prepIntroPopup: function(){

        var self = this;
        var origImg = self.state.loadedImageColl[self.state.loadedImageColl.length - 1].charOrigUrl;
        var imgStyle = {background:'url('+ origImg + ') no-repeat', backgroundSize:'100px 100px', marginRight:'20px'};

        var popupObj = {
            id:"Intro",
            onClickOutside: null,
            popupStyle: {height:'50%', width:'60%', top:'20%', left:'20%', background:'#fff', opacity:1, zIndex:'6'},

            content: function(){

                return(
                    <div className="mission-connect-view-popCont">
                        <div className = "mission-connect-view-popLeaderImg" style={imgStyle}></div>
                        <div className="mission-connect-view-popIntroText"
                             dangerouslySetInnerHTML={{__html:self.state.gameData.briefingText}}>
                        </div>
                        <div className = "mission-connect-view-popFeedbackBtnGrpCont">
                            <div className = "mission-connect-view-popFeedbackBtnCont">
                                <div type="button" className="btn btn-default"
                                        onClick={self.onClosePopup}>Start</div>
                            </div>
                        </div>
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);
    },


     prepLeaderPopup: function(mode){

        var self = this;
        var origImg = self.state.loadedImageColl[self.state.loadedImageColl.length - 1].charOrigUrl;
        var imgStyle = {background:'url('+ origImg + ') no-repeat', backgroundSize:'100px 100px'};
        var quote = mode==="won" ? self.state.gameData.congratulationsTitle : self.state.gameData.timeOverTitle;
        var bodyText = mode==="won" ? self.state.gameData.congratulationsText : self.state.gameData.timeOverText;
         
         var popupObj = {

            id:mode+"Pop",
            onClickOutside: null,
            popupStyle: {height:'50%', width:'60%', top:'20%', left:'20%', background:'#fff', opacity:1, zIndex:'6'},

            content: function(){

                return(
                    <div className = "mission-connect-view-popCont">
                        <div className = "mission-connect-view-popLeaderImg" style={imgStyle}></div>
                        <div className = "mission-connect-view-popLeaderTextQuote"
                             dangerouslySetInnerHTML={{__html:quote}}></div>
                        <div className = "mission-connect-view-popLeaderText"
                             dangerouslySetInnerHTML={{__html:bodyText}}></div>

                        <div className = "mission-connect-view-popFeedbackBtnGrpCont">
                            <div className = "mission-connect-view-popFeedbackBtnCont">
                                <div type="button" className="btn btn-default"
                                            onClick={mode === "incomplete" ? self.onClosePopup:
                                                 self.prepStatsPopup}>Continue</div>
                            </div>
                        </div>
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);
    },

    prepStatsPopup: function(){

        var self = this;

        var statsText = function(){

            return (<div>
                        <div>Number of Objectives Complete:   {self.state.stats.completed}</div>
                        <div>Number of Successful Attempts:   {self.state.stats.hits}</div>
                        <div>Number of Unsuccessful Attempts: {self.state.stats.misses}</div>
                    </div>
            )
        };

        var popupObj = {
            id:"stats",
            onClickOutside: null,
            popupStyle: {height:'50%', width:'60%', top:'20%', left:'20%', background:'#fff', opacity:1, zIndex:'6'},

            content: function(){

                return(
                    <div className = "mission-connect-view-popCont">

                        <div className = "mission-connect-view-popStatsHead">
                            Statistics
                        </div>

                        <div className = "mission-connect-view-popStatsText">
                            {statsText()}
                        </div>

                        <div className = "mission-connect-view-popFeedbackBtnGrpCont">
                            <div className = "mission-connect-view-popFeedbackBtnCont">
                                <div type="button" className="btn btn-default"
                                        onClick={self.replayGame}>Restart</div>
                            </div>
                        </div>
                    </div>
                )
            }
        };

        self.displayPopup(popupObj);
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

        var popStyle = {display: 'block', width: '515px', height:'auto', top:'20%', left:'15%',
            minHeight: '315px', background: '#fff', padding:'20px'};

        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="missionConnectViewBlock">

                    {self.state.popupObj ?
                        <PopupView
                            id = {"missionConnectIntro"}
                            popupStyle = {popStyle}
                            onClickOutside = {self.state.popupObj.onClickOutside}
                        >
                            {self.state.popupObj.content()}
                        </PopupView>:null}
                    
                    {state.mapReady ? <MissionConnectGameView
                        gameData = {state.gameData}
                        mediaPath = {state.mediaPath}
                        images = {state.loadedImageColl}
                        viewUpdate = {self.viewUpdate}
                        stats = {self.state.stats}
                        objectNodesNum = {self.state.objectNodesNum}
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