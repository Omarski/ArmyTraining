var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var ActiveDialogConstants = require('../../../../constants/active_dialog/ActiveDialogConstants');
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');
var LocalizationStore = require('../../../../stores/LocalizationStore');

function getCompState(show) {
    return {
        show: show,
        intro: ActiveDialogStore.briefings() || ""
    };
}

var ActiveDialogIntro = React.createClass({

    hideModal: function() {
        this.setState(getCompState(false));
        ActiveDialogActions.startDialog();
        ActiveDialogActions.continueDialog();
    },

    getInitialState: function() {
        return getCompState(false);
    },

    componentWillMount: function() {
        ActiveDialogStore.addChangeListener(this._onDialogChange);
    },

    componentWillUnmount: function() {
        ActiveDialogStore.removeChangeListener(this._onDialogChange);
    },

    render: function() {
        var content= "";
        var steps = "";

        if (this.state.intro && (typeof this.state.intro === "string") && this.state.intro !== "") {
            var intro = this.state.intro;

            if (intro.indexOf("\n")) {
                var parts = intro.split("\n");
                content = parts.shift();

                steps = parts.map(function(item, index) {
                   return (
                       <p key={index}>
                           {item}
                       </p>
                   );
                });
            }
        }

        return (
            <Modal
                id="introModal"
                show={this.state.show}
                onHide={this.hideModal}
                >
                <Modal.Header>
                    <Modal.Title>Intro</Modal.Title>
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
                                            <p>{content}</p>
                                            {steps}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={this.hideModal}>Start</Button>
                </Modal.Footer>
            </Modal>
        );
    },

    _onDialogChange: function() {
        if (ActiveDialogStore.getCurrentAction() && ActiveDialogStore.getCurrentAction().type == ActiveDialogConstants.ACTIVE_DIALOG_ACTION_INTRO) {
            if (ActiveDialogStore.briefings() !== "" && !ActiveDialogStore.isDialogStarted()) {
                this.setState(getCompState(true));
            }
        }
    }
});

module.exports = ActiveDialogIntro;