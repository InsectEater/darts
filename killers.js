$( document ).ready(function() {
    var settings = {
        playersTotal: 3,
        totalLifes: 3,
    }
    var $player = $('#defaults .player');
    var $currentPlayer = '';
    var scoring = [];

    game_start();

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
        scoring.push( 'killer' );
        render_scores();
       
    });

    $('#miss').click(function(){
        scoring.push( 'miss' );
        render_scores();
    });

    $('.target').click(function(){
        $targetPlayer = $(this).closest('.player');
        scoring.push( $targetPlayer.attr('data-id') );
        render_scores();
    });

    function game_start() {
        $('.players').html('');
        for (var i = 0; i < settings.playersTotal; i++) {
            var $anotherPlayer = $player.clone();
            $anotherPlayer.addClass('player' + i);
            $('.players').append( $anotherPlayer );
            $anotherPlayer.find('.name input').val('Player ' + (i + 1));
            $anotherPlayer.find('.name input').on('focus', function() { $(this).select(); });
        }

        $('.players select').change(function() {
            //var value = $(this).val();
            var $element = $(this);
            $('.players select' ).each(function(){
                if ( $( this ).val() == $element.val() && !$( this ).is( $element ) )
                    $element.val( '' );
                    console.log('changed');
            });
        });

        render_scores();
    }

    function render_scores() {
        //console.log('Resetting all');
        $('.players .throw' ).removeClass('dart');
        $('.players .player' ).removeClass('killer');
        $('.players .player' ).removeClass('killed');
        $('.players .player' ).attr('data-lifes', settings.totalLifes);
        $('.players .player0').addClass('current');
        $('.players .player0 .throw' ).addClass('dart');
        $('.players .player .target').removeClass('active') ;
        for (var i = 0; i < settings.playersTotal; i++) {
            set_player(3 * i);
            $currentPlayer.attr('data-id', i);
        }

        for (var i = 0; i < scoring.length; i++) {
            set_player(i);

            /*if ($currentPlayer.hasClass('killed'))
                continue;*/

            if ( !isNaN( parseInt( scoring[i] ) ) ) {
                $targetPlayer = $('.players .player' + scoring[i] );
                var lifes = $targetPlayer.attr('data-lifes');
                lifes--;
                if (0 >= lifes) {
                    lifes = 0;
                    $targetPlayer.addClass('killed');
                }
                $targetPlayer.attr('data-lifes', lifes);
            }
            
            if (i % 3 == 2) {
                var nextPlayerNum = currentPlayerNum + 1;
                if (nextPlayerNum >= settings.playersTotal) nextPlayerNum = 0;
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
             $('.players .player:not(.killer) .target').addClass('active') ;
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

        //console.log(scoring);
    }


    function show_lifes() {
        $('.players .player').each(function(){
            var lifes = $( this ).attr( 'data-lifes' );
            $( this ).find('.lifes').html('');    
            for (var i = 1; i <= lifes; i++) {
                $( this ).find('.lifes').append( '<span class="life">&nbsp;</span>' );
            }
        });
    }

    function set_player(i) {
        if ( typeof('undefined') == i || null == i ) {
            currentPlayerNum = Math.floor ( (scoring.length) / 3 ) % settings.playersTotal;
        } else {
            currentPlayerNum = Math.floor ( i / 3 ) % settings.playersTotal;
        }
        //console.log('currentPlayerNum: ' + currentPlayerNum);
        $currentPlayer = $( '.players .player' + currentPlayerNum );
        //console.log($currentPlayer.attr('class'));
    }


});