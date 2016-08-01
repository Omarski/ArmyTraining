/** @jsx React.DOM */
var React = require('react');
var ReactDOM = require('react-dom');
var MainView = require('./components/MainView');
var ASRStore = require('./stores/ASRStore');
var SettingsStore = require('./stores/SettingsStore');

ReactDOM.render(
    <MainView />,
    document.getElementById('mainView')
);

/*
    The following are the declarations for the difference audio sounds for click events
 */

// user clicks bookmark button
$(document).on("click", ".btn-bmk", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    if (source) {
        source.src = "data/media/Bookmark01.mp3";
    }

    if(audio && source) {
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }

});

// user drops piece is matching/ordering/sorting
$(document).on("click", ".btn-drp", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    if (source) {
        source.src = "data/media/Drop01.mp3";
    }

    if(audio && source) {
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }

});

document.onselectstart = function(e) {
    if(e.path[0].classList[0] === "tooltip-inner" || e.path[1].classList[0] === "tool-tip-inner"){
        return true;
    }
    return false;
};

// user clicks explorer button
$(document).on("click", ".btn-exp", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    if (source) {
        source.src = "data/media/explorerwhoosh01.mp3";
    }

    if(audio && source) {
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }

});

// pick up piece in matching/ordering/sorting
$(document).on("click", ".btn-drg", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    if (source) {
        source.src = "data/media/Grab02.mp3";
    }

    if(audio && source) {
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }

});

$(document).on("click", ".btn-cnf", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    if (source) {
        source.src = "data/media/PDQconfirm01.mp3";
    }

    if(audio && source) {
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }

});

// user clicks previous or next buttons
$(document).on("click", ".btn-nxt", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    if (source) {
        source.src = "data/media/PrevNext01.mp3";
    }

    if(audio && source) {
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }

});

// user resets practice exercise
$(document).on("click", ".btn-rst", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    if (source) {
        source.src = "data/media/ResetPractice01.mp3";
    }

    if(audio && source) {
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }

});

// user Clicks DLI button, Settings Button, Reference, Help, Mute
$(document).on("click", ".btn-set", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    if (source) {
        source.src = "data/media/ToolbarIcon01.mp3";
    }

    if(audio && source) {
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }

});

// user Clicks checkboxes in PDQ and Quizzes
$(document).on("click", ".btn-clk", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    if (source) {
        source.src = "data/media/Click01a.mp3";
    }

    if(audio && source) {
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }

});

// sound from flash???
$(document).on("click", ".btn-misc", function(){
    var audio = document.getElementById('mainViewAudio');
    var source = document.getElementById('mainViewMp3Source');

    if (source) {
        source.src = "data/media/Neutral.mp3";
    }

    if(audio && source) {
        audio.load();
        audio.play();
        audio.volume = SettingsStore.muted() ? 0.0 : SettingsStore.voiceVolume();
    }

});