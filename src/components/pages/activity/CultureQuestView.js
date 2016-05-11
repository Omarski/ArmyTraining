/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var PageStore = require('../../../stores/PageStore');
var PageHeader = require('../../widgets/PageHeader');

function getPageState(props) {

    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        showQuiz: false,
        showPop: false,
        mediaPath: "data/media/"
    } ;


    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.mapData = JSON.parse(data.page.info.property[2].value);
        //for (var s in data.page) console.log(s + " : " + data.page[s]);

        if (props.page.note) {

        }

        if (props.page.media) {

        }
    }

    return data;
}

var CultureQuestView = React.createClass({
    getInitialState: function() {

        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },

    render: function() {
        var self = this;
        var state = self.state;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;

        return (
            <div>
                <PageHeader sources={sources} title={title} key={state.page.xid}/>
                <CultureQuestMap mediaPath={state.mediaPath} mapData={state.mapData} />
                {self.state.showQuiz? <CultureQuestQuiz />:null}
                {self.state.showPop? <CultureQuestPopup />:null}
                
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState());
    }
});


var CultureQuestMap = React.createClass({
    getInitialState: function() {
        return {}; //regions:null
    },

    componentWillMount: function() {
        //this.placeRegions();
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        this.placeRegions();
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },

    createCanvas: function(canvasData){

        var canv = document.createElement("canvas");
        canv.setAttribute('width',canvasData.canvasWidth);
        canv.setAttribute('height',canvasData.canvasHeight);
        canv.setAttribute('id',canvasData.canvasId);
        canv.style = canvasData.canvasStyle;
        canv.class = "cultureQuest-region-canvas";
        var context = canv.getContext("2d");
        var image = new Image();
        image.src = canvasData.mapSrc;
        image.onload = function(){
            context.drawImage(image,0,0);
        }

        return canv;
    },

    placeRegions: function(){

        var self = this;
        var canvasColl = [];
        
        //loop through regions //var regions =
        this.props.mapData.regions.map(function(region,index){
            
            var regionCanvas =  self.createCanvas({
                                canvasWidth:region.nearWidth,
                                canvasHeight:region.nearHeight,
                                canvasId:"cultureQuest_canvas_" + index,
                                canvasStyle:"{z-index:"+index+1+"}",
                                mapSrc: self.props.mediaPath + region.image
            });

            document.getElementById("cultureQuest-map").appendChild(regionCanvas);

            canvasColl.push(regionCanvas);
        });
    },

    onRegionClick: function(e) {
        console.log("clicked on : " + e.target.name);
    },

    onRegionOver: function(e) {
        console.log("Hovering over : " + e.target.name);
    },


    render: function() {
        var self = this;
        var mapData = self.props.mapData;
        var mapBackground = self.props.mediaPath + mapData.mapBackground;
        var mapStyle = {background:"#000 url("+mapBackground+") no-repeat 100% 100%", width:"768px" , height:"504px", textAlign:"center"};
        //{self.state.regions}
        return (
            <div id="cultureQuest-map" className="cultureQuest-map" style={mapStyle} ref={(c) => self._mainMap = c}>

            </div>
        );
    }
});

// var CultureQuestRegion = React.createClass({
//     getInitialState: function() {
//         return {};
//     },
//
//     componentWillMount: function() {
//         //PageStore.addChangeListener(this._onChange);
//     },
//
//     componentDidMount: function() {
//         //PageStore.addChangeListener(this._onChange);
//     },
//
//     componentWillUnmount: function() {
//         //PageStore.removeChangeListener(this._onChange);
//     },
//     render: function() {
//         var self = this;
//
//         return (
//             <img className="cultureQuest-region" src={self.props.imgSrc}
//                  src={self.props.src}
//                  style={self.props.regionStyle}
//                  name={self.props.regionName}
//                  onClick={self.props.regionClick}
//                  onMouseOver={self.props.regionOver} >
//             </img>
//         );
//     }
// });

module.exports = CultureQuestView;