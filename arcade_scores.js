$( document ).ready(function() {
    var scoresId = '';
    
    setInterval( get_scores, 4000 );
    get_scores();

    function get_scores() {
        set_indicator('loading', 'Loading data...');
        var timeInMs = Date.now();
        var jqxhr = $.get( "scores.php?action=get&data=" + $('#scoresId').val() + "&nocache=" + timeInMs,
        function( response ) {
            data = JSON.parse( response );
            if ('OK' == data.status) {
                scoresId = data.body.id;
                $('.viewport').html( data.body.content );
                if ( '' == $('#scoresId').val() )
                    $('#scoresId').val( data.body.id );
                set_indicator('ok', data.msg);
            } else {
                set_indicator('error', data.msg);
            }
        })
          .fail(function() {
            set_indicator('error', 'Connection error');
          })
    }

    function set_indicator(state, message) {
        $('.header').attr('title', message);
        switch (state) {
            case 'ok':
                //$('.header').css('background-image', "url('images/state_ok.png')" );
                $('.err-msg').text('');
                break;
            case 'loading':
                //$('.header').css('background-image', "url('images/state_loading.png')" );
                $('.err-msg').text('');
                break;
            case 'disabled':
                //$('.header').css('background-image', "none" );
                break;
            default:
                //$('.header').css('background-image', "url('images/state_error.png')" );
                $('.err-msg').text(message);
                break;
        }
    }


});