var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Carousel = ReactBootstrap.Carousel;
var CarouselItem = ReactBootstrap.CarouselItem;
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var Panel = ReactBootstrap.Panel;
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');
var ActiveDialogConstants = require('../../../../constants/active_dialog/ActiveDialogConstants');
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var PageActions = require('../../../../actions/PageActions');
var LocalizationStore = require("../../../../stores/LocalizationStore");
var SettingsStore = require("../../../../stores/SettingsStore");

function getCompState(show) {

    var feedback = "";
    var feedbackVid = "";
    var dialogPassed = false;
    var scorePercent = 0;
    var objectivesPassed = 0;

    var objectives = ActiveDialogStore.getObjectives();

    if (objectives && objectives.length > 0) {
        // calculate score
        var objectivesCount = objectives.length;
        var objectivesLength = objectives.length;

        if (objectivesLength > 0) {
            while(objectivesLength--) {
                var objective = objectives[objectivesLength];
                if (objective.pass == true) {
                    objectivesPassed++;
                }
            }

            scorePercent = Math.round((objectivesPassed / objectivesCount) * 100);
        }
    }

    // TODO make thresholds configurable
    // get feedback based of score
    if (scorePercent === 100) {
        feedback = LocalizationStore.labelFor("evaluation", "lblTestPassed");
        feedbackVid = LocalizationStore.labelFor("evaluation", "vidTestPassed");
        dialogPassed = true;
    } else {
        feedback = LocalizationStore.labelFor("evaluation", "lblTestFailed");
        feedbackVid = LocalizationStore.labelFor("evaluation", "vidTestFailed");
    }

    return {
        dialogPassed: dialogPassed,
        feedback: feedback,
        feedbackVid: feedbackVid,
        objectives: objectives,
        show: show
    };
}

var ActiveDialogEvaluation = React.createClass({
    start: function() {
        PageActions.loadNext({});
    },

    hideModal: function() {
        this.setState(getCompState(false));
    },

    restart: function() {
        ActiveDialogActions.restart();
    },

    review: function() {
        ActiveDialogActions.showRemediation();
    },

    getInitialState: function() {
        var compState = getCompState(false);
        return compState;
    },

    componentWillMount: function() {
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {
        var carouselItems = "";
        if (this.state.objectives) {
            carouselItems = this.state.objectives.map(function(item, index) {
                var objectiveFeedback = "";
                var check = "";
                var titleCls = ""

                if (item.pass) {
                    check = (
                        <span className="glyphicon pass active-dialog-eval-icon" aria-hidden="true">
                            <img src="images/icons/completeexplorer.png"/>
                        </span>
                    );
                    objectiveFeedback = item.passDescription;
                    titleCls = "pass";
                } else {
                    check = (
                        <span className="glyphicon fail active-dialog-eval-icon" aria-hidden="true">
                            <img src="images/icons/failedquiz.png"/>
                        </span>
                    );
                    objectiveFeedback = item.failDescription;
                    titleCls = "fail";
                }

                var h = (
                    <div className={"active-dialog-eval-title " + titleCls}>
                        {item.label}
                        {check}
                    </div>
                );

                return (
                    <CarouselItem key={index}>
                        <Panel header={h}>
                            {objectiveFeedback}
                        </Panel>
                    </CarouselItem>
                );
            });

            // create and insert into the front
            carouselItems.unshift(
                <CarouselItem key="carouselStart">
                    <Panel header={LocalizationStore.labelFor("evaluation", "lblObjectives")}>
                        {LocalizationStore.labelFor("evaluation", "lblContent")}
                    </Panel>
                </CarouselItem>
            );

            // create and add to the end
            if (this.state.dialogPassed === true) {
                carouselItems.push(
                    <CarouselItem key="carouselEnd">
                        <Panel header={LocalizationStore.labelFor("evaluation", "lblObjectives")}>
                            <button type="button" className="btn btn-default" title={LocalizationStore.labelFor("evaluation", "btnContinue")} aria-label={LocalizationStore.labelFor("evaluation", "btnContinue")} onClick={this.start}>
                                {LocalizationStore.labelFor("evaluation", "btnContinue")}
                            </button>
                        </Panel>
                    </CarouselItem>
                );
            } else {
                var btns = (
                    <div>
                        <button type="button" className="btn btn-default" title={LocalizationStore.labelFor("evaluation", "btnRestart")} aria-label={LocalizationStore.labelFor("evaluation", "btnRestart")} onClick={this.restart}>
                            {LocalizationStore.labelFor("evaluation", "btnRestart")}
                        </button>
                        <button type="button" className="btn btn-default" title={LocalizationStore.labelFor("evaluation", "brnReview")} aria-label={LocalizationStore.labelFor("evaluation", "brnReview")} onClick={this.review}>
                            {LocalizationStore.labelFor("evaluation", "brnReview")}
                        </button>
                    </div>
                );
                carouselItems.push(
                    <CarouselItem key="carouselEnd">
                        <Panel footer={btns}>
                            <p>{LocalizationStore.labelFor("evaluation", "lblEndInstructions")}</p>
                        </Panel>
                    </CarouselItem>
                );
            }
        }

        return (
            <Modal
                id="evaluationModal"
                backdrop="static"
                show={this.state.show}
                onHide={this.hideModal}
                >
                <Modal.Header>
                    <Modal.Title>{LocalizationStore.labelFor("evaluation", "lblTitle")}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="active-dialog-evaluation-feedback-text">
                        <table className="table">
                            <tbody>
                            <tr>
                                <td>
                                    <video title={LocalizationStore.labelFor("evaluation", "lblFeedbackTitle")}
                                           alt={LocalizationStore.labelFor("evaluation", "lblFeedbackTitle")}
                                           aria-label={LocalizationStore.labelFor("evaluation", "lblFeedbackTitle")}
                                           className="info-video-player"
                                           id="video" controls
                                           autoPlay={SettingsStore.autoPlaySound()}
                                           volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                                        <source src={this.state.feedbackVid} type="video/mp4"></source>
                                    </video>
                                </td>
                                <td>
                                    <div className="active-dialog-evaluation-feedback">
                                        {this.state.feedback}
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="panel panel-default">
                        <Carousel interval={0} wrap={false}>
                            {carouselItems}
                        </Carousel>
                    </div>
                </Modal.Body>
            </Modal>
        );
    },

    _onDialogChange: function() {
        if (ActiveDialogStore.getCurrentAction() &&
            ActiveDialogStore.getCurrentAction().type == ActiveDialogConstants.ACTIVE_DIALOG_ACTION_COMPLETE &&
            ActiveDialogStore.isDialogStarted()) {
            var compState = getCompState(true);
            this.setState(compState);

            setTimeout(function() {
                PageActions.markChapterComplete();

                if (compState.dialogPassed) {
                    PageActions.markChapterComplete();
                }
            }, 0.1);
        } else {
            var compState = getCompState(false);
            this.setState(compState);
        }
    }
});

module.exports = ActiveDialogEvaluation;