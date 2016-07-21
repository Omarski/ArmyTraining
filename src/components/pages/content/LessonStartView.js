var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');
var AppStateStore = require('../../../stores/AppStateStore');
var LocalizationStore = require('../../../stores/LocalizationStore');
var UnsupportedScreenSizeView = require('../../../components/UnsupportedScreenSizeView');


function getPageState(props) {
    var data = {
        title: "",
        pageType: "",
        page: "",
        sources: [],
        image: ""
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;

        if(props.page.media){
            data.image = props.page.media[0].xid;
        }

    }

    return data;
}

var LessonStartView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {
        AppStateStore.addChangeListener(this._onAppStateChange);
        $('[data-toggle="tooltip"]').tooltip();
    },

    componentWillUpdate: function(){

    },

    componentDidUpdate: function(){

    },

    componentWillUnmount: function() {
        AppStateStore.removeChangeListener(this._onAppStateChange);
    },
    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var imageXid = state.image;
        var imageHtml = "";
        var time = 25;

        if(imageXid !== ""){
            imageHtml = <img className="lesson-start-image" src={"data/media/"+imageXid}></img>;
        }

        if (AppStateStore.isMobile()) {
            return (<UnsupportedScreenSizeView/>);
        }

        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                <h3 className="lesson-start-timer">{LocalizationStore.labelFor("lessonStart", "lblTime", [time])}</h3>
                {imageHtml}
            </div>
        );
    },
    _onAppStateChange: function () {
        if (AppStateStore.renderChange()) {
            this.setState(getPageState(this.props));
        }
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getPageState(this.props));
        }

    }
});

module.exports = LessonStartView;
