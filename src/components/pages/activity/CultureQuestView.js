/**
 * Created by omaramer on 5/9/16.
 */
var React = require('react');
var PageStore = require('../../../stores/PageStore');


function getPageState(props) {
    var title = "";
    var pageType = "";
    var noteItems = "";
    var mediaItems = "";

    if (props && props.page) {
        title = props.page.title;
        pageType = props.page.type;

        if (props.page.note) {

        }

        if (props.page.media) {

        }
    }

    return {
        title: title,
        note: noteItems,
        media: mediaItems,
        pageType: pageType
    };
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
        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                <CultureQuestMap />
                {self.state.showQuiz? <CultureQuestQuiz />:null}
                {self.state.showQuiz? <CultureQuestPopup />:null}
                
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
        return (
            <div>

            </div>
        );
    }
});

module.exports = CultureQuestView;