var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var ActiveDialogConstants = require('../../../../constants/active_dialog/ActiveDialogConstants');
var ActiveDialogStore = require('../../../../stores/active_dialog/ActiveDialogStore');
var ActiveDialogActions = require('../../../../actions/active_dialog/ActiveDialogActions');


function getCompState(show) {
    var data = [];
    var temp = [];

    // get coas
    var coas = ActiveDialogStore.coas();

    var coasLen = coas.length;

    // make sure there is data to be shown
    if (coas && coas.length > 0) {
        // pull out realizations
        for (var i = 0; i < coasLen; i++) {
            var coa = coas[i];
            var isChoice = coa.isChoice === true ? true : false;
            var realizations = coa.realizations;
            var realizationsLen = realizations.length;
            for (var j = 0; j < realizationsLen; j++) {
                var r = realizations[j];
                if (!isDuplicate(temp, r, isChoice)) {
                    data.push({coa: coa, realization: r});
                    temp.push(r);
                }
            }
        }
    } else {
        show = false;
    }

    // shuffle data
    data = AGeneric().shuffle(data);

    return {
        show: show,
        coas: data
    };
}


function isDuplicate(temp, realization, isChoice) {
    var len = temp.length;
    while (len--) {
        var r = temp[len];
        if (isChoice) {
            if (realization.gesture === r.gesture) {
                return true;
            }
        } else {
            if (realization.uttText === r.uttText) {
                return true;
            }
        }
    }
    return false;
}

var ActiveDialogCOAs = React.createClass({

    coaAction: function (coa) {
        this.hideModal();

        ActiveDialogActions.handleInput(coa);
        ActiveDialogActions.continueDialog();
    },


    hideModal: function() {
        this.setState(getCompState(false));
        $('.modal-backdrop').remove();
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
        var _self = this;

        var coasList = <ListGroupItem />;

        if (this.state.coas && this.state.coas.length > 0) {
            coasList = this.state.coas.map(function(item, index) {
                var name = item.realization.anima;
                var displayText = "";

                // get display text
                if (item.coa.isChoice === true) {
                    displayText = item.realization.gesture;
                } else {
                    displayText = item.realization.uttText;

                }

                return  (
                    <ListGroupItem key={index}>
                        <a className="" href="#" data-animation-name={name} onClick={_self.coaAction.bind(_self, item.coa)}>
                            {displayText}
                        </a>
                    </ListGroupItem>
                );
            });
        }

        return (
            <Modal
                id="coasModal"
                backdrop="static"
                show={this.state.show}
                keyboard={false}
                onHide={this.hideModal}
                >
                <Modal.Header>
                    <Modal.Title>Select your Course of Action</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <ListGroup>
                        {coasList}
                    </ListGroup>
                </Modal.Body>
            </Modal>
        );
    },

    _onDialogChange: function() {
        if (ActiveDialogStore.getCurrentAction() && ActiveDialogStore.getCurrentAction().type == ActiveDialogConstants.ACTIVE_DIALOG_ACTION_COA_SET) {
            this.setState(getCompState(true));
            setTimeout(function() {
                ActiveDialogActions.continueDialog();
            }, .25);
        }
    }
});


module.exports = ActiveDialogCOAs;