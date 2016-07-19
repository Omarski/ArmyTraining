/**
 * Created by Alec on 6/7/2016.
 */
var React = require('react');

var ASR = React.createClass({



    render: function() {
        // setup plugin html code
        var pluginHTML = '<applet code="org.jdesktop.applet.util.JNLPAppletLauncher" archive="applet-launcher.jar,SpeechInterfaceApplet.jar" height="0" mayscript="yes" scriptable="true" id="ASRApplet" name="ASRApplet">\n';
        pluginHTML += '<param name="codebase_lookup" value="false"/>\n';
        pluginHTML += '<param name="prgressbar" value="true"/>\n';
        pluginHTML += '<param name="subapplet.classname" value="com.alelo.speechinterfaceapplet.SpeechInterfaceApplet"/>\n';
        pluginHTML += '<param name="subapplet.displayname" value="SpeechInterface"/>\n';
        pluginHTML += '<param name="jnlpNumExtensions" value="1"/>\n';
        pluginHTML += '<param name="jnlpExtension1" value="speechinterface15.jnlp"/>\n';
        pluginHTML += '<param name="installationType" value="wan"/>\n';
        pluginHTML += '<param name="jnlp_href" value="speechinterface16.jnlp"/>\n';
        pluginHTML += '</applet>\n';

        var dangerousMarkup = {
            __html: pluginHTML // the whole markup string you want to inject
        };

        return (
            <div dangerouslySetInnerHTML={dangerousMarkup}></div>);

    }
});

module.exports = ASR;