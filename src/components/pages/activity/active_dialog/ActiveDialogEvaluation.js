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

function getCompState(show) {

    var feedback = "";
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
        dialogPassed = true;
    } else {
        feedback = LocalizationStore.labelFor("evaluation", "lblTestFailed");
    }

    return {
        dialogPassed: dialogPassed,
        feedback: feedback,
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
                    check = <span className="glyphicon glyphicon-ok-sign pass active-dialog-eval-icon" aria-hidden="true"></span>
                    objectiveFeedback = item.passDescription;
                    titleCls = "pass";
                } else {
                    check = <span className="glyphicon glyphicon-remove-sign fail active-dialog-eval-icon" aria-hidden="true"></span>
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
                            <button type="button" className="btn btn-default" aria-label="Next" onClick={this.start}>
                                {LocalizationStore.labelFor("evaluation", "btnContinue")}
                            </button>
                        </Panel>
                    </CarouselItem>
                );
            } else {
                var btns = (
                    <div>
                        <button type="button" className="btn btn-default" aria-label="Next" onClick={this.restart}>
                            {LocalizationStore.labelFor("evaluation", "btnRestart")}
                        </button>
                        <button type="button" className="btn btn-default" aria-label="Next" onClick={this.review}>
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
                                    <img draggable="false" className="active-dialog-intro-image" src={LocalizationStore.labelFor("briefing", "image")}></img>
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

            // mark chapter complete if passed
            if (compState.dialogPassed) {
                setTimeout(function() {
                    PageActions.markChapterComplete();
                }, 0.1);
            }
        } else {
            var compState = getCompState(false);
            this.setState(compState);
        }
    }
});

module.exports = ActiveDialogEvaluation;