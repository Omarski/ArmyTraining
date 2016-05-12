/**
 * Created by Alec on 3/2/2016.
 * Taken over by David on 5/10/16
 */
var React = require('react');
var PageStore = require('../../../stores/PageStore');
var ReactBootstrap = require('react-bootstrap');
var PageHeader = require('../../widgets/PageHeader');


function getPageState(props) {
    var title = "";
    var pageType = "";
    var noteItems = "";
    var mediaItems = "";
    var json = "";

    var data = {
        page: "",
        info: "",
        title: "",
        pageType: "",
        noteItems: "",
        mediaItems: "",
        json: "",
        sources: []
    };

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.info = props.info;


        if(props.page.EthnoData){
            data.json = props.page.EthnoData;
        } else {
            data.json = JSON.parse(props.page.info.property[2].value);
        }
    }

    return data;
}


var EthnoMapView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        console.log("*****pageState in EthnoMapView*****,", pageState);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    handleClick: function(e){
        //console.dir(e.target);
    },
    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);

    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        // console.log("OOO:", self.props.page);
        var parsedJSON = JSON.parse(self.props.page.info.property[2].value);
        var backgroundImageURL = "data/media/" + parsedJSON.background;
        // // var imgName2 = self.props.page.info.property[2].value.background;
        // // console.log("XXXXXX self.props.page.info.property[2].value++++++", self.props.page.info.property[2].value)
        // console.log("parsedJSON", parsedJSON);
        // console.log("parsedJSON.background", parsedJSON.background);
        //
        //
        // console.log("this", self);
        // console.log("self.state", self.state);
        // var layers = getLayers(self);
        // console.log("self aka this", self);
        // console.log("page aka self.state.page", page);
        // console.log("this.state", this.state);
        //<ul> <li> <img src = {backgroundImageURL}></img> </li> </ul>


        return (
            <div>
                <div className="container" key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                </div>
                <EthnoMap mediaPath="data/media/" mapData={parsedJSON} />
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState(this.props));
        console.log("getPageState", getPageState(this.props));
    }
});


var EthnoMap = React.createClass({
    getInitialState: function() {
        return {}; //regions:null
    },

    componentWillMount: function() {
        //this.placeRegions();
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        console.log("test");
        this.placeRegions();
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },

    // canv.setAttribute('width',canvasData.canvasWidth);
    // canv.setAttribute('height',canvasData.canvasHeight);
    // above items were in createcanvas in first couple lines

    createCanvas: function(canvasData){

        var time1 = performance.now();

        var canv = document.createElement("canvas");
        canv.setAttribute('width',canvasData.canvasWidth);
        canv.setAttribute('height',canvasData.canvasHeight);
        canv.setAttribute('id',canvasData.canvasId);
        canv.style = canvasData.canvasStyle;
        canv.className = "ethnoMap-region-canvas";
        var context = canv.getContext("2d");
        var image = new Image();
        image.src = canvasData.mapSrc;
        image.onload = function(){
            context.drawImage(image,0,0);
        }

        var time2 = performance.now();

        var result = time1 - time2;
        console.log("result");
        console.log(result);

        return canv;
    },

    placeRegions: function(){

        var self = this;
        var canvasColl = [];

        //loop through regions //var regions =
        this.props.mapData.areas.map(function(region,index){
            console.log(index);
            var regionCanvas =  self.createCanvas({
                position: "relative !important",
                canvasWidth: "768px !important",
                canvasHeight: "504px !important",
                canvasId:"ethnoMap_canvas_" + index,
                canvasStyle:"{z-index:"+index+100+"}",
                mapSrc: self.props.mediaPath + region.image
            });

            document.getElementById("ethno-map").appendChild(regionCanvas);

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
        var backgroundImage = self.props.mapData.background;
        console.log("backgroundImage", backgroundImage);
        var mapData = self.props.mapData;
        console.log("mapData", mapData);
        var mapBackground = self.props.mediaPath + backgroundImage;
        var mapStyle = {background:"#000 url("+mapBackground+") no-repeat", width:"768px" , height:"504px"};
        //{self.state.regions}
        return (
            <div id="ethno-map" className="ethno-map" style={mapStyle} ref={(c) => self._mainMap = c}>

            </div>
        );
    }
});

module.exports = EthnoMapView;