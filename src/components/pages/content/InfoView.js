var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');


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
                    <p className="lead" key={data.page.xid + String(index) + "note"}>{item.text}</p>
                );
            });
        }

        // TODO: add check for if the video is full screen, and center it if there is no note

        if (props.page.media) {
            var media = props.page.media;
            mediaItems = media.map(function(item, index) {
                var filePath = "data/media/" + item.file;
                var result = <div key={index}>Unknown File Type</div>;

                if (item.type === "video") {
                    // TODO: if video check for cutscene or fullcoach, check for mediaCaption videoTranscript
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
        var pageNotes = state.note;
        var media = state.media;

        var mediaContainer = "";
        if (media) {
            mediaContainer = <div className="infoMediaContainer">{media}</div>;
        }

        function createMarkup(n) {
            var str = "";
            if (n.length) {
                for (var i = 0; i < n.length; i++) {
                    str += n[i];
                }
            } else {
                n = str;
            }

            return {__html: str};
        }
        return (

            <div className="infoContainer">
                <div className="infoTitle">
                    <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                </div>
                <div className="infoDataContainer col-md-6 col-md-offset-3">
                    {mediaContainer}
                    <div className="infoNoteContainer">{pageNotes}</div>
                </div>
            </div>
        );
    },
    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        console.log("is mounted?")
        if (this.isMounted()) {
            console.log("mounted setstate")
            this.setState(getPageState(this.props));
        }

    }
});

module.exports = InfoView;