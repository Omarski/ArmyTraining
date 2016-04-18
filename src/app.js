/** @jsx React.DOM */
var React = require('react');
var MainView = require('./components/MainView');
var ASRStore = require('./stores/ASRStore');

React.render(
    <MainView />,
    document.getElementById('mainView')
);
/*
$('.btn-action').on('click', function(){
    var audio = document.getElementById('audio');
});
    */