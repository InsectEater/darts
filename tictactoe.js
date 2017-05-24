$( document ).ready(function() {
    generate_header();
    var scoring = [];
    var gameInProgress = false;

    function init_data() {
        game.players = {
            player0 : {
                name: 'Player 1',
                sign: 'x',
                throws: [],
                board: [0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            player1 : {
                name: 'Player 2',
                sign: 'o',
                throws: [],
                board: [0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            board: []
        };
        scoring = [];
    }

    $('#cta-start').click(function(){
        if ('Reset' == $(this).html())
            game_reset();
        else {
            game_start();
        }
    });
    
    function game_start() {
        settings_hide();
        settings_get();
        $('#cta-start').html('Reset');
        gameInProgress = true;
        init_data();
        render_scores();
    }

    function game_reset() {
        if (!confirm('Are you sure?') )
            return;
        $('#cta-start').html('Start');
        init_data();
        render_scores();
        gameInProgress = false;
    }

    function render_scores() {
        if ( ! gameInProgress ) {
            return false;
        }
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
        var last_round = Math.floor( scoring.length / 3 );
        $('.throws .throw').html('&nbsp;');
        game.players[game.activePlayer].throws = scoring.slice( last_round * 3, last_round * 3 + 3);
        if ( 0 < last_round ) {
            last_round--;
            //throws = scoring.slice( last_round * 3, last_round * 3 + 3);
            game.players[game.otherPlayer].throws = scoring.slice( last_round * 3, last_round * 3 + 3);
        }

        //Show players throws
        for (var i = 0; i <3; i++) {
            var throww = game.players['player0'].throws[i];
            throww = throww ? throww.val : '&nbsp;';
            $( '.player0 .throws .tr' + i ).html( throww  );
            throww = game.players['player1'].throws[i];
            throww = throww ? throww.val : '&nbsp;';
            $( '.player1 .throws .tr' + i ).html( throww  );
        }
        
        //SHow players boards
        set_players_boards();
        render_player_board( 'player0' );
        render_player_board( 'player1' );

        //Show big board
        $('.board.big td').each( function( index, td ) { 
            $( this ).removeClass();
            if ( game.board[index] ) {
                player = 'player' + ( game.board[index] - 1 );
                $( this ).addClass( 'sign-' + game.players[player].sign );
            }
        } );
    
        send_scores();
    }

    //Choose player's sign
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
        if ( 'del' == $( this ).attr( "id" ) ) {
            scoring.pop();
        } else {
            scoring.push( {
                'val': $( this ).html(),
                'pos': $( this ).attr('data-pos'),
                'x'  : $( this ).attr('data-x')
            } );
        }
        render_scores();
    });

    function set_players_boards() {
        $( '.board.small table td' ).removeClass();
        game.players.player0.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        game.players.player1.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        game.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        scoring.map( function( throww, index) {
            
            if (  'Miss' == throww.val ) {
                return;
            }
            var cP = Math.floor( ( index / 3 ) % 2 ) ;
            var oP =  cP ? 0 : 1;
            var cPP = game.players['player' + cP];
            var oPP = game.players['player' + oP];
            if ( 3 > oPP.board[throww.pos] ) {
                cPP.board[throww.pos] += parseInt( throww.x );
                cPP.board[throww.pos] = ( 3 > cPP.board[throww.pos] ) ? cPP.board[throww.pos] : 3;
                if ( cPP.board[throww.pos] >= 3 ) {
                    game.board[throww.pos] = cP + 1;
                }
            }
        } );
    }

    function render_player_board( player_name ) {

        $( '.' + player_name + ' table td').each( function( index, td ) {
            $( this ).removeClass();
            $( this ).addClass( 'check-' + game.players[player_name].board[index] );
        } );
    }
    gameInProgress = true;
    init_data();
    render_scores();
    gameInProgress = false;
});