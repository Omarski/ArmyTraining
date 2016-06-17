var React = require('react');
var InfoTagConstants = require('../../../constants/InfoTagConstants');
var PageStore = require('../../../stores/PageStore');
var PageHeader = require('../../widgets/PageHeader');
var QuestionnaireActions = require('../../../actions/QuestionnaireActions');
var QuestionnaireStore = require('../../../stores/QuestionnaireStore');
var Utils = require('../../widgets/Utils');

var INPUT_TYPE_CHECKBOX = "checkbox";
var INPUT_TYPE_RADIO = "radio";

function getPageState(props) {
    var data = {
        page: null,
        title: "",
        sources: [],
        answers: [],
        answerToPlaylistMapping: {},
        prompt: "",
        selectedPlaylists: {}
    };

    // load previous answers
    var previousAnswer = QuestionnaireStore.getAnswer();
    var previousPlaylistsArray = QuestionnaireStore.getPlaylists();

    var answersObjsToDisplay = [];
    var answerToPlaylistMapping = {};

    // iterate over each answer pulling out data
    for (var answerIndex in props.page.answer) {

        // create new questionnaire item with default values
        var rooneyEatsIt = {
            checked: "",
            groupid: "1",
            playlist: "",
            text: "",
            type: INPUT_TYPE_CHECKBOX
        };

        var answerObj = props.page.answer[answerIndex];

        // get text to display for this option
        if (answerObj.nut.uttering.utterance.translation.text) {
            rooneyEatsIt.text = answerObj.nut.uttering.utterance.translation.text;
        }

        // check if this option should be hidden. if so skip it
        if (isHidden(answerObj, previousPlaylistsArray)) {
            continue;
        }

        // extract playlists for this option
        var playlists = getPlaylist(answerObj);
        if (playlists != null) {
            rooneyEatsIt.playlist = playlists;
        }

        // see if option is a radio button
        if (isRadioButton(answerObj)) {
            rooneyEatsIt.type = INPUT_TYPE_RADIO;
            rooneyEatsIt.groupid = getGroupId(answerObj);
        }

        // mark checked if any one of these conditions is true
        if (isAlreadySelected(answerObj, previousAnswer) || isRecommended(answerObj) || isRequired(answerObj)) {
            rooneyEatsIt.checked = "checked";
        }

        // add answer object to be displayed to the user
        answersObjsToDisplay.push(rooneyEatsIt);

        // add to playlist mapping
        answerToPlaylistMapping[rooneyEatsIt.text] = rooneyEatsIt.playlist;
    }

    if (props && props.page) {
        data.answers = answersObjsToDisplay;
        data.page = props.page;
        data.answerToPlaylistMapping = answerToPlaylistMapping;
        data.prompt = props.page.prompt.text;
        data.title = props.page.title;
    }

    return data;
}

function getGroupId(answerObj) {
    if (answerObj && answerObj.nut && answerObj.nut.uttering && answerObj.nut.uttering.info) {
        var groupId = Utils.findInfo(answerObj.nut.uttering.info, InfoTagConstants.INFO_PROP_GROUPID);
        if (groupId !== null) {
            return groupId;
        }
    }
    return "1";
}

function getPlaylist(answerObj) {
    if (answerObj && answerObj.nut && answerObj.nut.uttering && answerObj.nut.uttering.info) {
        var playlists = Utils.findInfo(answerObj.nut.uttering.info, InfoTagConstants.INFO_PROP_PLAYLIST);
        if (playlists !== null) {
            return playlists;
        }
    }
    return null;
}

function isAlreadySelected(answerObj, previousAnswer) {
    if (previousAnswer!== null && previousAnswer.selectedPlaylists !== null) {
        if (answerObj.nut.uttering.utterance.translation.text in previousAnswer) {
            return true;
        }
    }
    return false;
}

function isHidden(answerObj, previousPlaylistsArray) {

    var hiddenCondition = null;

    // get hidden condition text
    if (answerObj && answerObj.nut && answerObj.nut.uttering && answerObj.nut.uttering.info) {
        hiddenCondition = Utils.findInfo(answerObj.nut.uttering.info, InfoTagConstants.INFO_PROP_HIDDEN);
        if (hiddenCondition !== null && previousPlaylistsArray != null && previousPlaylistsArray.length > 0) {
            // convert playlist into a map
            var evalMap = {};
            var playlistLen = previousPlaylistsArray.length;
            while(playlistLen--) {
                evalMap[previousPlaylistsArray[playlistLen]] = true;
            }

            return Utils.evalPostfix(hiddenCondition, evalMap);
        }
    }
    return false;
}

function isRecommended(answerObj) {
    if (answerObj && answerObj.nut && answerObj.nut.uttering && answerObj.nut.uttering.info) {
        if (Utils.findInfo(answerObj.nut.uttering.info, InfoTagConstants.INFO_PROP_RECOMMENDED) !== null) {
            return true;
        }
    }
    return false;
}

function isRadioButton(answerObj) {
    if (answerObj && answerObj.nut && answerObj.nut.uttering && answerObj.nut.uttering.info) {
        if (Utils.findInfo(answerObj.nut.uttering.info, InfoTagConstants.INFO_PROP_RADIOBUTTON) !== null) {
            return true;
        }
    }
    return false;
}

function isRequired(answerObj) {
    if (answerObj && answerObj.nut && answerObj.nut.uttering && answerObj.nut.uttering.info) {
        if (Utils.findInfo(answerObj.nut.uttering.info, InfoTagConstants.INFO_PROP_REQUIRED) !== null) {
            return true;
        }
    }
    return false;
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
        var self = this;
        // check for any pre-selected items
        setTimeout(function() {
            self.answerChange(null, null);
        }, 10);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
    },


    answerChange: function(answer, event) {
        var state = this.state;

        // iterate over each item and see if it selected
        $("#questionnaireForm :input").each(function () {
            if (this.checked) {
                state.selectedPlaylists[this.value] = state.answerToPlaylistMapping[this.value];
            } else {
                if (state.selectedPlaylists[this.value]) {
                    delete state.selectedPlaylists[this.value];
                }
            }
        });

        // submit answer to store
        QuestionnaireActions.answer(state.selectedPlaylists);
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
            // check input type and create an element
            var inputElement = "";
            var inputId = "answer" + index;
            switch (item.type) {
                case INPUT_TYPE_RADIO:
                    if (item.checked) {
                        inputElement = (<div className="radio">
                            <label for={inputId}>
                                <input id={inputId} name={item.groupid} type="radio" defaultChecked value={item.text} onChange={_this.answerChange.bind(_this, item)}/>
                                {item.text}
                            </label>
                        </div>);
                    }
                    else {
                        inputElement = (<div className="radio">
                            <label for={inputId}>
                                <input name={item.groupid} type="radio" value={item.text} onChange={_this.answerChange.bind(_this, item)}/>
                                {item.text}
                            </label>
                        </div>);
                    }
                    break;
                default:
                    if (item.checked) {
                        inputElement = (<div className="checkbox">
                            <label for={inputId}>
                                <input type="checkbox" defaultChecked value={item.text} onChange={_this.answerChange.bind(_this, item)}/>
                                {item.text}
                            </label>
                        </div>);
                    }
                    else {
                        inputElement = (
                            <div className="checkbox">
                                <label for={inputId}>
                                    <input type="checkbox" value={item.text} onChange={_this.answerChange.bind(_this, item)}/>
                                    {item.text}
                                </label>
                            </div>);
                    }
            }



            return (<li key={page.xid + String(index)} className="list-group-item multiple-choice-list-group-item" >
                        {inputElement}
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
                            <form id="questionnaireForm">
                                <ul className="list-group multiple-choice-choices-container">
                                    {choices}
                                </ul>
                            </form>
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