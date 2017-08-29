$( document ).ready(function() {
	generate_header();

	game.players = [0, 2, 3];
	
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
		$('#scores').html('');
		for ( var i = 0; i <= game.playersTotal; i++ ) {
			for ( var j = 1; j <= 20; j++ ) {

			}
		}
	}
	




});