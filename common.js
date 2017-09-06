var game = {};
/*  
    Call generate_header() if you are on entereing page data.
    Call generate_footer() if you are on view scores page.

    ========================================================================
    possible settings in data-settingname attributes for div.settings container
    ========================================================================
        data-playerstotal        : yes|no   - default: yes
        data-default-players-num : integer  - default: 3
        data-min-players-num     : integer  - default: 3
        data-max-players-num     : integer  - default: 9
        data-network             : yes|no   - default: yes

    on game start use functions:
        settings_get() to import data into game variable
        settings_hide() to hide settings panel

    use game object to store and send global data to view scores page.Try to keep this object as
    minimal as you can
*/

$( document ).ready( function() {
    set_network('disabled', 'Scores are not synchronized');
});

function generate_header() {
    var str = {};
    str.header = '<section class="header">';
    str.header += '<a href="./index.html" id="home" title="Back to home page" class="button">&#x1f3e0;</a>';
    str.header += '<a href="javascript:void(0);" title="Rules" id="manual" class="button">&#x1f4d6;</a>';
    str.header += '<h1></h1>';
    str.header += '<a class="button menu-toggle" href="javascript:void(0)" title="Menu" id="menu">&#9776;</a>';
    str.header += '<span class="network"></span>';
    str.header += '</section>';
    str.header = $.parseHTML( str.header );

    str.network = '<label>';
    str.network += '<span class="lbl-column">Synchrnoyze id: </span> ';
    str.network += '<input type="text" id="scoresId" checked="checked" readonly />';
    str.network += '</label>';
    str.network += '<label>';
    str.network += '<span class="lbl-column">Send scores online: </span>';
    str.network += '<input class="setting" type="checkbox" id="sendOnline" />';
    str.network += '</label>';
    str.network += '<div>';
    str.network += '<span class="lbl-column"></span>';
    str.network += '<button id="cta-start" type="button">Start</button>';
    str.network += '</div>';
    str.network = $.parseHTML( str.network );

    $( 'body' ).prepend( str.header );
    $('.header h1').text( $('html title').text() );
    var $settings = $('.settings');

    if ($settings.attr('data-playerstotal') !== 'no') {
        var players_total_select = generate_playerstotal_select(
            $settings.attr('data-default-players-num'),
            $settings.attr('data-min-players-num'),
            $settings.attr('data-max-players-num')
        );
        var players_total =
            '<label><span class="lbl-column">Players:</span> ' +
            //generate_playerstotal_select() +
            players_total_select + 
            '</label>';
        var $players_total = players_total;
        $settings.prepend( $players_total );
    }

    if ($settings.attr('data-network') !== 'no') {
        $settings.append( str.network );
    }

    if ( $('#sendOnline').prop('checked') )
        get_scores_id();
    
    $('#manual').on('click', function(event) {
        $('.content').slideToggle(200);
        $('.rules').slideToggle(200);
    });

    $('.menu-toggle').on('click', function(event) {
        event.stopImmediatePropagation();
        $('.settings').slideToggle(200);
    });

    $('#cta-start').on('click', function(event) {
        $('.rules').hide(200);
        $('.content').show(200);
    });

    $('.settings').on('click', function(event) {
        event.stopImmediatePropagation()
    });

    $('body').on('click', function() {
        settings_hide();
    });

    $('#sendOnline').change(function() {
        settings_get();
        if ( game.sendOnline ) {
            if ( is_empty( game.scoresId ) ) {
                get_scores_id();
            }
            set_network('loading');
        } else {
            set_network('disabled', '')
        }
    });
    settings_get();
}

function generate_footer() {
    var str = {};
    str.footer = '<section class="reciever network">';
    str.footer += '<a href="./index.html" title="home" id="home" title="Back to home page" class="button">&#x1f3e0;</a>';
    str.footer += 'Syncronize ID: ';
    str.footer += '<input type="text" id="scoresId" />';
    str.footer += '<span class="err-msg"></span>';
    str.footer += '</section>';
    str.footer = $.parseHTML( str.footer );
    $( '.recieved-from-server' ).append( str.footer );
}

 function settings_hide() {
    if ( $('.settings').is(':visible') )
        $('.settings').slideUp(200);
}

function generate_playerstotal_select(default_players_num, min_players_num, max_players_num) {
    default_players_num = (default_players_num) ? default_players_num: 3;
    min_players_num = (min_players_num) ? min_players_num: 3;
    max_players_num = (max_players_num) ? max_players_num: 9;
    var content = '';
    for (var i = min_players_num; i <= max_players_num; i++) {
        content += '<option value="' + i + '"';
        if (default_players_num == i) content += ' selected="selected"';
        content += '>' +  i + '</option>';
    }
    return '<select class="setting" id="playersTotal">' + content +'</select>';
}

function set_network(state, message) {

    if ( $( '.reciever' ).length > 0 ) {
        $( '.network .err-msg' ).text(message);
        return;
    }

    $('.network').attr('title', message);
    switch (state) {
        case 'empty':
            $('.network').css('background-image', "none" );
            break;
        case 'ok':
            $('.network').css('background-image', "url('images/state_ok.png')" );
            break;
        case 'loading':
            $('.network').css('background-image', "url('images/state_loading.png')" );
            if (message) 
                $('.network').attr('title', message);
            else
                $('.network').attr('title', 'Loading ...');
            break;
        case 'disabled':
            $('.network').css('background-image', "none" );
            break;
        default:
            $('.network').css('background-image', "url('images/state_error.png')" );
            break;
    }
}

function get_scores_id() {
    set_network('loading');
    var jqxhr = $.get( "scores.php?action=get&data=id",
        function( response ) {
            data = JSON.parse( response );
            if ('OK' == data.status) {
                game.scoresId = data.body.id;
                game.token = data.body.token;
                $('#scoresId').val( game.scoresId );
                set_network('ok', data.msg);
            } else {
                set_network('error', data.msg);
            }
        })
      .fail(function() {
        set_network('error', 'Connection error');
      })

}

function send_scores() {
    if ( '' == game.scoresId ) return;
    if ( ! game.sendOnline ) return;

    var post = {
        id    : game.scoresId,
        token : game.token,
        game  : game.gameName,
        //data  : $('.send-to-server').html()
        data  : JSON.stringify( game )
    };

    set_network('loading', 'Scores send, loading response...');
    var jqxhr = $.post( "scores.php?action=put", post,
    function( response ) {
        data = JSON.parse(response);
        if ( 'OK' == data.status ) {
            set_network( 'ok', data.msg );
        } else {
            set_network( 'error', data.msg )
            console.log(response);
        }
    })
      .fail(function() {
        set_network('error', 'Connection error')
      }, 'json')

}

function get_scores() {
    set_network('loading', 'Loading data...');
    var timeInMs = Date.now();
    game.scoresId = $('#scoresId').val();
    var jqxhr = $.get( "scores.php?action=get&data=" + game.scoresId + '&game=' + game.gameName + '&nocache=' + timeInMs,
    function( response ) {
        data = JSON.parse( response );
        if ('OK' == data.status) {
            game = JSON.parse(data.body.content);
            //$('.viewport').html( data.body.content );
            if ( is_empty(  $('#scoresId').val() ) ) {
                $('.recieved-from-server #scoresId').val( game.scoresId );
            }
            if (typeof fill_data == 'function')
                fill_data();
            set_network('ok', data.msg);
        } else {
            set_network('error', data.msg);
        }
    })
        .fail(function() {
            set_network('error', 'Connection error');
        })
}

function settings_get() {
    if ($( 'title' ).attr( 'data-game-name' ) ) {
        game.gameName = $( 'title' ).attr( 'data-game-name' );
        game.scoresId = $('#scoresId').val();
        return;
    }
    $('.setting').each(function() {
        if ('checkbox' == $(this).attr('type') ) {
            game[ $(this).attr('id') ] = $(this).prop('checked');
        } else
            game[ $(this).attr('id') ] = $(this).val();
    });
    if ( is_empty(game.scoresId) )
        game.scoresId = $('.scoresId').val();
    game.gameName = $('.settings').attr('data-game-name');
}

function is_empty(val) {
    if ('' === val)
        return true;
    if (undefined === val)
        return true;
    if (null === val)
        return true;
    if ( val.constructor == Array && 0 == val.length ) {
        return true;
    }
    return false;
}

function get_round_info( throws, number_of_players, throws_per_round ) {
    var info = { round: 1, player: 1, throw: 1 };
    if ( is_empty( throws ) || is_empty( number_of_players ) ) {
        return info;
    }
    if ( is_empty( throws_per_round ) ) {
        throws_per_round = 3;
    }
    info.round = Math.floor( throws.length / ( number_of_players * throws_per_round ) ) + 1;
    info.player = Math.floor ( throws.length / throws_per_round ) % number_of_players + 1;
    info.throw = throws.length % 3 + 1;
    return info;
}