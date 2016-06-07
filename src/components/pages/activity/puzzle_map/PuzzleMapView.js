/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var AudioPlayer = require('../../../widgets/AudioPlayer');
var PopupView = require('./../../../widgets/PopupView');
var PuzzleMapDnDView = require("./PuzzleMapDnDView");
var PageHeader = require('../../../widgets/PageHeader');

function getPageState(props) {

    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        showPopup: false,
        audioObj:null,
        audioController:"",
        popupObj:null,
        mediaPath:'data/media/'
    };


    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.imageData = JSON.parse(data.page.info.property[2].value);
    }

    return data;
}

var PuzzleMapView = React.createClass({
    getInitialState: function() {

        var pageState = getPageState(this.props);
        return pageState;
    },

    renderPuzzlePopup: function(){

        var self = this;

        var popupObj = {
            id:"PuzzlePopup",
            onClickOutside: self.onClosePopup,
            popupStyle: {height:'50%', width:'60%', top:'20%', left:'20%', background:'#fff', opacity:1},

            content: function(){

                return(
                    <div className="popup-view-content">
                        <div className="popup-view-bodyText">

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

        var debriefAudio = self.state.mediaPath + self.state.imageData.briefAudio;
        self.playAudio({id:"debrief", autoPlay:true, sources:[{format:"mp3", url:debriefAudio}]});
    },

    onClosePopup: function(){
        this.setState(({popupObj:null,audioObj:null}));
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

    displayPopup: function(popupObj){

        this.setState({popupObj:popupObj});
    },

    setAudioControl: function(mode){
        this.setState({audioController:mode});
    },

    render: function() {
        var self = this;
        var state = self.state;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var blockStyle = {position:'relative', width:'768px', height:'504px', marginLeft:'auto', marginRight:'auto'};

        var mapUrl = self.state.mediaPath + self.state.imageData.mapImage;
        var backMapStyle = {background:'url('+mapUrl+') no-repeat 100% 100%'};

        return (
            <div style={blockStyle}>
                <PageHeader sources={sources} title={title} key={state.page.xid} />

                <div id="puzzleMapViewBlock">

                    <div className="puzzle-map-view-mapCont" style={backMapStyle}>
                        <PuzzleMapDnDView>

                        </PuzzleMapDnDView>
                    </div>

                </div>
            </div>


        );
    },
    
    _onChange: function() {
        this.setState(getPageState());
    }
});

module.exports = PuzzleMapView;