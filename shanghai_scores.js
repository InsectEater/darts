$( document ).ready(function() {
	generate_footer();
    settings_get();
    setInterval( get_scores, 4000 );
    get_scores();
});

function fill_data() {

	$('#scores').html('');
	var table_header = '';
	table_header += '<tr class="scores-header"><th>Round</th>';
	for ( var i = 0; i < game.playersTotal; i++ ) {
		table_header += '<th>';
		table_header += '<div class="player-name scores-player-name">' + game.players[i] + '</div>';
		table_header += '<div class="player-scores player-scores' + i + '" /></div>';
		table_header += '</th>'; 
	}
	table_header += '</tr>';
	$('#scores').html(table_header);
	game.roundInfo = get_round_info( game.scores, game.playersTotal );

	$('.current-round').html(game.roundInfo.round);
	var row = '';
	$('.score-row').remove();

	//Create emppty scores table
	for ( var r = game.roundInfo.round; r >= 1; r-- ) {
		row = '<tr class="score-row row' + r + '"><td>';
		row += r;
		row += '</td>';
		for ( var p = 1; p <= game.playersTotal; p++ ) {
			row += '<td class="cell-' + r + '-' + p + '">0</td>';
		}
		row += '</tr>';
		$('#scores').append(row);
	}

	//Fill scores table
	game.playersScores = [];
	for (var r = 0; r < game.roundInfo.round; r++) {
		for (var p = 0; p < game.playersTotal; p++) {
			var sum = 0;
			for ( var i = 0; i <= 2; i++ ) {
				var index = r * game.playersTotal * 3 + p*3+ i;
				if (! is_empty( game.scores[index] ) ) {
					sum += game.scores[index] * ( r + 1 );
				}
			}
			$( '.cell-' + ( r + 1 ) + '-' + (  p + 1 ) ).html( sum );
			game.playersScores[p] = is_empty( game.playersScores[p] ) ? sum : game.playersScores[p] + sum;
		}
	}

	//Fill players total scores
	for (var p = 0; p < game.playersTotal; p++) {
		$( '.player-scores' + p ).html( game.playersScores[p] );
	}

	//Fill throws table
	$('player-row.row-0 .throw').html('');
	var round_zero_pos = ( game.roundInfo.round - 1 ) * game.playersTotal * 3 + ( game.roundInfo.player - 1 ) * 3;
	$('.player-row.row-0 .throw1').html( game.scores[ round_zero_pos ]  * game.roundInfo.round );
	$('.player-row.row-0 .throw2').html( game.scores[ round_zero_pos + 1 ] * game.roundInfo.round );
	$('.player-row.row-0 .throw3').html( game.scores[ round_zero_pos + 2 ] * game.roundInfo.round );
	$('.player-row.row-0 .playername').html( game.players[game.roundInfo.player - 1] );

	$('.player-row.row-0 .throw').each( function( ){
		if ( '' == $(this).html() ) {
			$(this).addClass('dart');
		} else {
			$(this).removeClass('dart');
		}
	} );

	$('.player-row.row-1 .throw').html('');
	$('.player-row.row-1 .playername').html('');

	if ( game.roundInfo.round > 1 || game.roundInfo.player > 1 ) {
		var round_previous_pos = round_zero_pos - 3;
		var round_previous = game.roundInfo.round;
		var player_previous = game.roundInfo.player - 2;
		if ( player_previous < 0 ) {
			player_previous = game.playersTotal - 1;
			--round_previous;
		}

		$('.player-row.row-1 .throw1').html( game.scores[ round_previous_pos ]  * round_previous );
		$('.player-row.row-1 .throw2').html( game.scores[ round_previous_pos + 1 ] * round_previous );
		$('.player-row.row-1 .throw3').html( game.scores[ round_previous_pos + 2 ] * round_previous );
		$('.player-row.row-1 .playername').html( game.players[player_previous] );			
	}

	if ( 20 <= game.roundInfo.round ) {
		game.inProgress = false;
	}
}