
var Messajs = function()
{
    var messajs = {};

    var lastId = -1;

    /**
     * send a messaj
     *
     * @param {string} mjerUrn - ( MessajerUrn ) messaj sender urn
     * @param {string} mjeeUrn - ( MessajeeUrn ) messaj recipient urn
     * @param {string} mime - messaj encoding
     * @param {number} chunkSize
     * @param {string|null} mjinUrn - ( MessajinUrn ) optional 3rd party initializer to receive mjsBegin & mjsEnd events
     */
    function send( mjerUrn, mjeeUrn, mime, chunkSize, mjinUrn )
    {
        var id = getNextId();

        messajs[ id ] = {
            'from': mjerUrn,
            'to': mjeeUrn,
            'initer': mjinUrn,
            'id': id,
            'mime': mime,
            'buffer': '',
            'offset': 0,
            'chunkSize': chunkSize,
            'code': 200,
            'mess': ''
        };

        later( begin, id, mjinUrn ? 0 : 1 );
    }

    /**
     * Report an error
     *
     * @param {string} mid - messaj ID
     * @param {number} code - status code
     * @param {string} mess - status message
     **/
    function error( mid, code, mess )
    {
        debug( 'error', [ mid, code, mess ] );

        messajs[mid].code = code;

        messajs[mid].mess = mess;

        later( end, mid, 0 );
    }

    /**
     * post - mjsRead callback
     *
     * @param {string} mid - Messaj ID
     * @param {number} offset - Messaj offset given in mjsRead
     * @param {string|number} data - chunk of data // todo json object ?
     */
    function post( mid, offset, data )
    {
        debug( 'post', [ mid, offset, data ] );

        messajs[mid].buffer = data;

        later( write, mid );
    }

    /**
     * posted - mjsRead callback to indicate posting is complete
     *
     * @param {string} mid - Messaj ID
     * @param {number} offset - Messaj offset given in mjsWrite
     */
    function posted( mid, offset )
    {
        debug( 'posted', [ mid, offset ] );

        later( end, mid, 0 );
    }

    /**
     * written - mjsWrite callback
     *
     * @param {string} mid - Messaj ID
     * @param {number} offset - Messaj offset given in mjsWrite
     */
    function written( mid, offset )
    {
        debug( 'written', [ mid, offset ] );

        later( read, mid );
    }

    function begin( mid, step )
    {
        var mj = messajs[mid];

        var uri = step == 0 ? mj.initer : step == 1 ? mj.from : mj.to;

        invokeMessajer( uri, 'mjsBegin', [ mj.id, uri, mj.mime, mj.chunkSize, ['init','read','write'][ step ] ] );

        later( step == 2 ? read : begin, mid, step + 1 );
    }

    function read( mid )
    {
        invokeMessajer( messajs[mid].from, 'mjsRead', [ mid, messajs[mid].offset ] );
    }

    function write( mid )
    {
        var mj = messajs[mid];

        invokeMessajer( mj.to, 'mjsWrite', [ mid, mj.offset += mj.chunkSize, mj.buffer ] );
    }

    function end( mid, step )
    {
        var mj = messajs[mid];

        invokeMessajer( step == 0 ? mj.from : step == 1 ? mj.to : mj.initer, 'mjsEnd', [ mid, mj.code, mj.mess ] );

        if( step == 2 || ( step == 1 && ! mj.initer ) )
        {
            delete messajs[mid];
        }
        else
        {
            later( end, mid, step + 1 );
        }
    }

    function invokeMessajer( uri, fun, p )
    {
        debug( fun, p, uri );

        var urn = uri.substring( 4, uri.indexOf( ':', 5 ) );

		debug(fun, p, urn);

        var messajer = ( urn == 'host' ) ? hostMessajer : MessajsConfig.getMessajer( urn );

        switch( p.length )
        {
            case 2: messajer[ fun ]( p[0], p[1] ); break;

            case 3: messajer[ fun ]( p[0], p[1], p[2] ); break;

            case 4: messajer[ fun ]( p[0], p[1], p[2], p[3] ); break;

            case 5: messajer[ fun ]( p[0], p[1], p[2], p[3], p[4] ); break;
        }
    }

    function getNextId()
    {
        var id = new Date().getTime();

        lastId = id > lastId ? id : lastId + 1;

        return "" + lastId;
    }

    function later( f, mid, p2 ) { setTimeout( function(){f(mid, p2)}, 0); }

    function debug( a, b, c ){ if( MessajsConfig.debug ) MessajsConfig.debug( a, b, c ) }

    var hostMessajer = function()
    {
        var xfers = {};

        function mjsBegin( id, uri, mime, size, kind )
        {
            xfers[id] = {
                'url': uri.substring( 9 ) + '?id=' + id + '&size=' + size,
                'mime': mime
            };
        }

        function mjsEnd( id ) { delete xfers[id]; } // todo messaj to server?

        function ajax( id, offset, postData )
        {
            var xmlHttp = xfers[id].req;

            var isPost = typeof( postData ) != 'undefined';

            if( ! isPost && offset > 0 ) { Messajs.posted( id, offset ); return; } // ( TEMP ) all in one read

            if( xmlHttp == null )
            {
                xmlHttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

                xfers[id].req = xmlHttp;

                xmlHttp.onreadystatechange = function()
                {
                    if ( xmlHttp.readyState == 4 )
                    {
                        if( xmlHttp.status == 200 )
                        {
                            ( isPost ? written : post )( id, offset, xmlHttp.responseText );
                        }
                        else
                        {
                            error( id, xmlHttp.status, xmlHttp.statusText );
                        }
                    }
                };
            }

            xmlHttp.open( isPost ? 'POST' : 'GET', xfers[id].url + '&offset=' + offset );

            xmlHttp.setRequestHeader( 'Content-Type', xfers[id].mime );

            xmlHttp.send( postData );
        }

        return { /** hostMessajer public functions: **/
           mjsBegin:  mjsBegin,
           mjsRead:   ajax,
           mjsWrite:  ajax,
           mjsEnd:    mjsEnd
        };
    }();

    return { /** Messajs public functions: **/
        send:    send,
        error:   error,
        post:    post,
        posted:  posted,
        written: written
    }
}();
