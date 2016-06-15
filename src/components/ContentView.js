var React = require('react');
var PageStore = require('../stores/PageStore');
var PageTypeConstants = require('../constants/PageTypeConstants');
var DefaultPageView = require('../components/pages/content/DefaultPageView');
var DDAudioQuizView = require('../components/pages/activity/DDAudioQuizView');

var InfoView = require('../components/pages/content/InfoView');
var LessonStartView = require('../components/pages/content/LessonStartView');
var InteractiveTimelineView = require('../components/pages/content/InteractiveTimelineView');
var IntroductionPageView = require('../components/pages/content/IntroductionPageView');
var MapView = require('../components/pages/content/MapView');
var MultiNoteView = require('../components/pages/content/MultiNoteView');
var VideoView = require('../components/pages/content/VideoView');
var EthnoMapView = require('../components/pages/content/EthnoMapView');

var ActiveDialogView = require('../components/pages/activity/active_dialog/ActiveDialogView');
var ListeningComprehensionView = require('../components/pages/activity/ListeningComprehensionView');
var MatchItemView = require('../components/pages/activity/MatchItemView');
var MultiColumnPronunciationView = require('../components/pages/activity/MultiColumnPronunciationView');
var MultipleChoiceView = require('../components/pages/activity/MultipleChoiceView');
var OrderingView = require('../components/pages/activity/OrderingView');
var QuestionnaireView = require('../components/pages/content/QuestionnaireView');
var QuestionnaireEndView = require('../components/pages/content/QuestionnaireEndView');
var QuizStartView = require('../components/pages/activity/QuizStartView');
var QuizView = require('../components/pages/activity/QuizView');
var PronunciationView = require('../components/pages/activity/PronunciationView');
var ResponseFormationView = require('../components/pages/activity/ResponseFormationView');
var SectionEndView = require('../components/pages/content/SectionEndView');
var SortingView = require('../components/pages/activity/SortingView');
var UtteranceFormationView = require('../components/pages/activity/UtteranceFormationView');
var NetworkActivityView = require('../components/pages/activity/NetworkActivityView');
var NotificationActions = require('../actions/NotificationActions');
var CultureQuestView = require('../components/pages/activity/cultureQuest/CultureQuestView');

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
        return getPageState();
    },

    componentWillMount: function() {
        PageStore.removeChangeListener(this._onChange);
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {

    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },

    render: function() {

        var page = <div></div>;
        var pageId = (this.state.page) ? this.state.page.xid : "";
        var isFullScreen = false;
        if (this.state.page) {
            console.log(this.state.page.type);
            console.log(this.state.page.title);
            console.log(this.state.page);
            switch (this.state.page.type) {
                case PageTypeConstants.ACTIVE_DIALOG:
                    page = <ActiveDialogView page={this.state.page} />;
                    break;
                case PageTypeConstants.LISTENING_COMPREHENSION:
                    page = <ListeningComprehensionView page={this.state.page} />;
                    break;
                case PageTypeConstants.MATCH_ITEM:
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
                case PageTypeConstants.GENERIC:
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
                case PageTypeConstants.MULTI_COLUMN_PRONUNCIATION:
                    page = <MultiColumnPronunciationView page={this.state.page} />;
                    break;
                case PageTypeConstants.MULTIPLE_CHOICE:
                    page = <MultipleChoiceView page={this.state.page} />;
                    break;
                case PageTypeConstants.ORDERING:
                    page = <OrderingView page={this.state.page} />;
                    break;
                case PageTypeConstants.PRONUNCIATION:
                    page = <PronunciationView page={this.state.page} />;
                    break;
                case PageTypeConstants.RESPONSE_FORMATION:
                    page = <ResponseFormationView page={this.state.page} />;
                    break;
                case PageTypeConstants.SECTION_END:
                    page = <SectionEndView page={this.state.page} />;
                    break;
                case PageTypeConstants.SORTING:
                    page = <SortingView page={this.state.page} />;
                    break;
                case PageTypeConstants.INFO:
                    var foundType = false;
                    if (this.state.page.info) {
                        var properties = this.state.page.info.property || [];
                        var propLen = properties.length;

                        while (propLen--) {
                            if (properties[propLen].name === "lessonstart") {
                                page = <LessonStartView page={this.state.page} />
                                foundType = true;
                                break;
                            }
                        }
                    }

                    if (!foundType) {
                        page = <InfoView page={this.state.page} />;
                    }
                    break;
                case PageTypeConstants.QUESTIONNAIRE:
                    page = <QuestionnaireView page={this.state.page} />;
                    break;
                case PageTypeConstants.QUESTIONNAIRE_END:
                    page = <QuestionnaireEndView page={this.state.page} />;
                    break;
                case "quiz_page":
                case PageTypeConstants.QUIZ_END:
                    page = <QuizView page={this.state.page} />;
                    break;
                case PageTypeConstants.QUIZ_START:
                    page = <QuizStartView page={this.state.page} />;
                    break;
                case PageTypeConstants.INTERACTIVE_TIMELINE:
                    isFullScreen = true;
                    page = <InteractiveTimelineView page={this.state.page} />;
                    break;
                case PageTypeConstants.INTRODUCTION_PAGE:
                    page = <IntroductionPageView page={this.state.page} />;
                    break;
                case PageTypeConstants.MAP:
                    page = <MapView page={this.state.page} />;
                    break;
                case PageTypeConstants.MULTI_NOTE:
                    page = <MultiNoteView page={this.state.page} />;
                    break;
                case PageTypeConstants.VIDEO:
                    page = <VideoView page={this.state.page} />;
                    break;
                case PageTypeConstants.UTTERANCE_FORMATION:
                    page = <UtteranceFormationView page={this.state.page} />;
                    break;
                case PageTypeConstants.ETHNO_MAP:
                    page = <EthnoMapView page={this.state.page} />;
                    break;
                case PageTypeConstants.CULTURE_QUEST:
                    page= <CultureQuestView page={this.state.page} />;
                    break;
                default:
                    page = <DefaultPageView page={this.state.page} />;
            }
        }

        var cls = "";
        if (isFullScreen) {
            cls = "absolute-full";
        }
        return (
            <div className={'container main-content ' + cls}>
                <div className={cls} key={"content-" + pageId}>
                    {page}
                </div>
            </div>
        );
    },

    _onChange: function() {
        this.setState(getPageState());

    }
});

module.exports = ContentView;