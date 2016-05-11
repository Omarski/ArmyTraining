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
        return {regions:null};
    },

    componentWillMount: function() {
        this.placeRegions();
        //PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //PageStore.removeChangeListener(this._onChange);
    },

    placeRegions: function(){

        var self = this;

        //loop through regions
        var regions = this.props.mapData.regions.map(function(region,index){

            var imgStyle = {position: "absolute", top: region.xMap+"px", left: region.yMap+"px",
                width: region.nearWidth+"px", height: region.nearHeight+"px"};
            console.log("Region " + index);
            return (
                <CultureQuestRegion key={region.name}
                                    className="cultureQuest-region"
                                    src={self.props.mediaPath + region.image}
                                    regionStyle={imgStyle}
                                    regionName={region.name}
                                    regionClick={self.onRegionClick}
                                    regionOver={self.onRegionOver}
                />
            )
        });

        self.setState({regions:regions});
        //return regions;
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

        return (
            <div className="cultureQuest-map" style={mapStyle}>
                {self.state.regions}
            </div>
        );
    }
});

var CultureQuestRegion = React.createClass({
    getInitialState: function() {
        return {};
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

        return (
            <img className="cultureQuest-region" src={self.props.imgSrc}
                 src={self.props.src}
                 style={self.props.regionStyle}
                 name={self.props.regionName}
                 onClick={self.props.regionClick}
                 onMouseOver={self.props.regionOver} >
            </img>
        );
    }
});

module.exports = CultureQuestView;