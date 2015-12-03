var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Tooltip = ReactBootstrap.Tooltip;
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');


function getPageState(props) {
    var noteItems = "";
    var mediaItems = "";
    var data = {
        title: "",
        pageType: "",
        note: "",
        page: "",
        media: "",
        sources: [],
        volume: SettingsStore.voiceVolume()
    };

    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;
        if (props.page.note) {
            var notes = props.page.note;

            noteItems = notes.map(function(item, index) {
                return (
                    <p key={index}>{item.text}</p>
                );
            });
        }

        if (props.page.media) {
            var media = props.page.media;
            mediaItems = media.map(function(item, index) {
                var filePath = "data/media/" + item.file;
                var result = <div key={index}>Unknown File Type</div>;

                if (item.type === "video") {
                    if(item.file.split(".")[1] == "mp4") {
                        result = <div key={index}>
                            <video width="320" height="240" controls>
                                <source src={filePath} type="video/mp4"></source>
                            </video>
                        </div>
                    }
                }

                if (item.type === "image") {
                    result = <div key={index}>
                        <img src={filePath}></img>
                    </div>
                }

                if(item.info){
                    if(item.info.property){
                        data.sources = item.info.property.map(function(mediaProperty){
                            if(mediaProperty.name == "mediacaption"){
                                //console.log("mediacaption found: " + mediaProperty.value);
                                return(mediaProperty.value);
                            }else{
                                return("");
                            }
                        });
                    }
                }
                return result;

            });
        }
    }

    data.note = noteItems;
    data.media = mediaItems;
    //console.dir(data);
    return data;
}

var InfoView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
        SettingsStore.addChangeListener(this._onChange);
    },

    componentDidMount: function() {
        //PageStore.addChangeListener(this._onChange);
        $('[data-toggle="tooltip"]').tooltip();
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
        SettingsStore.removeChangeListener(this._onChange);
    },
    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var pageType = state.pageType;
        var note = state.note;
        var media = state.media;
        var attributions = <Tooltip>{state.sources}</Tooltip>;

        return (
            <div className="infoContainer">
                <div className="infoTitle">
                    <h3>
                        {title}
                        <OverlayTrigger placement="right" overlay={attributions}>
                            <span className="infoAttributions glyphicon glyphicon-info-sign"></span>
                        </OverlayTrigger>
                    </h3>

                </div>
                <div className="infoDataContainer">
                    <div className="infoMediaContainer">{media}</div>
                    <div className="infoNoteContainer">{note}</div>
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

module.exports = InfoView;