/**
 * Created by Alec on 4/21/2016.
 */
var React = require('react');
var ConfigStore = require('../../stores/ConfigStore');
var ReactBootstrap = require('react-bootstrap');
var DliStore = require('../../stores/DliStore');

var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Popover = ReactBootstrap.Popover;


var _DliList = null;

function getSettingsState(props) {
    var data = {
        modalControl: null,
        nameList: [],
        iframeSrc: ""
    };
    return data;
}



var DliView = React.createClass({
    getInitialState: function() {
        var settingsState = getSettingsState(this.props);
        return settingsState;
    },

    close: function(){
        this.setState({ showModal: false });
    },

    componentDidMount: function(){
        DliStore.addChangeListener(this._onDliChange);
    },

    openDliWindow: function(name, e){
        var self = this;
        var list = this.state.nameList;
        var src = "";
        // get list of default.html's and open the correct one in the modal
        list.map(function(item, index){
            if(name === item.name){
                src = item.path;
            }
        });
        document.getElementById("dliPopover").setAttribute("class", "fade out"); /* hide popover */
        this.setState({ showModal: true, iframeSrc: src }); /* show modal */
    },

    render: function() {
        var self = this;
        var dliIcon = <span className="glyphicon glyphicon-book btn-icon" aria-hidden="true"></span>;

        var nameList = self.state.nameList;
        var selections = nameList.map(function(item, index){
            return(<ReactBootstrap.ListGroupItem key={"dliPopoverLinks"+index}>
                <a href="#" onClick={self.openDliWindow.bind(self, item.name)}>{item.name}</a>
            </ReactBootstrap.ListGroupItem>);
        });

        var popOver = (<Popover key={"dlipopoverList"} id="dliPopover" title='DLI Section'>
            <ReactBootstrap.ListGroup>
                {selections}
            </ReactBootstrap.ListGroup>
        </Popover>);

        return(<span id="dliView">
            <OverlayTrigger trigger='click' rootClose placement='left' id="DliOverlayTrigger" overlay={popOver}>
                <Button title={"DLI Guide"} alt={"DLI Guide"} className="btn btn-default btn-lg btn-link main-nav-bar-button">
                    {dliIcon}
                </Button>
            </OverlayTrigger>

            <Modal dialogClassName="dlimodal" bsSize="large" show={this.state.showModal} onHide={this.close}>
                <Modal.Header closeButton>
                    <Modal.Title>DLI Guides</Modal.Title>
                </Modal.Header>
                <Modal.Body id="modalbody">
                    <iframe id="iframe" className="dliframe" src={self.state.iframeSrc}></iframe>
                </Modal.Body>
            </Modal>
        </span>);
    },
    _onChange: function() {
        this.setState(getSettingsState());
    },
    _onDliChange:function(){
        this.setState({
            nameList: DliStore.getDliPaths()
        });
    }
});

module.exports = DliView;