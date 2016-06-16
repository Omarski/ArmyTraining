var React = require('react');
var PageActions = require('../../../actions/PageActions');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');
var LocalizationStore = require('../../../stores/LocalizationStore');

function getPageState(props) {
    var data = {
        title: "",
        pageFeedback: "",
        pageType: "",
        page: "",
        sources: []
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
    }

    // get all quiz pages for this section
    var quizPages = PageStore.getChapterQuizPages();
    var quizPagesPassed = 0;
    var quizPagesLength = quizPages.length;

    // iterate over quiz answer they do not need to be in order
    while(quizPagesLength--) {
        var quizPage = quizPages[quizPagesLength];

        if (quizPage.state && quizPage.state.answer) {
            var quizAnswer = quizPage.state.answer;

            // check if passed
            if (quizAnswer.passed === true) {
                quizPagesPassed++;
            }
        }
    }

    // setup feedback
    data.pageFeedback = LocalizationStore.labelFor("posttest", "lblResults", [quizPagesPassed, quizPages.length]);

    return data;
}


var PostTestQuizEndView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);

        setTimeout(function() {
            PageActions.markChapterComplete();
        });

        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        $('[data-toggle="tooltip"]').tooltip();
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },

    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;

        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                <div className="container">
                    <div className="row">
                        <div className="jumbotron col-sm-12 col-md-12">
                            {state.pageFeedback}
                        </div>
                    </div>
                </div>
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

module.exports = PostTestQuizEndView;
