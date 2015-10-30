
var fileName = "/data/601.wav";

var time = new Date().getTime();

var appletsLoaded = 0;

var finished = [];

var timeStartedWorking = -1;

var totalTimeWorked = 0;

var passed = 0;

var failed = 0;

function test()
{
    //BROWSER_CHECK();

    getApplet('AppletA').nextTest( null );

    //messaTestSelector('testButton').style.display = 'none';
}

/**
 *
 * FF does not always print crash before 'did timeout'
 *
 **/

function blah( a, b )
{
    write( 'blah ' + a + ' ' + typeof( b ) )
}

function BROWSER_CHECK()
{
    setTimeout( function() { write('did timeout'); } );

    write('got wait ' + getApplet('AppletA').waitt() );

    write('got null ' + getApplet('AppletA').getNull() );

//    SAFARI ( null -> undefined )
//    [2858ms] got wait OK
//    [2ms] got null undefined
//    [16ms] did timeout

//    CHROME
//    [8327ms] got wait OK
//    [3ms] got null null
//    [16ms] did timeout

//    FIREFOX ( CALLS ARE ASYNC and gets crash )
//    [677ms] did timeout
//    [1020ms] got wait OK
//    [4ms] got null null
//    [24ms] got crash undefined/o

}

function didValidate( res )
{
    if( res )
    {
        messaTestSelector('passed').innerHTML = ( ++ passed );
    }
    else
    {
        messaTestSelector('failed').innerHTML = ( ++ failed );
    }

    // getFinishedMessaj( id ).validates = '[' + passed + ']';

    // updateMessajTable( MESSA.getMessajs() );
}

function getFinishedMessaj( id )
{
    var res = null;
    finished.forEach( function( msg ) { if( msg.id == id ) res = msg; } );
    return res;
}

window.onload = function()
{
    handleResize();

    initApplet( 'AppletA' );
}

function appletLoaded( id )
{
   write( id + ' loaded' );

   if( ( ++appletsLoaded ) == 1 )
   {
       initApplet( 'AppletB' );
   }
   else
   {
       setTimeout( handleFileNameChange );

       setTimeout( handleChunkSizeChange );

       setTimeout( MessajAnimation.start );

       handleDebugChanged();

       messaTestSelector('tester').style.display = '';
   }
}

MESSA.setDebugger( function( type, msg, x )
{
    if( type == 'log' )
    {
        write( msg );
    }
    else if( type == 'start' )
    {
        msg.bytesRead = 0;

        msg.chunksSent = 0;

        msg.started = new Date().getTime();

        msg.validates = '';

        if( timeStartedWorking == -1 ) timeStartedWorking = new Date().getTime();

        updateMessajTable( x );
    }
    else if( type == 'startRead' )
    {
        if( msg.chunksRead > 0 ) msg.chunksSent++;

        updateMessajTable( x );
    }
    else if( type == 'startWrite' )
    {
        msg.bytesRead += getLength( msg.buffer );

        updateMessajTable( x );
    }
    else if( type == 'finished' )
    {
        if( isAjax( msg.from ) ) { msg.chunksSent++; } // does not read last null
        
        msg.took = dispMS( new Date().getTime() - msg.started );

        finished.push( msg );

        write('finished ' + msg.id );

        updateMessajTable( x );

        if( sizeOf(x) == 0 )
        {
            totalTimeWorked += ( new Date().getTime() - timeStartedWorking );

            timeStartedWorking = -1;
        }
    }
} );

function isAjax( uri ) { return uri.indexOf('urn:host') == 0; }

function messaTestSelector( id )
{
    return document.getElementById( id )
}

function write( a, noTime )
{
    var now = new Date().getTime();

    messaTestSelector('sout').innerHTML += ( ! noTime ? '[' + ( now - time ) + 'ms] ' : '' ) + a + '\n';

    messaTestSelector('sout').scrollTop = messaTestSelector('sout').scrollHeight;

    time = now;
}

window.onresize = handleResize;

function handleResize()
{
    messaTestSelector('messajsWrap').style.height = ( window.innerHeight - 130 ) + 'px';
}

function handleChunkSizeChange()
{
    if( ! isNaN( messaTestSelector('chunkSize' ).value ) && messaTestSelector('chunkSize' ).value >= 0 )
    {
        chunkSize = parseInt( messaTestSelector('chunkSize').value );

        MESSA.setChunkSize( chunkSize );

        write('set chunk size ' + chunkSize );
    }
}

function handleFileNameChange()
{
    fileName = messaTestSelector('fileName').value;

    getApplet( 'AppletA' ).setFileName( fileName );

    getApplet( 'AppletB' ).setFileName( fileName );
}

function handleDebugChanged()
{
    var isDebug = messaTestSelector('debugCB').checked;

    messaTestSelector('sout').style.display = isDebug ? '' : 'none';

    messaTestSelector('tester').style.width = isDebug ? '70%' : '100%';
}

function gotFileSize( size )
{
    messaTestSelector('testButton').disabled = size == '';

    messaTestSelector('fileSize').innerHTML = size == '' ? 'Enter a valid filename' : 'file size: ' + size;
}

function getApplet( id )
{
    return messaTestSelector( id );
    //return messaTestSelector( id ).getSubApplet();
}

function sizeOf( a )
{
    var count = 0;
    for( var o in a ) { count++ }
    return count;
}

function asRow( o, status )
{
    return '<tr style="color:' + ( status == 'DONE' ? 'gray' : 'blue' ) + '">' +
             '<td>' + o.id + '</td>' +
             '<td>' + status + ' [' + o.statusCode + ']</td>' +
             '<td>' + o.chunksRead + ' / ' + o.chunksSent + ' / ' + o.bytesRead + '</td>' +
             '<td>' + o.from + ' -> ' + o.to + '</td>' +
             //'<td>' + ( typeof(o.validates) == 'undefined' ? 'TODO' : o.validates ) + '</td>' +
             '<td>' + ( status == 'DONE' ? o.took : '...' ) + '</td>' +
           '</tr>';
}

function dispMS( ms )
{
    if( ms < 1000 )
        return ms + "ms";
    return ( ms / 1000 ) + "s";
}

function updateMessajTable( messajs )
{
    var txt = '';

    var sent = 0;

    finished.forEach( function( o ) {txt += asRow( o, 'DONE' );sent += isNaN( o.bytesRead ) ? 0 : o.bytesRead;} );

    for( var mid in messajs )
    {
        var o = messajs[mid];
        txt += asRow( o, 'working...' );
        sent += isNaN( o.bytesRead ) ? 0 : o.bytesRead;
    }

    //messajs.forEach( function( o ) {txt += asRow( o, 'working...' );sent += isNaN( o.bytesSent ) ? 0 : o.bytesSent;} );

    messaTestSelector('messajs').innerHTML = txt + '';

    var curTimer = timeStartedWorking == -1 ? 0 : ( new Date().getTime() - timeStartedWorking );

    var time = totalTimeWorked + curTimer;

    messaTestSelector('speed').innerHTML = sent + "B in " + dispMS( time ) + " ... " + ( ( sent / 1024 ) / ( time / 1000 ) ).toPrecision(3) + " KB/s(?)";

    messaTestSelector('messajsWrap').scrollTop = messaTestSelector('messajsWrap').scrollHeight;
}

function getLength( data )
{
    if( data == null || typeof( data ) == 'undefined' )
        return 0;
    if( typeof( data.length ) === 'function' )
        return data.length();
    return data.length;
}

var MessajAnimation = function()
{
    var last = -1;

    var pos = 0;

    var frame = -1;

    var best = -1;

    var worst = -1;

    function start()
    {
        pos = pos > window.innerWidth - 300 ? 100 : pos + 1;

        messaTestSelector('dog').style.left = pos + 'px';

        frame++;

        if( frame == 0 )
        {
            last = new Date().getTime();
        }
        else if( frame % 20 == 0 )
        {
            var now = new Date().getTime();

            var dif = now - last;

            last = now;
            
            if( best == -1 || dif < best ) best = dif;

            if( worst == -1 || dif > worst ) worst = dif;

            var FPS = parseInt( 20000 / dif );

            var bestFPS = parseInt( 20000 / best );

            var worstFPS = parseInt( 20000 / worst );

            messaTestSelector('percent').innerHTML = '[ ' + worstFPS + ' , ' + bestFPS + ' ] ' + FPS + ' fps';
        }

        setTimeout( start );
    }

    return {
        start: start
    }
}();

function initApplet( id )
{
    messaTestSelector('wrap_' + id ).innerHTML = '' +
        '<object ' +
          'id="' + id + '" ' +
          'type="application/x-java-applet" ' +
          'code="com.alelo.messajs.applet.MessajsApplet" ' +
          'archive="jar/messajs.applet.jar" ' +
          'width="1" ' +
          'height="1"> ' +
          '<param name="mayscript" value="true"> ' +
          '<param name="scriptable" value="true"> ' +
        '</object>';
}

//    function later( f, p1, p2 ) { setTimeout( function()
//    {
//      try { f( p1, p2 ); } catch( e ) { debug( 'caught: ' + e, messajs[p1] ); }
//    }, 0 ) }

///**
// * task que module: ensures only one setTimeout active at a time
// *
// * downside: either need to try catch every task call or outside crash will bring whole system down
// *
// * without this mod:
// *    - outside crash will stop only that messaj ( neither way calls mjsStatus() unless try catch used )
// *    - about one setTimeout per messaj
// */
//var tasking = false;
//
//var taskq = [];
//
//function later( f, p1, p2 )
//{
//    taskq.push( [f,p1,p2] );
//
//    if( ! tasking ) setTimeout( doNextTask );
//}
//
//function doNextTask( )
//{
//    if( tasking ) return;
//
//    if( taskq.length == 0 ) return;
//
//    tasking = true;
//
//    var task = taskq[0];
//
//    taskq.splice( 0, 1 );
//
//    task[0]( task[1], task[2] );
//
//    tasking = false;
//
//    setTimeout( doNextTask );
//}