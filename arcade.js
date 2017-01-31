$( document ).ready(function() {
    var $player = $('#defaults .player');
    var $currentPlayer = null;
    var $activePlayer = null;
    var gameInProgress = false;
    var currentPlayerNum = 0;
    var currentRound = 0;
    var scoring = [];
    var scoresId = '';
    var token = '';
    var multiplier = 1;
    var settings = {
        playersTotal: 2,
        totalscores: 301,
        nullify: true,
        totalRounds: 10,
        doublesEnd: true
    }

    var valid_null_results = [];
    for (var i = 1; i <= 20; i++) {
        valid_null_results.push(i);
        valid_null_results.push(i*2);
        valid_null_results.push(i*3);
    }
    valid_null_results.push(25);
    valid_null_results.push(50);

    if ( $('#sendOnline').prop('checked') )
        get_scores_id();
    
    $('#sendOnline').change(function(){
        if ( $(this).prop('checked') ) {
            if ( '' == scoresId ) {
                get_scores_id();
            }
            set_indicator('loading', 'Loading data...')
        }
        if ( ! $(this).prop('checked') ) {
            set_indicator('disabled', '')
        }
    });
    //$('#sendOnline').prop('checked') )

    $('#cta-start').click(function(){
        clear_multipliers();
        if ('Reset' == $(this).html())
            game_reset();
        else
            game_start();
    });

    $('.be25').click(function(){
        if (!gameInProgress) return;
        var element = Object.assign({}, {mult: 1, val: 25});
        scoring.push( element );
        clear_multipliers();
        render_scoring();
    });

    $('.be50').click(function() {
        if (!gameInProgress) return;
        var element = Object.assign({}, {mult: 1, val: 50});
        scoring.push( element );
        clear_multipliers();
        render_scoring();
    });

    $('.number').click(function() {
        if (!gameInProgress) return;
        var element = Object.assign({}, {mult: multiplier, val:  parseInt( $(this).html() ) });
        scoring.push( element );
        clear_multipliers();
        render_scoring();
    });

    $('.del').click(function() {
        var lastValue = scoring.pop().val;
        if (lastValue == 'X') lastValue = scoring.pop().val;
        if (lastValue == 'X') lastValue = scoring.pop().val;
        if (lastValue == 'X') lastValue = scoring.pop().val;
        clear_multipliers();
        $('.throw').text('');
        $('.remaining').text(settings.totalscores);
        $('.scores').text('0');
        $('.player').removeClass('winner');
        gameInProgress = true;
        render_scoring();
    });

    $('.dbl').click(function() {
        if (!gameInProgress) return;
        if ( $(this).hasClass('active') ) {
            clear_multipliers();
            return;
        }
        clear_multipliers();
        $(this).addClass('active');
        multiplier = 2;
    });

    $('.trpl').click(function() {
        if (!gameInProgress) return;
        if ( $(this).hasClass('active') ) {
            clear_multipliers();
            return;
        }
        clear_multipliers();
        $(this).addClass('active');
        multiplier = 3;
    });


    function render_scoring() {
        $('.players .name').each(function() {
            $(this).find('span').text(
                $(this).find('input').val()
            );
        });
        for (var i = 0; i < scoring.length; i++) {
            set_player(i);
            if ($currentPlayer.hasClass('winner'))
                continue;

            if (i % 3 == 2) {
                var nextPlayerNum = currentPlayerNum + 1;
                if (nextPlayerNum >= settings.playersTotal) nextPlayerNum = 0;
                var $nextPlayer = $( '#player' +nextPlayerNum );
                if (!$nextPlayer.hasClass('winner')) {
                    $nextPlayer.find('.throw1').text('');
                    $nextPlayer.find('.throw2').text('');
                    $nextPlayer.find('.throw3').text('');
                }
            }

            var $scores = $currentPlayer.find('.scores');
            var scores = parseInt( $scores.text() );
            var $remaining = $currentPlayer.find('.remaining');
            var remaining = parseInt( $remaining.text() );
            if (3 * currentPlayerNum == i) {
                scores = 0;
                remaining = settings.totalscores;
            }
            var scoresObj = score_add_revert( scores, scoring[i] );
            scores = scoresObj.value;
            var nextValueIsNotX = typeof(scoring[i + 1]) == 'undefined' ? true : scoring[i + 1].val !== 'X';
            if (scoresObj.overridden && nextValueIsNotX) {
                var xToAdd = 2 - i%3;
                for (var j = 0; j < xToAdd; j++) {
                    scoring.push({'mult': 1, 'val': 'X'} );
                }
            }

            $scores.text( scores );
            remaining = settings.totalscores - parseIntt(scores);
            $remaining.text( remaining );
            nullify_show_others(true)
            var currentThrow = i % 3 + 1;
            var $currentThrow = $currentPlayer.find( '.throw' + currentThrow );
            //$currentThrow.text( scoring[i].mult * parseIntt(scoring[i].val) );
            $currentThrow.text( score_get_text_value( scoring[i] ) );
            
           if (0 == remaining) {
                $currentPlayer.addClass('winner');
                gameInProgress = false;
            }
        }

        $('.players .player').removeClass('current');
        currentRound = Math.floor(scoring.length/(3*settings.playersTotal)) + 1;
        if ( currentRound > settings.totalRounds  ) {
            gameInProgress = false;
            var maxScores = 0;
            var winnerIndex = 0;
            for (i = 0; i < settings.playersTotal; i++) {
                var $nextPlayer = $('#player' +  i);
                var currentScores = parseInt( $nextPlayer.find('.scores').text() );
                if (currentScores > maxScores) {
                    maxScores = currentScores;
                    winnerIndex = i;
                }
            }
            $nextPlayer = $('#player' +  winnerIndex);
            $nextPlayer.addClass('winner');
            send_scores();
            return;
        }

        set_player();
        nullify_show_others()
        $currentPlayer.addClass('current');
        $('.rounds').html('Round '+ currentRound + '/' + settings.totalRounds);
        send_scores();
    }


    function nullify_show_others(nullifyScores) {
        if (!settings.nullify)
            return;
        var scores = parseInt( $currentPlayer.find('.scores').text() );
        for (var j = 0; j < settings.playersTotal; j++) {
            $nullingPlayer = $('#player' + j);
            if ( $nullingPlayer.attr('id') ==  $currentPlayer.attr('id') ) {
                $nullingPlayer.find('.nullify').text('');
                continue;
            }
            var nScores = parseInt( $nullingPlayer.find('.scores').text() );
            $nullingPlayer.find('.nullify').text( score_validate_positive( nScores - scores ) );
            if (nullifyScores && 0 == nScores - scores) {
                $nullingPlayer.find('.scores').text(0);
                $nullingPlayer.find('.remaining').text(settings.totalscores);

            }
        }
    }

    function game_start() {
        $('#cta-start').html('Reset');
        $('.settings').slideUp(200);
        gameInProgress = true;
        settings.playersTotal = $('#players-total').val();
        settings.totalscores = parseIntt( $('#totalscores').val() );
        settings.totalRounds = parseIntt( $('#totalRounds').val() );
        settings.doublesEnd = $('#doublesEnd').prop('checked') ? true : false;
        settings.nullify = $('#nullify').prop('checked') ? true : false;

        $('.players').html('');
        $player.find('.scores').html( '0' );
        $player.find('.remaining').html( settings.totalscores );
        for (var i = 0; i < settings.playersTotal; i++) {
            var $anotherPlayer = $player.clone();
            $anotherPlayer.attr('id', 'player' + i);
            $('.players').append( $anotherPlayer );
            $anotherPlayer.find('.name input').val('Player ' + (i + 1));
            $anotherPlayer.find('.name input').on('focus', function() { $(this).select(); });
        }
        $('#player0').addClass('current');
        $('.rounds').html('Round '+ 1 + '/' + settings.totalRounds);
    }

    function game_reset() {
        if (!confirm('Are you sure?') )
            return;
        $('#cta-start').html('Start');
        gameInProgress = false;
        $('.players').html('');
        $('.rounds').text('');
        currentRound = 0;
        scoring = [];
    }

    function set_player(i) {
        if ( typeof('undefined') == i || null == i ) {
            currentPlayerNum = Math.floor ( (scoring.length) / 3 ) % settings.playersTotal;
        } else {
            currentPlayerNum = Math.floor ( i / 3 ) % settings.playersTotal;
        }
        $currentPlayer = $( '#player' + currentPlayerNum );
        /*if ( $currentPlayer.hasClass('winner') )
            set_player(i + 1);*/
    }

    function clear_multipliers() {
        $( '.dbl, .trpl' ).removeClass('active');
        multiplier = 1;
    }

    function score_add_revert(scores, throww) {
        if ('X' == throww) {
            return {'value': scores, 'overridden': false};
        }
        var scores_throwed = parseIntt(throww.mult * throww.val);
        var s = scores + scores_throwed;
        
        if (s == settings.totalscores) { 
            if ( throw_can_end_turn(throww) )
                return {'value': s, 'overridden': false};
            return {'value': s - scores_throwed, 'overridden': true};
        }

        if ( settings.doublesEnd && s == settings.totalscores - 1)
            return {'value': s - scores_throwed, 'overridden': true};

        if (s > settings.totalscores) {
            s = 2*settings.totalscores - s;
            return {'value': s, 'overridden': true};
        }
        return {'value': s, 'overridden': false};
    }

    function throw_can_end_turn(throww) {
        if (! settings.doublesEnd) return true;
        if ( $.inArray(throww.val, [25, 50]) > -1)
            return true;
        if ( $.inArray(throww.mult, [2, 3]) > -1)
            return true;
        return false;
    }

    function score_get_text_value(element) {
        var result = parseInt(element.val);
        if ( isNaN(result) ) return element.val;
        return element.mult * element.val;
    }

    function score_validate_positive(score) {
        if ( valid_null_results.indexOf(score) == -1) return '';
        return score;
    }

    function parseIntt(number) {
        var result = parseInt(number);
        if ( isNaN(number) ) return 0;
        return result;
    }

    $('#totalRounds').on('focus', function() { $(this).select(); });
    
    $('.menu-toggle').on('click', function(event) {
        event.stopImmediatePropagation()
        $('.settings').slideToggle(200); 
    });

    $('.settings').on('click', function(event) {
        event.stopImmediatePropagation()
    });

    $('body').on('click', function() {
        if ( $('.settings').is(':visible') )
            $('.settings').slideUp(200);
    });

    function get_scores_id() {
        set_indicator('loading', 'Loading data...');
        var jqxhr = $.get( "scores.php?action=get&data=id",
        function( response ) {
            data = JSON.parse( response );
            if ('OK' == data.status) {
                scoresId = data.body.id;
                token = data.body.token;
                $('#scoresId').val( scoresId );
                set_indicator('ok', data.msg);
            } else {
                set_indicator('error', data.msg);
            }
        })
          .fail(function() {
            set_indicator('error', 'Connection error');
          })
    }

    function send_scores() {

        if ( '' == scoresId ) return;
        if ( ! $('#sendOnline').prop('checked') ) return;

        var post = {
            id    : scoresId,
            token : token,
            game  : 'arcade',
            data  : $('.viewport').html()
        };
        set_indicator('loading', 'Loading response...');
        var jqxhr = $.post( "scores.php?action=put", post,
        function( response ) {
            data = JSON.parse(response);
            if ( 'OK' == data.status )
                set_indicator( 'ok', 'Scores sent' );
            else {
                set_indicator( 'error', data.msg )
                console.log(response);
            }
        })
          .fail(function() {
            set_indicator('error', 'Connection error')
          }, 'json')

    }

    function set_indicator(state, message) {
        $('.header').attr('title', message);
        switch (state) {
            case 'ok':
                $('.header').css('background-image', "url('images/state_ok.png')" );
                break;
            case 'loading':
                $('.header').css('background-image', "url('images/state_loading.png')" );
                break;
            case 'disabled':
                $('.header').css('background-image', "none" );
                break;
            default:
                $('.header').css('background-image', "url('images/state_error.png')" );
                break;
        }
    }


});