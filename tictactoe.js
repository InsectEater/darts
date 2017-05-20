$( document ).ready(function() {
    generate_header();
    var scoring = [];
    var gameInProgress = false;

    game.players = {
        player0 : {
            name: 'Player 1',
            sign: 'x',
            throws: []
        },
        player1 : {
            name: 'Player 2',
            sign: 'o',
            throws: []
        }
    };

    $('#cta-start').click(function(){
        if ('Reset' == $(this).html())
            game_reset();
        else {
            game_start();
        }
    });
    
    $('#del').click(function(){
        if ( 0 == scoring.length )
            return;
        scoring.pop().val;
        render_scores();
    });

    function game_start() {
        settings_hide();
        settings_get();
        $('#cta-start').html('Reset');
        gameInProgress = true;
        render_scores();
    }

    function game_reset() {
        if (!confirm('Are you sure?') )
            return;
        $('#cta-start').html('Start');
        gameInProgress = false;
        scoring = [];
    }

    function render_scores() {
        if ( Math.floor( scoring.length / 3 ) % 2 ) {
            game.activePlayer = 'player1';
            game.otherPlayer = 'player0';
        } else {
            game.activePlayer = 'player0';
            game.otherPlayer = 'player1';
        }
        //game.activePlayer = ( Math.floor( scoring.length / 3 ) % 2 ) ? 'player1' : 'player0';

        //show player's current sign
        $( '.player-sign' ).each(function() {
            var playerId = $( this ).attr( 'data-player' );
            var sign = game.players[playerId].sign;
            $( this ).removeClass( 'sign-o sign-x' );
            $( this ).addClass( 'sign-' + sign );
        });
        // show player's name
        $( '.playername' ).each(function() {
            var playerId = $( this ).attr( 'id' );
           $( this ).val( game.players[playerId].name ); 
        });

        //Higlight active player's board
        $( '.board.active' ).removeClass( 'active' );
        $( '.board.' + game.activePlayer).addClass( 'active' );

        //Get players last throws
        $('.throws').html('');
        var last_round = Math.floor( scoring.length / 3 );
        $('.throws').html('');
        game.players[game.activePlayer].throws = scoring.slice( last_round * 3, last_round * 3 + 3);
        if ( 0 < last_round ) {
            last_round--;
            //throws = scoring.slice( last_round * 3, last_round * 3 + 3);
            game.players[game.otherPlayer].throws = scoring.slice( last_round * 3, last_round * 3 + 3);
        }
        //console.log(game.players['player0']);
        //Show players throws
        var throws = game.players['player0'].throws.map( function( value ) {
            return ' ' + value + ' ';
        });
        $( '.player0 .throws' ).html( throws );

        var throws = game.players['player1'].throws.map( function( value ) {
            return ' ' + value + ' ';
        });
        $( '.player1 .throws' ).html( throws );

        //send_scores();
    }

    $('.player-sign').click(function() {
        var playerId = $(this).attr( 'data-player' );
        player = game.players[playerId];
        var other_player = ( 'player0' == playerId ) ? game.players.player1 : game.players.player0;
        if ( 'x' == player.sign ) {
            player.sign = 'o';
            other_player.sign = 'x';
        } else {
            player.sign = 'x';
            other_player.sign = 'o';
        }
        render_scores();
    });

    $('.playername').on('change', function() {
        var playerId = $(this).attr( 'id' );
        game.players[playerId].name = $( this ).val(); 
    });

    $('.btn').on('click', function() {
        scoring.push( $(this).html() );
        render_scores();
    });


    render_scores();

});