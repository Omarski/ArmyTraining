/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var ImageLayersView = require('../../../widgets/ImageLayersView');
var PageStore = require('../../../../stores/PageStore');
var PageHeader = require('../../../widgets/PageHeader');

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
        data.imageData = JSON.parse(data.page.info.property[2].value);
        
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
    
    onRegionClicked: function(regionData){
        if (regionData.lastHighlightedRegion)
            console.log("Clicked on: " + regionData.lastHighlightedRegion.getAttribute('id'));
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
                <ImageLayersView mediaPath={state.mediaPath}
                                 imageData={state.imageData}
                                 onRegionClicked={this.onRegionClicked}/>
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

module.exports = CultureQuestView;