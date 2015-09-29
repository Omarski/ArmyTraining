var React = require('react');
var PageStore = require('../stores/PageStore');
var DefaultPageView = require('../components/pages/content/DefaultPageView');
var DDAudioQuizView = require('../components/pages/activity/DDAudioQuizView');

var InfoView = require('../components/pages/content/InfoView');
var InteractiveTimelineView = require('../components/pages/content/InteractiveTimelineView');
var IntroductionPageView = require('../components/pages/content/IntroductionPageView');
var MapView = require('../components/pages/content/MapView');
var MultiNoteView = require('../components/pages/content/MultiNoteView');
var VideoView = require('../components/pages/content/VideoView');

var ActiveDialogView = require('../components/pages/activity/ActiveDialogView');
var ListeningComprehensionView = require('../components/pages/activity/ListeningComprehensionView');
var MatchItemView = require('../components/pages/activity/MatchItemView');
var MultiColumnPronunciationView = require('../components/pages/activity/MultiColumnPronunciationView');
var MultipleChoiceView = require('../components/pages/activity/MultipleChoiceView');
var OrderingView = require('../components/pages/activity/OrderingView');
var PronunciationView = require('../components/pages/activity/PronunciationView');
var ResponseFormationView = require('../components/pages/activity/ResponseFormationView');
var SortingView = require('../components/pages/activity/SortingView');
var UtteranceFormationView = require('../components/pages/activity/UtteranceFormationView');
var NetworkActivityView = require('../components/pages/activity/NetworkActivityView');

var NotificationActions = require('../actions/NotificationActions');

function getPageState() {
    var page = null;
    if (PageStore.loadingComplete()) {
        page = PageStore.page();
        console.dir(page);
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
            switch (this.state.page.type) {
                case "ActiveDialog":
                    page = <ActiveDialogView page={this.state.page} />;
                    break;
                case "ListeningComprehension":
                    page = <ListeningComprehensionView page={this.state.page} />;
                    break;
                case "MatchItem":
                    console.dir(this.state.page);

                    var foundType = false;
                    if (this.state.page.info) {
                        var properties = this.state.page.info.property || [];
                        var propLen = properties.length;

                        while (propLen--) {
                            if (properties[propLen].name === "dnd") {
                                page = <DDAudioQuizView page={this.state.page} />;
                                foundType = true;
                                break;
                            }
                        }
                    }

                    if (!foundType) {
                        page = <MatchItemView page={this.state.page} />;
                    }
                    break;
                case "Generic":
                    var foundType = false;
                    if (this.state.page.info) {
                        var properties = this.state.page.info.property || [];
                        var propLen = properties.length;

                        while (propLen--) {
                            if (properties[propLen].name === "network") {
                                page = <NetworkActivityView page={this.state.page} />
                                foundType = true;
                                break;
                            }
                        }
                    }

                    if (!foundType) {
                        page = <InfoView page={this.state.page} />;
                    }
                    break;
                case "MultiColumnPronunciation":
                    page = <MultiColumnPronunciationView page={this.state.page} />;
                    break;
                case "MultipleChoice":
                    page = <MultipleChoiceView page={this.state.page} />;
                    break;
                case "Ordering":
                    page = <OrderingView page={this.state.page} />;
                    break;
                case "Pronunciation":
                    page = <PronunciationView page={this.state.page} />;
                    break;
                case "ResponseFormation":
                    page = <ResponseFormationView page={this.state.page} />;
                    break;
                case "Sorting":
                    page = <SortingView page={this.state.page} />;
                    break;
                case "Info":
                    page = <InfoView page={this.state.page} />;
                    break;
                case "InteractiveTimeline":
                    page = <InteractiveTimelineView page={this.state.page} />;
                    break;
                case "IntroductionPage":
                    page = <IntroductionPageView page={this.state.page} />;
                    break;
                case "Map":
                    page = <MapView page={this.state.page} />;
                    break;
                case "MultiNote":
                    page = <MultiNoteView page={this.state.page} />;
                    break;
                case "Video":
                    page = <VideoView page={this.state.page} />;
                    break;
                case "UtteranceFormation":
                    page = <UtteranceFormationView page={this.state.page} />;
                    break;
                default:
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