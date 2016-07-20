var React = require('react');
var PageStore = require('../../../stores/PageStore');
var SettingsStore = require('../../../stores/SettingsStore');
var PageHeader = require('../../widgets/PageHeader');
var ClosedCaption = require('../../widgets/ClosedCaption');
var ClosedCaptionPanel = require('../../widgets/ClosedCaptionPanel');
var ImageCaption = require('../../widgets/ImageCaption');
var AppStateStore = require('../../../stores/AppStateStore');
var UnsupportedScreenSizeView = require('../../../components/UnsupportedScreenSizeView');
var ClosedCaptionStore = require('../../../stores/ClosedCaptionStore');
var Utils = require('../../widgets/Utils');

var SettingsActions = require('../../../actions/SettingsActions');


function getPageState(props) {
    var noteItems = "";
    var mediaItems = "";
    var data = {
        title: "",
        pageType: "",
        note: "",
        noteAudio: [],
        page: "",
        media: "",
        videoType: "",
        sources: [],
        caption: "",
        transcript: "",
        fullCoach: false
    };

    var caption = "";
    if (props && props.page) {
        data.title = props.page.title;
        data.pageType = props.page.type;
        data.page = props.page;

        if(props.page.info){
            if(props.page.info.property){
                props.page.info.property.map(function(item){
                    switch(item.name){
                        case "cutscene":
                            // TODO: add a class that allows css to distinguish display types?
                            data.videoType = "cutscene";
                            break;
                        case "fullcoach":
                            data.videoType = "fullcoach";
                            data.fullCoach = true;
                            break;
                        case "mediadisplayblurb":
                            data.caption = (<p>{item.value}</p>);
                            break;
                        case "mediacaption":
                            data.sources.push(item.value);
                            break;
                        case "videoTranscript":
                            data.transcript = item.value;
                            break;
                        default:
                            // TODO: Doesn't this reset the video type if the last info.property is
                            // anything other than one of the above?
                            data.videoType = "";
                    }
                })
            }
        }


        if (props.page.note) {
            var notes = props.page.note;

            if(notes && notes.length > 1){
                noteItems = notes.map(function(item, index) {

                    var str = Utils.parseBullets(item.text);


                    if(item.media && item.media[0]){
                        // if statement to detect media in note, should be true
                        data.noteAudio.push(item.media[0].xid);
                    }

                    function createNote() {
                        return {__html: str};
                    }

                    return (
                        <li key={index}>
                            <p  key={data.page.xid + String(index) + "note"} dangerouslySetInnerHTML={createNote()}></p>
                        </li>
                    );
                });
            }else{
                noteItems = notes.map(function(item, index) {
                    if(item.media && item.media[0]){
                        // if statement to detect media in note, should be true
                        data.noteAudio.push(item.media[0].xid);
                    }
                    return (
                        <p key={data.page.xid + String(index) + "note"}>{item.text}</p>
                    );
                });
            }

        }

        if (props.page.media) {
            var media = props.page.media;
            mediaItems = media.map(function(item, index) {
                var filePath = "data/media/" + item.file;
                var result = <div key={index}>Unknown File Type</div>;

                if (item.type === "video") {
                    if(item.file.split(".")[1] === "mp4") {
                        var cc = "";
                        if (data.transcript !== "") {
                            cc = (
                                <div>
                                    <ClosedCaption transcript={data.transcript}/>
                                </div>
                            );
                        }

                        result = <div className={data.videoType} key={index + filePath}>
                            <video title={props.page.title}
                                   alt={props.page.title}
                                   aria-label={props.page.title}
                                   className="info-video-player"
                                   id="video" controls
                                   autoPlay={SettingsStore.autoPlaySound()}
                                   volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                                <source src={filePath} type="video/mp4"></source>
                            </video>
                            {data.caption}
                            {cc}
                        </div>
                    }
                }

                if (item.type === "image") {
                    var altText = ""; // TODO: add check for mediatitle and mediaalttext
                    if(item.info && item.info.property){
                        item.info.property.map(function(item){
                            if(item.name === "mediadisplayblurb"){
                                altText = item.value;
                            }
                        });
                    }else if(props.page.info && props.page.info.property){
                        props.page.info.property.map(function(item){
                            if(item.name === "mediadisplayblurb"){
                                altText = item.value;
                            }
                        });
                    }
                    result = (<ImageCaption videoType={data.videoType} src={filePath} caption={data.caption} key={index + filePath} altText={altText} />);
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

function playMediaAudio(xidArray){
    //xid is of the form "000000000.mp3"

    if(xidArray.length > 0){
        $("#audio").bind('ended', function(){
            xidArray.shift();
            playMediaAudio(xidArray);
        });
        playAudio(xidArray[0]);
    }
}

function playAudio(xid){
    var audio = document.getElementById('audio');
    var source = document.getElementById('mp3Source');
    // construct file-path to audio file
    source.src = "data/media/" + xid;
    audio.load();
    audio.play();
    audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
}

var InfoView = React.createClass({
    getInitialState: function() {
        var pageState = getPageState(this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
        SettingsStore.addChangeListener(this._onChange);
        ClosedCaptionStore.addChangeListener(this._onClosedCaptionChange);
    },

    componentDidMount: function() {
        //play audio recording for info page
        var self = this;
        var noteMedia = self.state.noteAudio;
        AppStateStore.addChangeListener(this._onAppStateChange);
        var video = null;
        // play all note media in order (see dnd for example)
        playMediaAudio(noteMedia);
        video = document.getElementById("video");
        if(video){
            video.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
            video.onvolumechange=function(){
                self.updateVolume();
            };
        }
        $('[data-toggle="tooltip"]').tooltip();

    },

    updateVolume: function(){
        var settings = store.get('settings') || {};
        var video = document.getElementById("video");
        var vol = 1.0;

        if(settings.voiceVolume){
            vol = settings.voiceVolume;
        }
        vol = video.volume;

        //this is a bad fix, do not do this
       // settings['voiceVolume'] = vol;
       // store.set('settings', settings);
        // ...

        SettingsActions.updateVoiceVolume(vol);
    },

    componentWillUnmount: function() {
        PageStore.removeChangeListener(this._onChange);
        SettingsStore.removeChangeListener(this._onChange);
        AppStateStore.removeChangeListener(this._onAppStateChange);
        ClosedCaptionStore.removeChangeListener(this._onClosedCaptionChange);
    },
    render: function() {
        var self = this;
        var state = self.state;
        var title = state.title;
        var pageType = state.pageType;
        var pageNotes = state.note;
        var media = state.media;
        var mediaType = state.videoType;
        var isFullCoach = state.fullCoach;
        var content = "";
        var transcriptContainer = "";

        if (this.state.transcript) {
            transcriptContainer = (
                <ClosedCaptionPanel transcript={this.state.transcript} />
            );
        }

        var noteDisplay = (
            <div
                className={mediaType + " infoNoteContainer col-md-6 col-sm-6"}
            >
                <div className="info-page-notes">
                    {pageNotes}
                </div>
                {transcriptContainer}
            </div>);

        if(state.page.note && state.page.note.length > 1){
            noteDisplay =   (
                <div className={mediaType + " infoNoteContainer col-md-6 col-sm-6"}>
                    <ul className="info-page-notes">{pageNotes}</ul>
                    {transcriptContainer}
                </div>
            );
        }

        var mediaContainer = "";
        if (media) {

            if (AppStateStore.isMobile()) {
                if(self.props.page.media[0].type === "video"){
                    return (<UnsupportedScreenSizeView/>);
                }
            }

            mediaContainer = (
                <div className="infoMediaContainer col-md-6 col-sm-6">
                    {media}
                </div>
                );
        }

        if (isFullCoach) {

            if (AppStateStore.isMobile()) {
                return (<UnsupportedScreenSizeView/>);
            }

            content = (
                <div className="row">
                    {mediaContainer}
                    {noteDisplay}
                </div>
            );

        } else {
            content = (
                <div>
                    {mediaContainer}
                    {noteDisplay}
                </div>
            );
        }

        //update Please
        return (
            <div>
                <PageHeader sources={state.sources} title={title} key={this.state.page.xid}/>
                <div className="infoContainer" key={"page-" + this.state.page.xid}>
                    <audio autoPlay id="audio" volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                        <source id="mp3Source" src="" type="audio/mp3"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <div className="info-container container-fluid">
                        {content}
                    </div>
                </div>
            </div>
        );
    },
    _onAppStateChange: function () {
        if (AppStateStore.renderChange()) {
            this.setState(getPageState(this.props));
        }
    },

    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getPageState(this.props));
        }
    },

    _onClosedCaptionChange: function () {
        if (ClosedCaptionStore.visible()) {
            $('.info-page-notes').hide();
        } else {
            $('.info-page-notes').show();
        }
    }
});

module.exports = InfoView;