$( document ).ready(function() {
    generate_header();
    var $player = $('#defaults .player');
    var $currentPlayer = '';
    var scoring = [];
    var gameInProgress = false;

    $('#cta-start').click(function(){
        if ('Reset' == $(this).html())
            game_reset();
        else {
            game_start();
        }
    });

    $('#totalLives').on('focus', function() { $(this).select(); });
    
    $('#del').click(function(){
        if ( 0 == scoring.length )
            return;

        for (var i = scoring.length - 1; i >= 0; i--) {
            if (scoring[i] != 'dead')
                break;
            scoring.pop().val;
        }
        scoring.pop().val;
        render_scores();
    });

    $('#killer').click(function(){
        if (!gameInProgress) return;
        if (!check_playersinfo_filled()) return;
        scoring.push( 'killer' );
        render_scores();
       
    });

    $('#miss').click(function(){
        if (!gameInProgress) return;
        if (!check_playersinfo_filled()) return;
        scoring.push( 'miss' );
        render_scores();
    });


    function game_start() {
        settings_hide();
        settings_get();
        $('#cta-start').html('Reset');
        $('.players').html('');
        
        for (var i = 0; i < game.playersTotal; i++) {
            var $anotherPlayer = $player.clone();
            $anotherPlayer.addClass('player' + i);
            $('.players').append( $anotherPlayer );
            $anotherPlayer.find('.name input').val('Player ' + (i + 1));
            $anotherPlayer.find('.name input').on('focus', function() { $(this).select(); });
        }

        $('.target').click(function(){
            $targetPlayer = $(this).closest('.player');
            scoring.push( $targetPlayer.attr('data-id') );
            render_scores();
        });

        $('.players select').change(function() {
            var $element = $(this);
            $('.players select' ).each(function() {
                if ( $( this ).val() == $element.val() && !$( this ).is( $element ) )
                    $element.val( '' );
            });
            $( this ).closest('.player').find('.number span').text(  $( this ).val() );
            $element.blur();
            render_scores();
        });

        $('.name input').change(function() {
            $( this ).closest('.player').find('.name span').text(  $( this ).val() );
            render_scores();
        });
        
        gameInProgress = true;
        render_scores();
    }

    function check_playersinfo_filled() {
        var empty = false;
        //return true, if there is some select value which is empty
        $('.players .number select').each(function() {
                empty = ( empty || (! $(this).val()) );
        });
        if (empty) {
            alert('All players must have numbers!')
            return false;
        }
        return true;
    }

    function game_reset() {
        if (!confirm('Are you sure?') )
            return;
        $('#cta-start').html('Start');
        gameInProgress = false;
        $('.players').html('');
        scoring = [];
    }

    function render_scores() {
        //console.log('Resetting all');
        $('.players .throw' ).removeClass('dart');
        $('.players .player' ).removeClass('killer');
        $('.players .player' ).removeClass('killed');
        $('.players .player' ).attr('data-lives', game.totalLives);
        $('.players .player0').addClass('current');
        $('.players .player0 .throw' ).addClass('dart');
        $('.players .player .target').removeClass('active') ;

        $('.players .name').each(function() {
            $(this).find('span').text(
                $(this).find('input').val()
            );
        });

        for (var i = 0; i < game.playersTotal; i++) {
            set_player(3 * i);
            $currentPlayer.attr('data-id', i);
        }

        for (var i = 0; i < scoring.length; i++) {
            set_player(i);

            if ( !isNaN( parseInt( scoring[i] ) ) ) {
                $targetPlayer = $('.players .player' + scoring[i] );
                var lifes = $targetPlayer.attr('data-lives');
                lifes--;
                if (0 >= lifes) {
                    lifes = 0;
                    $targetPlayer.addClass('killed');
                }
                $targetPlayer.attr('data-lives', lifes);
            }
            
            if (i % 3 == 2) {
                var nextPlayerNum = currentPlayerNum + 1;
                if (nextPlayerNum >= game.playersTotal) nextPlayerNum = 0;
                var $nextPlayer = $( '.players .player' + nextPlayerNum );
                $nextPlayer.find( '.throw' ).addClass('dart');
            }
            
            var currentThrow = i % 3 + 1;
            var $currentThrow = $currentPlayer.find( '.throw' + currentThrow );
            $currentThrow.removeClass('dart');


            if ('killer' == scoring[i]) {
                $('.players .player' ).removeClass('killer');
                $currentPlayer.addClass('killer');
            }
            
            $('.players .current').removeClass('current');
            set_player();
            $currentPlayer.addClass('current');
                        
        }
        if ( $currentPlayer.hasClass('killer')) {
            //$('.players .player:not(.killer) .target').addClass('active') ;
            $('.players .player .target').addClass('active') ;
        }
        
        show_lifes();

        if ( $currentPlayer.hasClass('killed') ) {
                if (scoring[i + 3] !== 'dead') {
                    scoring.push('dead');
                    scoring.push('dead');
                    scoring.push('dead');
                    render_scores();
                }
        }


        game.players = [];
        $('.players .player').each(function(){
            var player = {};
            player.nm = $(this).find('.name input').val();
            player.nb = $(this).find('.number select').val();
            player.l = $( this ).attr( 'data-lives' );
            player.d = $(this).find('.dart').length;
            player.c = ( $( this ).hasClass( 'current' ) ) ? true : false;
            player.k = ( $( this ).hasClass( 'killer' ) ) ? true : false;
            player.kd = ( $( this ).hasClass( 'killed' ) ) ? true : false;
            player.t = ( $( this ).find('.target').hasClass( 'active' ) ) ? true : false;

            game.players.push(player);
        });

        send_scores();
    }

    function show_lifes() {
        $('.players .player').each(function(){
            var lifes = $( this ).attr( 'data-lives' );
            $( this ).find('.lifes').html('');    
            for (var i = 1; i <= lifes; i++) {
                $( this ).find('.lifes').append( '<span class="life">&nbsp;</span>' );
            }
        });
    }

    function set_player(i) {
        if ( typeof('undefined') == i || null == i ) {
            currentPlayerNum = Math.floor ( (scoring.length) / 3 ) % game.playersTotal;
        } else {
            currentPlayerNum = Math.floor ( i / 3 ) % game.playersTotal;
        }
        $currentPlayer = $( '.players .player' + currentPlayerNum );
    }
});