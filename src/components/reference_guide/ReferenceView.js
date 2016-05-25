/**
 * Created by Alec on 4/21/2016.
 */
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var ReferenceStore = require('../../stores/ReferenceStore');
var ReferenceGestureView = require('../../components/reference_guide/ReferenceGestureView');
var ReferenceMapView = require('../../components/reference_guide/ReferenceMapView');
var ReferencePdfView = require('../../components/reference_guide/ReferencePdfView');
var ReferenceDictionaryView = require('../../components/reference_guide/ReferenceDictionaryView');
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var NavDropdown = ReactBootstrap.NavDropdown;
var MenuItem = ReactBootstrap.MenuItem;
var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;

function getSettingsState(props) {
    var data = {
        showModal: false,
        selectedIndex: 1,
        content: null,
        referenceJson: [],
        mapSource: null,
        pdfSources: null,
        gestureSources: null,
        dictionarySources: null
    };



    return data;
}

var ReferenceView = React.createClass({
    close: function(){
        this.setState({ showModal: false });
    },

    openModal: function(){
        this.setState({ showModal: !this.state.showModal });
    },

    handleSelect: function(eventKey, e) {
        //event.preventDefault();
        if(typeof(eventKey) === "object"){
            this.setState({ selectedIndex: 1, showModal: false});
        }else if(typeof(eventKey) === "number"){
            this.setState({ selectedIndex: eventKey });
        }
    },

    getInitialState: function() {
        var settingsState = getSettingsState(this.props);
        return settingsState;
    },

    componentWillMount: function() {
        //  SettingsStore.addChangeListener(this._onChange);
        var self = this;
        // get reference.json
        $.getJSON("data/reference/reference.json", function(file){
            if(file && file.items){
                var mapSource = null;
                var pdfSources = null;
                var gestureSources = null;
                var dictionarySources = null;

                file.items.map(function(item){
                    switch(item.type){
                        case "gesture":
                            gestureSources = item.assets;
                            break;
                        case "image":
                            mapSource = item.assets[0].path;
                            break;
                        case "pdfList":
                            pdfSources = item.assets;
                            break;
                        case "dictionary":
                            dictionarySources = item.assets;
                            break;
                        default:
                            // no op
                    }
                });

                self.setState({
                    referenceJson: file.items,
                    mapSource: mapSource,
                    pdfSources: pdfSources,
                    gestureSources: gestureSources,
                    dictionarySources: dictionarySources
                })
            }
        });
    },

    componentDidMount: function() {
        //  SettingsStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        //  SettingsStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var state = self.state;
        var content = "";
        var dictionaryNav = "";
        var pdfNav = "";
        var mapNav = "";
        var gestureNav = "";

        if(state.dictionarySources){
            dictionaryNav = (<NavItem eventKey={3} hidden={true}>
                Dictionary
            </NavItem>);
        }

        if(state.pdfSources){
            console.dir(state.pdfSources);

            var dropdownItems = state.pdfSources.map(function(item, index){
                return (<MenuItem eventKey={"4." + (index+1) } href={item.path} target={"_blank"}>{item.name}</MenuItem>);
            });

            pdfNav = (<NavDropdown eventKey={4} title="PDF Takeaways" id="nav-dropdown">
                {dropdownItems}
            </NavDropdown>);
        }

        if(state.mapSource){
            mapNav = (<NavItem eventKey={1}>
                Map
            </NavItem>);
        }

        if(state.gestureSources){
            gestureNav = (<NavItem eventKey={2} title="Item">
                Gestures
            </NavItem>);
        }

        switch (state.selectedIndex) {
            case 1:
                content = (<ReferenceMapView mapSource={self.state.mapSource} />);
                break;
            case 2:
                content = (<ReferenceGestureView gestureSources={self.state.gestureSources} />);
                break;
            case 3:
                content = (<ReferenceDictionaryView dictionarySources={self.state.dictionarySources} />);
                break;
            default:
                // no op, PDFs open in new tab/window
                break;
        }
        return (
            <div id="referenceView">

                <Modal dialogClassName="referenceModal" bsSize="large" show={state.showModal} onHide={this.close}>
                    <Modal.Header closeButton>
                        <Modal.Title>Reference Guide</Modal.Title>
                    </Modal.Header>
                    <Modal.Body id="referenceModalBody">
                        <Nav bsStyle="tabs" activeKey={state.selectedIndex} onSelect={this.handleSelect}>
                            {mapNav}
                            {gestureNav}
                            {dictionaryNav}
                            {pdfNav}
                        </Nav>
                        <div className="container-fluid">
                            {content}
                        </div>
                    </Modal.Body>
                </Modal>
                <button onClick={this.openModal} type="button" className="btn btn-default btn-lg btn-link main-nav-bar-button" aria-label="reference">
                    <span className="glyphicon glyphicon-education btn-icon" aria-hidden="true"></span>
                </button>
            </div>
        );
    },
    _onChange: function() {
        this.setState(getSettingsState());
    }
});

module.exports = ReferenceView;