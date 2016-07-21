var InfoTagConstants = require('../../../constants/InfoTagConstants');
var ReactBootstrap = require('react-bootstrap');
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var LocalizationStore = require('../../../stores/LocalizationStore');
var PageHeader = require('../../widgets/PageHeader');
var PageActions = require('../../../actions/PageActions');
var PageStore = require('../../../stores/PageStore');
var PrePostTestActions = require('../../../actions/PrePostTestActions');
var React = require('react');
var QuestionnaireActions = require('../../../actions/QuestionnaireActions');
var QuestionnaireStore = require('../../../stores/QuestionnaireStore');
var UnitActions = require('../../../actions/UnitActions');
var UnitStore = require('../../../stores/UnitStore');
var Utils = require('../../widgets/Utils');


function getPageState(props) {
    var data = {
        btnConfirm: "",
        btnRestart: "",
        lblConfirm: "",
        lblLessons: "",
        lblTime: "",
        page: "",
        pageType: "",
        selectedUnits: [],
        title: ""
    };

    // gather all units
    var units = UnitStore.getAll();

    // gather selected playlists
    var plists = QuestionnaireStore.getPlaylists();

    var totalEstimatedTime = 0;

    // iterate over units gathering only selected units
    var selectedUnits = [];
    for (var unitIndex in units) {
        var unit = units[unitIndex];
        var unitId = unit.id;
        var unitData = unit.data;
        var bHidden = false;

        // hide certain units
        var chapterLength = unitData.chapter.length;
        while(chapterLength--) {
            var chapter = unitData.chapter[chapterLength];
            if (Utils.findInfo(chapter.info, InfoTagConstants.INFO_PROP_PRETEST) !== null ||
                Utils.findInfo(chapter.info, InfoTagConstants.INFO_PROP_POSTTEST) !== null) {
                bHidden = true;
                break;
            }
        }

        // get info
        if (unitData.xid && (plists.indexOf(unitData.xid) !== -1)) {
            // create object and add it
            selectedUnits.push({id: unitId, title: unitData.title, hidden: bHidden});

            // gather minutes
            if (unitData.playlistInfo != null) {
                var playlistInfoLength = unitData.playlistInfo.length;

                while(playlistInfoLength--) {
                    var pInfo = unitData.playlistInfo[playlistInfoLength];

                    // find tag
                    var minutes = Utils.findInfo(pInfo, InfoTagConstants.INFO_PROP_MINUTES);
                    if (minutes !== null) {
                        totalEstimatedTime += Number(minutes);
                    }
                }
            }
        }
    }

    // gather estimated time text
    var estimatedTime = Utils.minutesToDisplayText(totalEstimatedTime);

    if (props && props.page) {
        data.btnConfirm = LocalizationStore.labelFor("questionnaireEnd", "btnConfirm");
        data.btnRestart = LocalizationStore.labelFor("questionnaireEnd", "btnRestart");
        data.lblConfirm = LocalizationStore.labelFor("questionnaireEnd", "lblConfirm");
        data.lblLessons = LocalizationStore.labelFor("questionnaireEnd", "btnConfirmLabel");
        data.lblTime = LocalizationStore.labelFor("questionnaireEnd", "lblTime", [estimatedTime]);
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        data.selectedUnits = selectedUnits;
    }

    return data;
}


var QuestionnaireEndView = React.createClass({
    getInitialState: function() {
        return getPageState(this.props);
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
    },

    confirm: function() {
        var selectedUnits = this.state.selectedUnits;
        var selectedUnitsLength = selectedUnits.length;

        // mark all selected units as required
        if (selectedUnitsLength > 0) {

            while(selectedUnitsLength--) {
                UnitActions.markUnitRequired(selectedUnits[selectedUnitsLength].id);
            }

            // mark questionnaire as complete
            PageActions.markChapterComplete();

            // build pre and post test lessons
            PrePostTestActions.build();

            // go to next page
            PageActions.loadNext({});
        }
    },

    reset: function() {
        QuestionnaireActions.restart();
    },

    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;

        var playlistGroupItems = <ListGroupItem />;

        if (this.state.selectedUnits && this.state.selectedUnits.length > 0) {
            playlistGroupItems = this.state.selectedUnits.map(function(item, index) {
                if(item.hidden === true) {
                    return null;
                }

                return (
                    <li key={index}>{item.title}</li>
                )
            });
        }


        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={state.page.xid}/>

                <div className="panel panel-default questionnaire-container">
                    <div className="panel-heading">
                        <h3 className="panel-title">Summary</h3>
                    </div>
                    <div className="panel-body">
                        <div className="row">
                            <h4>
                                {state.lblConfirm}
                            </h4>
                        </div>
                        <div className="row">
                            <ul className="questionnaire-results-container">
                                {playlistGroupItems}
                            </ul>
                            <h4 className="questionnaire-time-lbl">{state.lblTime}</h4>
                        </div>
                    </div>
                    <div className="panel-footer">
                        <div className="row">
                            <div className="col-md-6 col-sm-6 questionnaire-end-btn-col">
                                <button className="btn btn-default btn-action" onClick={self.reset}>{state.btnRestart}</button>
                            </div>
                            <div className="col-md-6 col-sm-6 questionnaire-end-btn-col">
                                <button className="btn btn-default btn-action" onClick={self.confirm}>{state.btnConfirm}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getPageState(this.props));
        }
    }
});

module.exports = QuestionnaireEndView;