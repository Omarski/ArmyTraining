var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var ReactBootstrap = require('react-bootstrap');
var PageHeader = require('../../widgets/PageHeader');


function getPageState(props) {
    var data = {
        page: "",
        sources: [],
        title: "",
        pageType: "",
        prompt: "",
        volume: SettingsStore.voiceVolume(),
        hasMoved: [],
        noteItems: "",
        mediaItems: "",
        json: ""
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;

        if(props.page.MapData){
            data.json = props.page.MapData;
            data.json.nodes.map(function(){data.hasMoved.push(false)});
        }
        if(props.page.info){
            if(props.page.info.property){
                props.page.info.property.map(function(item){
                    if(item.name === "builtMap"){
                        data.json = JSON.parse(item.value);
                        data.json.nodes.map(function(){data.hasMoved.push(false)});
                    }
                });
            }
        }
    }

    return data;
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
        audio.volume = SettingsStore.voiceVolume();
    },

    mouseLeave: function(e){
        e.target.src = "data/media/PinBlue.png";
    },

    mouseClick: function(e){
        var audio = document.getElementById('audio');
        audio.src = "data/media/info.mp3";
        audio.load();
        audio.play();
        audio.volume = SettingsStore.voiceVolume();
    },
    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var state = self.state;
        var page = state.page;
        var title = state.title;
        var sources = state.sources;
        var pins = "";
        var textBox = "";
        var backdropImage = "";
        var mapTitle = "";

        mapTitle = self.state.json.title;
        pins = getPins(self.state.json.nodes, self.state.hasMoved, self);
        backdropImage = self.state.json.backdrop;



        return (
            <div>
                <div className="container" key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                    <audio id="audio"></audio>
                    <div className="mapContainer">
                        <div className="mapInstructions">{"Click the tacks to learn about points of interest in " + self.state.json.title + "."}</div>
                        <img className="backdropImage" src={"data/media/" + backdropImage} alt={title}></img>
                        <img className="compass" src="data/media/compass.png"></img>
                        {pins}
                        {textBox}
                    </div>
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
    var nodes = self.state.json.nodes;
    var pins = document.getElementsByClassName('interactiveMapPin');
    var hasMoved = self.state.hasMoved;
    // i hate this function
    Array.prototype.forEach.call(pins, function(item, index){
        setTimeout(function(){
            setTimeout(function(){
                item.style.display = "inline-block";
            },(index)*200);

            setTimeout(function(){
                hasMoved[index] = true;
                self.setState({
                    hasMoved: hasMoved
                })
            },(index)*250);
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
        },(index)*200);
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
            <ReactBootstrap.OverlayTrigger key={self.state.page.xid + "BBOT"+i} id="RBOT" trigger="click" rootClose={true} placement="top" overlay={<ReactBootstrap.Popover key={self.state.page.xid + "Popover"+i} id="Popover" title="">{nodeList[i].mouseover}</ReactBootstrap.Popover>}>
                <img key={self.state.page.xid + i}
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