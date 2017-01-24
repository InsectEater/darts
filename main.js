$( document ).ready(function() {
    var $player = $('#defaults .player');
    var $currentPlayer = null;
    var $activePlayer = null;
    var gameInProgress = false;
    var playersTotal = 2;
    var scoresNeeded = 301;
    var currentPlayerNum = 0;
    var currentRound = 0;
    var scoring = [];
    var multiplier = 1;
    var settings = {
        totalscores: 301,
        nullify: true,
        totalRounds: 10,
    }

    var valid_null_results = [];
    for (var i = 1; i <= 20; i++) {
        valid_null_results.push(i);
        valid_null_results.push(i*2);
        valid_null_results.push(i*3);
    }
    valid_null_results.push(25);
    valid_null_results.push(50);

    $('#cta-start').click(function(){
        clear_multipliers();
        if ('Reset' == $(this).html())
            game_reset();
        else
            game_start(); //console.log($('.players .player').toArray());
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

        for (var i = 0; i < scoring.length; i++) {
            set_player(i);
            if ($currentPlayer.hasClass('winner'))
                continue;

            if (i % 3 == 2) {
                var nextPlayerNum = currentPlayerNum + 1;
                if (nextPlayerNum >= playersTotal) nextPlayerNum = 0;
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
            var scoresObj = score_add_revert( scores, parseIntt(scoring[i].mult * scoring[i].val) );
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
        currentRound = Math.floor(scoring.length/(3*playersTotal)) + 1;
        if ( currentRound > settings.totalRounds  ) {
            gameInProgress = false;
            var maxScores = 0;
            var winnerIndex = 0;
            for (i = 0; i < playersTotal; i++) {
                var $nextPlayer = $('#player' +  i);
                var currentScores = parseInt( $nextPlayer.find('.scores').text() );
                if (currentScores > maxScores) {
                    maxScores = currentScores;
                    winnerIndex = i;
                }
            }
            $nextPlayer = $('#player' +  winnerIndex);
            $nextPlayer.addClass('winner');
            return;
        }

        set_player();
        nullify_show_others()
        $currentPlayer.addClass('current');
        $('.rounds').html('Round '+ currentRound + '/' + settings.totalRounds);
    }


    function nullify_show_others(nullifyScores) {
        var scores = parseInt( $currentPlayer.find('.scores').text() );
        for (var j = 0; j < playersTotal; j++) {
            $nullingPlayer = $('#player' + j);
            if ( $nullingPlayer.attr('id') ==  $currentPlayer.attr('id') ) {
                $nullingPlayer.find('.nullify').text('');
                continue;
            }
            var nScores = parseInt( $nullingPlayer.find('.scores').text() );
            $nullingPlayer.find('.nullify').text( score_validate_positive( nScores - scores ) );
            if (settings.nullify && nullifyScores && 0 == nScores - scores) {
                $nullingPlayer.find('.scores').text(0);
                $nullingPlayer.find('.remaining').text(settings.totalscores);

            }
        }
    }

    function game_start() {
        $('#cta-start').html('Reset');
        $('.settings').slideUp(200);
        gameInProgress = true;
        playersTotal = $('#players-total').val();
        settings.totalscores = parseIntt( $('#totalscores').val() );
        settings.totalRounds = parseIntt( $('#totalRounds').val() );
        $('.players').html('');
        $player.find('.scores').html( '0' );
        $player.find('.remaining').html( settings.totalscores );
        for (var i = 0; i < playersTotal; i++) {
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
            currentPlayerNum = Math.floor ( (scoring.length) / 3 ) % playersTotal;
        } else {
            currentPlayerNum = Math.floor ( i / 3 ) % playersTotal;
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
        }console.log(throww);
        var s = scores + throww;
        if (s > settings.totalscores) {
            s = 2*settings.totalscores - s;
            return {'value': s, 'overridden': true};
        }
        return {'value': s, 'overridden': false};
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
    
    $('.menu-toggle').on('click', function() { $('.settings').slideToggle(200); });

});