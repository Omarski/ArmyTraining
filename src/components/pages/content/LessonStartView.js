/**
 * Created by Alec on 4/7/2016.
 */
var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');


function getPageState(props) {
    var data = {
        title: "",
        pageType: "",
        page: "",
        sources: [],
        volume: SettingsStore.voiceVolume()
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;

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
        $('[data-toggle="tooltip"]').tooltip();
    },

    componentWillUpdate: function(){

    },

    componentDidUpdate: function(){

    },

    componentWillUnmount: function() {

    },
    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var pageType = state.pageType;

        // please update
        //TODO: get default lesson landing page background, display time estimate, name of book/lesson

        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                <h2>{PageStore.chapter().title + ": " + PageStore.page().title + ".\n"}</h2>
                <h3>Estimated Time: 15 minutes.</h3>
            </div>
        );
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
