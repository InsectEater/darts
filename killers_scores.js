$( document ).ready(function() {
	generate_footer();
    settings_get();
    setInterval( get_scores, 4000 );
    get_scores();
});

function fill_data() {
	$('.viewport .players').html( '' );
	var $player = $( '#defaults .player' );
	for (var i = 0; i < game.playersTotal; i++) {
		var $anotherPlayer = $player.clone();
		var player = game.players[i];
		$( '.viewport .players' ).append( $anotherPlayer );
		
		$anotherPlayer.find( '.name span' ).text( player.nm );
		$anotherPlayer.find( '.number span' ).text( player.nb );
		
		for (var l = 0; l < player.l; l++) {
			$anotherPlayer.find( '.lifes' ).append( $.parseHTML( '<span class="life">&nbsp;</span>' ) );
		}
		
		for (var l = 0; l < player.d; l++) {
			$anotherPlayer.find('.throws').append( $.parseHTML( '<div class="dart throw">&nbsp;</div>' ) );
		}
		if (player.c) $anotherPlayer.addClass( 'current' );
		if (player.k) $anotherPlayer.addClass( 'killer' );
		if (player.kd) $anotherPlayer.addClass( 'killed' );
		player.k = ( $( this ).hasClass( 'killer' ) ) ? true : false;
		if (player.t) $anotherPlayer.find( '.target' ).addClass( 'active' );
	}
}