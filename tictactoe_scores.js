$( document ).ready(function() {
	generate_footer();
    settings_get();
    setInterval( get_scores, 4000 );
    get_scores();
});

function fill_data() {
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

    //Show players throws
    for (var i = 0; i <3; i++) {
        var throww = game.players['player0'].throws[i];
        throww = throww ? throww.val : '&nbsp;';
        $( '.player0 .throws .tr' + i ).html( throww  );
        throww = game.players['player1'].throws[i];
        throww = throww ? throww.val : '&nbsp;';
        $( '.player1 .throws .tr' + i ).html( throww  );
    }

    //Show players boards
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

}

function render_player_board( player_name ) {
    $( '.' + player_name + ' table td').each( function( index, td ) {
        $( this ).removeClass();
        $( this ).addClass( 'check-' + game.players[player_name].board[index] );
    } );
}