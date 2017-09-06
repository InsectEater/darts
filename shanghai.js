$( document ).ready(function() {
	generate_header();
	game_reset();
	
	$('#cta-start').click( function() {
		if ('Reset' == $(this).html()) {
			$(this).html('Start');
			game_reset();
		} else {
			$(this).html('Reset')
			game_start();
		}
	});

	function game_reset() {
		game.players = [];
		game.scores = [];
		game.playersScores = [];
		game.inProgress = false;
		$('.current-round').html('1');
	}

	function game_start() {
		settings_hide();
		settings_get();
		game.inProgress = true;
		$('#scores').html('');
		var table_header = '';
		table_header += '<tr class="scores-header"><th>Round</th>';
		for ( var i = 0; i < game.playersTotal; i++ ) {
			table_header += '<th>';
			table_header += '<input class="player-name" type="text" name="player' + i + '" placeholder="Player '  + i + '" />';
			table_header += '<div class="player-scores player-scores' + i + '" />0</div>';
			table_header += '</th>'; 
		}
		table_header += '</tr>';
		$('#scores').html(table_header);
		render_scores();
	}

	$('#del').click( function() {
		if ( 'Start' == $('#cta-start').html() ) return;
		game.inProgress = true;
		game.scores.pop();
		render_scores();
	});

	$('#miss').click( function() {
		if ( ! game.inProgress ) return;
		game.scores.push( '0' );
		render_scores();
	});

	$('#single').click( function() {
		if ( ! game.inProgress ) return;
		game.scores.push( '1' );
		render_scores();
	});

	$('#double').click( function() {
		if ( ! game.inProgress ) return;
		game.scores.push( '2' );
		render_scores();
	});

	$('#tripple').click( function() {
		if ( ! game.inProgress ) return;
		game.scores.push( '3' );
		render_scores();
	});

	function render_scores() {
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

		if ( 20 <= game.roundInfo.round ) {
			game.inProgress = false;
		}

	}



});