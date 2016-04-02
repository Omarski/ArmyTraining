/**
 * Created by Alec on 3/2/2016.
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

        if(props.page.EthnoData){
            data.json = props.page.EthnoData;
        }
    }

    return data;
}

var EthnoMapView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
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
        var masks = document.getElementsByClassName('ethnoMask');
        Array.prototype.forEach.call(masks, function(item, index){
            item.setAttribute("mask", "url(#mask1)");
        });

        var mask = $('#mask1 circle')[0];
        var mapLayers = $('.mapLayers');
        mapLayers.mousemove(function(e){
            e.preventDefault();
            var upX = e.offsetX;
            var upY = e.offsetY;
            mask.setAttribute("cy", (upY - 5) + 'px');
            mask.setAttribute("cx", (upX) + 'px');
        });

        var background = $('#ethnoBackground')[0];
        setTimeout(function(){
            mapLayers.css('height', background.clientHeight);
            mapLayers.css('width', background.clientWidth);
        }, 750);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var page = self.state.page;
        var title = self.state.title;
        var sources = self.state.sources;
        var background = getBackground(self);
        var layers = getLayers(self);

        return (
            <div>
                <div className="container" key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={page.xid}/>
                </div>
            </div>

        /*    <div className="container">
                <PageHeader sources={sources} title={title} key={page.xid}/>
                <div className="ethnoMap">
                    <div className="mapLayers">
                        {background}
                        <svg className="layers" width="100%" height="100%">
                            <mask id="mask1">
                                <circle cx="-50%" cy="-50%" r="80" fill="white" />
                            </mask>
                            {layers}
                        </svg>
                        <canvas id="canvas" width="768" height="504"></canvas>

                    </div>
                </div>
             </div>
        */
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        this.setState(getPageState());
    }
});

function getBackground(self){
    var source = self.state.json.background;
    return <img className="ethnoBackground" id="ethnoBackground" src={"data/media/"+source} alt={source}></img>
}

function getLayers(self){
    var layers = self.state.json.areas.map(function(item, index){
        var source = item.image;
        return <Image className="ethnoMask" onClick={self.handleClick} mask="url(#mask1)" key={index} id={item.label} xlinkHref={"data/media/"+source} width="100%" height="100%" alt={item.label}></Image>
    });
    return layers;
}

module.exports = EthnoMapView;