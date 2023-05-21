{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- quibbles implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    quibbles_quibbles.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->
<div class="quibbles">
    <div id="player-hand" class="whiteblock">

    </div>
    <div class="row-1">
        <div id="card-deck" class="whiteblock">deck</div>
        <div id="player-area-top" class="whiteblock">player-top</div>
        <div id="card-discard" class="whiteblock">discard</div>
    </div>
    <div class="row-2">
        <div id="player-area-left" class="whiteblock">player-left</div>
        <div id="card-display" class="whiteblock"></div>
        <div id="player-area-right" class="whiteblock">player-right</div>
    </div>
    <div class="row-3">
        <div class="spacer whiteblock"></div>
        <div id="player-area-bottom" class="whiteblock">player-bottom</div>
        <div class="spacer whiteblock" ></div>
    </div>
</div>


<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

*/

</script>  

{OVERALL_GAME_FOOTER}
