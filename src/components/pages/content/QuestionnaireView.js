var React = require('react');
var InfoTagConstants = require('../../../constants/InfoTagConstants');
var PageActions = require('../../../actions/PageActions');
var PageStore = require('../../../stores/PageStore');
var PageHeader = require('../../widgets/PageHeader');
var Utils = require('../../widgets/Utils');

function getPageState(props) {
    var data = {
        page: null,
        title: "",
        sources: [],
        answers: [],
        prompt: "",
    };

    if (props && props.page) {
        data.page = props.page;
        data.title = props.page.title;
        data.answers = props.page.answer;
        data.prompt = props.page.prompt.text;
    }

    return data;
}

function isAlreadySelected() {
    // TODO selected from previous answer
}

function isHidden() {
    // TODO is hidden from either tag or previous answer
}

function isRecommended() {
    // TODO is selected from tag
}

function isRequired() {
    // TODO is selected from tag
}


var QuestionnaireView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        // iterate over answer objects
        var recommendedMap = {};
        for (var answerIndex in this.state.answers) {
            var answerObj = this.state.answers[answerIndex];
            if (answerObj && answerObj.nut && answerObj.nut.uttering && answerObj.nut.uttering.info && answerObj.nut.uttering.info.property) {
                if (Utils.findInfo(answerObj.nut.uttering.info, InfoTagConstants.INFO_PROP_RECOMMENDED) !== null) {
                    recommendedMap[answerObj.nut.uttering.utterance.translation.text] = 1;
                }
            }
        }

        // iterate over each item and check if recommended
        $(".multiple-choice-checkbox").each(function () {
            // check if text is in the recommended if so mark it checked
            if (this.value in recommendedMap) {
                this.checked = true;
            }
        });
    },

    componentDidUpdate: function(){
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },

    answerChange: function(answer) {
        var self = this;
        var state = this.state;

        // TODO this.checked = false;

        // for now only record if its a quiz page or questionnaire
        if (state.isQuestionaire) {
            // TODO <-------------- MOVE TO ITS OWN OBJECT------------------------------------------
            // create new answer object
            var answerObj = {
                answer: {
                    answer: answer,
                }
            }
            // TODO END <-------------- MOVE TO ITS OWN OBJECT---------------------------------------

            // submit answer to page
            PageActions.answer(answerObj);
        }
    },

    render: function() {
        var self = this;
        var state = this.state;
        var page = self.state.page;
        var title = page.title;
        var sources = self.state.sources;

        var choices;
        var _this = this;
        choices = state.answers.map(function(item, index){
            var ans = item.nut.uttering.utterance.translation.text;
            return (<li key={page.xid + String(index)} className="list-group-item multiple-choice-list-group-item" >
                <div className="checkbox multiple-choice-checkbox">
                    <label>
                        <input type="checkbox" className="multiple-choice-checkbox" value={ans} onClick={_this.answerChange.bind(_this, ans)}>{ans}</input>
                    </label>
                </div>
            </li>);
        });

        return (
            <div>
                <div key={"page-" + this.state.page.xid}>
                    <PageHeader sources={sources} title={title} key={this.state.page.xid}/>
                    <div className="container">
                        <div className="row">
                            <h4>
                                {state.prompt}
                            </h4>
                        </div>
                        <div className="row">
                            <ul className="list-group multiple-choice-choices-container">
                                {choices}
                            </ul>
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
        if(this.isMounted()) {
            this.setState(getPageState());
        }
    }
});

module.exports = QuestionnaireView;