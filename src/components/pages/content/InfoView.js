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

var _hasNotes = false;
var _imageReady = false;
var _hasImage = false;
var _wideImageLayout = false;

function getPageState(cmp, props) {
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
        mediaTitle: null,
        mediaAltText: null,
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
                        case "mediarollover":
                            data.mediaTitle = item.value;
                            break;
                        case "mediaalttext":
                            data.mediaAltText = item.value;
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
                            <div key={data.page.xid + String(index) + "note"} dangerouslySetInnerHTML={createNote()}></div>
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
                var altText = "";
                var mediaTitle = "";
                var mediaBlurb = "";
                var mediaCaption = "";

                // if no info tag, use info on media object
                if(props.page.info && props.page.info.property){
                    props.page.info.property.map(function(item){
                        switch(item.name){
                            case "mediadisplayblurb":
                                mediaCaption = item.value;
                                break;
                            case "mediarollover":
                                mediaTitle = item.value;
                                break;
                            case "mediaalttext":
                                altText = item.value;
                                break;
                            default:
                            //no op
                        }
                    });
                }
                /*
                    Removed because content will always use the page level info tags instead of the media
                    object info tags.
                
                else if(item.info && item.info.property){
                    item.info.property.map(function(item){
                        switch(item.name){
                            case "mediadisplayblurb":
                                mediaCaption = item.value;
                                break;
                            case "mediarollover":
                                mediaTitle = item.value;
                                break;
                            case "mediaalttext":
                                altText = item.value;
                                break;
                            default:
                            //no op
                        }
                    });
                }
                */

                if (item.type === "video") {
                    if(item.file.split(".")[1] === "mp4") {
                        var cc = "";
                        if (data.transcript !== "") {
                            cc = (<ClosedCaption transcript={data.transcript}/>);
                        }

                        result = (
                            <div className={data.videoType + " info-view-video-container"} key={index + filePath}>
                                <video title={mediaTitle}
                                       alt={altText}
                                       aria-label={mediaTitle}
                                       className="info-video-player"
                                       id="video" controls
                                       autoPlay={SettingsStore.autoPlaySound()}
                                       volume={SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume()}>
                                    <source src={filePath} type="video/mp4"></source>
                                </video>
                                {data.caption}
                                {cc}
                            </div>
                        )
                    }
                }

                if (item.type === "image") {

                    _hasImage = true;
                    result = (<ImageCaption videoType={data.videoType} src={filePath} caption={mediaCaption} key={index + filePath} mediaTitle={mediaTitle} altText={altText} onImageLoaded={cmp.imageReady}/>);
                }

                return result;

            });
        }
    }

    data.note = noteItems;
    data.media = mediaItems;

    return data;
}

function playMediaAudio(xidArray){
    //xid is of the form "000000000.mp3"
    if(xidArray.length > 0){
        $("#audioControlButton").prop('disabled', false);
        document.getElementById("audio").onended = (function(){
            xidArray.shift();
            playMediaAudio(xidArray);
        });
        playAudio(xidArray[0]);
    }
    if(xidArray.length === 0){
        var audio = document.getElementById('audio');
        var source = document.getElementById('mp3Source');
        $("#audioControlButton").prop('disabled', true);
        source.src = "";
        audio.load();
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
        var pageState = getPageState(this, this.props);
        return pageState;
    },

    componentWillMount: function() {
        PageStore.addChangeListener(this._onChange);
        SettingsStore.addChangeListener(this._onChange);
        ClosedCaptionStore.addChangeListener(this._onClosedCaptionChange);
    },

    componentDidMount: function() {
        AppStateStore.addChangeListener(this._onAppStateChange);
    },

    componentDidUpdate: function() {

        //play audio recording for info page
        var self = this;
        var noteMedia = self.state.noteAudio;

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

    imageReady:function(w, h) {
        _imageReady = true;
        if (w > 447) {
            _wideImageLayout = true;
        }
        this.setState(getPageState(this, this.props));
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



        if ((state.page.note && state.page.note.length) || pageNotes !== "") {
            _hasNotes = true;
        } else {
            _hasNotes = false;
        }

        if (_hasImage && _imageReady === false) {
            //content = "";
        }


        var hasMedia = false;
        var mediaContainer = "";
        var noteDisplay = "";
        if(_wideImageLayout) {
            if (media) {
                hasMedia = true;
                mediaContainer = (
                    <div className={"row infoMediaContainer"}>
                        {media}
                    </div>
                );
            }




            noteDisplay = (
                <div
                    className={mediaType + " infoNoteContainer row"}
                >
                    <div className="info-page-notes">
                        {pageNotes}
                    </div>
                    {transcriptContainer}
                </div>);

            if(state.page.note && state.page.note.length > 1){
                noteDisplay =   (
                    <div className={mediaType + " infoNoteContainer row"}>
                        <ul className="info-page-notes">{pageNotes}</ul>
                        {transcriptContainer}
                    </div>
                );
            }

        } else {
            var cols = "col-md-6 col-sm-6";
            if (!_hasNotes) {
                cols = "col-md-12 col-sm-12";
            }
            if (media) {
                hasMedia = true;
                mediaContainer = (
                    <div className={"infoMediaContainer " + cols}>
                        {media}
                    </div>
                );
            }

            var mCols = "col-md-6 col-sm-6";
            if (!hasMedia) {
                mCols = "col-md-12 col-sm-12";
            }

            noteDisplay = (
                <div
                    className={mediaType + " infoNoteContainer " + mCols}
                >
                    <div className="info-page-notes">
                        {pageNotes}
                    </div>
                    {transcriptContainer}
                </div>);

            if(state.page.note && state.page.note.length > 1){
                noteDisplay =   (
                    <div className={mediaType + " infoNoteContainer " + mCols}>
                        <ul className="info-page-notes">{pageNotes}</ul>
                        {transcriptContainer}
                    </div>
                );
            }
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
                    <div className="info-container container">
                        {content}
                    </div>
                </div>
            </div>
        );
    },
    _onAppStateChange: function () {
        if (AppStateStore.renderChange()) {
            this.setState(getPageState(this, this.props));
        }
    },

    /**
     * Event handler for 'change' events coming from the BookStore
     */
    _onChange: function() {
        if (this.isMounted()) {
            this.setState(getPageState(this, this.props));
        }
    },

    _onClosedCaptionChange: function () {
        if (ClosedCaptionStore.visible()) {
            if (!_hasNotes) {
                $('.infoMediaContainer').addClass('col-md-6');
                $('.infoMediaContainer').addClass('col-sm-6');
            }

            $('.info-page-notes').hide();
        } else {
            if (!_hasNotes) {
                $('.infoMediaContainer').removeClass('col-md-6');
                $('.infoMediaContainer').removeClass('col-sm-6');
            }

            $('.info-page-notes').show();
        }
    }
});

module.exports = InfoView;