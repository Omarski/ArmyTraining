var React = require('react');
var PageStore = require('../../../stores/PageStore');
var ReactBootstrap = require('react-bootstrap');


function getPageState(props) {
    var title = "";
    var pageType = "";
    var noteItems = "";
    var mediaItems = "";
    var json = "";
    var hasMoved = [];

    if (props && props.page) {
        title = props.page.title;
        pageType = props.page.type;

        if(props.page.MapData){
            json = props.page.MapData;
            json.nodes.map(function(){hasMoved.push(false)});
        }
    }

    return {
        title: title,
        note: noteItems,
        media: mediaItems,
        pageType: pageType,
        mapJSON: json,
        hasMoved: hasMoved
    };
}

var MapView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
        var self = this;
        animatePins(self);
    },

    mouseOver: function(e){
        e.target.src = "data/media/PinGold.png";
        var audio = document.getElementById('audio');
        audio.src = "data/media/pin_bounce2_v2.mp3";
        audio.load();
        audio.play();
    },

    mouseLeave: function(e){
        e.target.src = "data/media/PinBlue.png";
    },

    mouseClick: function(e){
        var audio = document.getElementById('audio');
        audio.src = "data/media/info.mp3";
        audio.load();
        audio.play();
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },

    render: function() {
        var self = this;
        var pins = "";
        var textBox = "";
        var title = "";
        var backdropImage = "";

        title = self.state.mapJSON.title;
        pins = getPins(self.state.mapJSON.nodes, self.state.hasMoved, self);
        backdropImage = self.state.mapJSON.backdrop;



        return (
            <div className="container">
                <audio id="audio"></audio>
                <div className="mapContainer">
                    <div className="mapInstructions">{"Click the tacks to learn about points of interest in " + self.state.mapJSON.title + "."}</div>
                    <img className="backdropImage" src={"data/media/" + backdropImage} alt={title}></img>
                    <img className="compass" src="data/media/compass.png"></img>
                    {pins}
                    {textBox}
                </div>
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

function animatePins(self){
    var nodes = self.state.mapJSON.nodes;
    var pins = document.getElementsByClassName('interactiveMapPin');
    var hasMoved = self.state.hasMoved;

    Array.prototype.forEach.call(pins, function(item, index){
        setTimeout(function(){
            setTimeout(function(){
                item.style.display = "inline-block";
            },1400);

            setTimeout(function(){
                hasMoved[index] = true;
                self.setState({
                    hasMoved: hasMoved
                })
            },1500);
            var y = 0;
            for(var i=0;i<nodes.length;i++){
                if(item.alt == nodes[i].mouseover){
                    y = nodes[i].y;
                }
            }
            item.style.top = y;
            hasMoved[index] = false;
            self.setState({
                hasMoved: hasMoved
            });
        },(index)*1500);
    });
}

function getPins(nodeList, hasMoved, self){
    var pins = nodeList.map(function(item, i){

        if(hasMoved[i]) {
            var pinstyle = {
                position: 'absolute',
                display: 'inline-block',
                top: nodeList[i].y,
                left: nodeList[i].x
            };
        }else{
            var pinstyle = {
                position: 'absolute',
                display: 'none',
                left: nodeList[i].x
            };
        }
        return (
            <ReactBootstrap.OverlayTrigger key={page.xid + "BBOT"+i} id="RBOT" trigger="click" placement="top" overlay={<ReactBootstrap.Popover key={page.xid + "Popover"+i} id="Popover" title="">{nodeList[i].mouseover}</ReactBootstrap.Popover>}>
                <img key={page.xid + i}
                     style={pinstyle}
                     className="interactiveMapPin"
                     id={"mapPin-" + i}
                     onMouseEnter={self.mouseOver}
                     onMouseLeave={self.mouseLeave}
                     onClick={self.mouseClick}
                     src="data/media/PinBlue.png"
                     alt={nodeList[i].mouseover}></img>
            </ReactBootstrap.OverlayTrigger>
        )
    });
    return pins;
}

module.exports = MapView;