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
        return {canvasColl:[]};
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

        var self = this;
        var canv = document.createElement("canvas");
        canv.setAttribute('width',canvasData.canvasWidth);
        canv.setAttribute('height',canvasData.canvasHeight);
        canv.setAttribute('id',canvasData.canvasId);
        canv.style = canvasData.canvasStyle;
        canv.className = "cultureQuest-region-canvas";
        var context = canv.getContext("2d");
        var image = new Image();
        image.src = canvasData.mapSrc;
        image.onload = function(){
            context.drawImage(image,0,0);
        };
        canv.addEventListener("click", function(e){
            self.onRegionClick(e);
        });

        canv.addEventListener("mousemove", function(e){
            self.onRegionOver(e);
        });

        return canv;
    },

    placeRegions: function(){

        var self = this;
        var canvasColl = [];

        //loop through regions
        self.props.mapData.regions.map(function(region,index){

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

            self.setState({canvasColl:canvasColl});
    },

    reorderRegionStack: function(e) {

        var self = this;
        var canvasId = e.target.getAttribute('id');
        console.log("pixel hit on: " + canvasId);
        for (var i=0; i< self.state.canvasColl.length; i++){
            if (self.state.canvasColl[i].getAttribute('id') === canvasId) {
                self.state.canvasColl[i].style.pointerEvents = "auto";
                //self.state.canvasColl[i].style.zIndex = 2;
                //console.log("matched: " + self.state.canvasColl[i].getAttribute('id') + " With: " + canvasId);
            } else {
                console.log("to z-index 1");
                self.state.canvasColl[i].style.pointerEvents = "none";
                //self.state.canvasColl[i].style.zIndex = 1;
            }
        }

    },

    onRegionClick: function(e) {
        this.pixelTracker(e, "click");
    },

    onRegionOver: function(e) {
        this.pixelTracker(e, "hover");
    },

    pixelTracker: function(e, mode) {

        var self = this;
        // utility function for finding the position of the clicked pixel
        function findPos(obj) {

            var curleft = 0, curtop = 0;
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
                return {x: curleft, y: curtop};
            }
            return undefined;
        }

        // get the position of clicked pixel
        var pos = findPos(e.target);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        // get reference to canvas element clicked on
        var canvas = e.target.getContext('2d');
        // return array of [RED,GREEN,BLUE,ALPHA] as 0-255 of clicked pixel
        var pixel = canvas.getImageData(x, y, 1, 1).data;
        // if the alpha is not 0, we clicked a non-transparent pixel
        // could be easily adjusted to detect other features of the clicked pixel
        // if (pixel[3] != 0) {
        //     alert("Clicked the dice!");
        // }
        if (mode == "hover"){
            console.log("pixel[3]: " + pixel[3]);
            if (pixel[3] != 0) {
                  self.reorderRegionStack(e);
            }else {e.target.style.zIndex = 1; }
        }else if (mode == "click"){
            console.log("clicked on: " + e.target.getAttribute('id'));
        }
    },

    render: function() {
        var self = this;
        var mapData = self.props.mapData;
        var mapBackground = self.props.mediaPath + mapData.mapBackground;
        var mapStyle = {background:"#000 url("+mapBackground+") no-repeat 100% 100%",
            position:"relative", width:"768px" , height:"504px", textAlign:"center"};

        return (
            <div id="cultureQuest-map" className="cultureQuest-map" style={mapStyle}>

            </div>
        );
    }
});

module.exports = CultureQuestView;