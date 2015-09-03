var React = require('react');
var PageStore = require('../stores/PageStore');
var DefaultPageView = require('../components/pages/content/DefaultPageView')
var DDAudioQuizView = require('../components/pages/activity/DDAudioQuizView')
var NotificationActions = require('../actions/NotificationActions');

function getPageState() {
    var page = null;
    if (PageStore.loadingComplete()) {
        page = PageStore.page();
        setTimeout(function() {
            NotificationActions.hide();
        });
    }

    return {
        page: page
    };
}

var ContentView = React.createClass({

    getInitialState: function() {
        var pageState = getPageState();
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },

    render: function() {
        var page = <div></div>;

        if (this.state.page) {
            if (this.state.page.type === "MatchItem") {
                page = <DDAudioQuizView page={this.state.page} />;
            } else {
                page = <DefaultPageView page={this.state.page} />;
            }
        }

        return (
            <div className="container main-content">
                {page}
            </div>
        );
    },

    _onChange: function() {
        this.setState(getPageState());

    }
});

module.exports = ContentView;