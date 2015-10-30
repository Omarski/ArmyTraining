
function getMessajer( uri )
{
    return MessajsTester.getMessajer( uri );
}

function doubleSelector( a ) { return document.getElementById( a ); }

var MessajsTester = function()
{
    var readers, writers;

    function init( _readers, _writers )
    {
        readers = _readers;

        writers = _writers;

        doubleSelector('messajs_test').innerHTML = '' +
            '<div style="padding:5px;background-color:#dddddd;border:1px solid gray;">' + 
                '<div><b><i>messajs tester</i></b></div>' +
                'From: <select id="selectFrom">' +
                    '<option>urn:host/nutopia/nustor/nuqi</option>' +
                    '<option>urn:host/nutopia/nudata/utf8ked/1234567890123456789</option>' +
                '</select>' +
                '<br />To: &nbsp; &nbsp; <select id="selectTo">' +
                    '<option>urn:JsMessajer/data/[new-key]</option>' +
                    '<option>urn:host/nutopia/nudata/utf8ked/[new-key]</option>' +
                '</select>' +
                '<br />Mime: <select id="selectMime">' +
                    '<option>text/plain; charset=utf-8</option>' +
                    '<option>application/utf8ked</option>' +
                '</select> <br />' +
                '<button onclick="MessajsTester.startTest()">send</button>' +
                '<div id="mjsLog" style="margin:5px;padding:5px;font-family:courier;font-size:12px;"></div>' +
            '</div>';

        readers.forEach( function( o ) { doubleSelector('selectFrom').innerHTML += '<option>' + o.uri + '</option>'; } );

        writers.forEach( function( o ) { doubleSelector('selectTo').innerHTML += '<option>' + o.uri + '</option>'; } );

        MESSA.setDebugger( function( typ, msg )
        {
            log("MESSA: [" + msg.id + "] " + typ + ( typ == 'startWrite' ? "<textarea>" + msg.buffer + "</textarea>" : '' ) )
        } );

//        MESSA.setChunkSize(2);
    }

    function getMessajer( uri )
    {
        if( uri.indexOf('urn:JsMessajer/') == 0 ) return JsMessajer;

        var result = null;

        readers.forEach( function( o ) { if( o.uri == uri ) result = o.obj } );

        writers.forEach( function( o ) { if( o.uri == uri ) result = o.obj } );

        return result;
    }
    
    function log( a )
    {
        doubleSelector('mjsLog').innerHTML += '<div style="border-top:1px dotted gray;padding:2px">' + a + '</div>';

//        doubleSelector('mjsLog').scrollTop = doubleSelector('mjsLog').scrollHeight;
    }

    function getSelection( a ) { return doubleSelector( a ).options[ doubleSelector( a ).selectedIndex ]; }

    function isAjax( uri ) { return uri.indexOf('urn:host') == 0; }

    function startTest()
    {
        doubleSelector('mjsLog').innerHTML = '';

        var from = getSelection('selectFrom').innerHTML;

        var to = getSelection('selectTo').innerHTML.replace('[new-key]', '100000' + new Date().getTime() );

        if( isAjax( from ) && isAjax( to ) ) { log('Error: from and to cannot both be urn:host'); return; }

        if( isAjax( to ) )
        {
            var home = document.location.toString();

            var url = to.replace('urn:host', home.substr( 0, home.indexOf( '/', 8 ) ) );

            var link = url.replace('/utf8ked/','/') + '/return.wav';

            log('uploading to ' + url + '<br />see <a href="' + link + '">'+ link + '</a>' );

            doubleSelector('selectFrom').innerHTML += '<option>' + to + '</option>';
        }

        var mime = getSelection('selectMime').innerHTML;

        log('Testing MESSA.send( "' + from + '", "' + to + '", "' + mime + '" )...' );

        MESSA.send( from, to, mime );
    }

    return {
        getMessajer: getMessajer,
        init: init,
        startTest: startTest
    };
}();

var JsMessajer = function()
{
    var data = {}

    var readers = {};

    var writers = {};

    function mjsStart( id, uri, mime, chunkSize, isRead )
    {
        var map = isRead ? readers : writers;

        map[id] = { 'uri': uri, 'mime': mime, 'data': ( isRead ? data[uri] : "" ), 'chunkSize':chunkSize };
    }

    function mjsRead( id, offset )
    {
        var data = readers[id].data;

        return data.length <= offset ? null : data.substr( offset, readers[id].chunkSize );
    }

    function mjsWrite( id, offset, data )
    {
        writers[id].data += data;
    }

    function mjsStatus( id, code, text )
    {
        if( writers[id] )
        {
            data[ writers[id].uri ] = writers[id].data;

            if( code == 200 ) doubleSelector('selectFrom').innerHTML += '<option>' + writers[id].uri + '</option>';
        }
    }

    return {
       	mjsStart:  mjsStart,
       	mjsRead:   mjsRead,
       	mjsWrite:  mjsWrite,
       	mjsStatus: mjsStatus,
	readers: readers
    };
}();