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
    <div id="quibbles-ui-row-1" class="quibbles-ui-row">
        <div class="whiteblock"><div id="card-deck"></div></div>
        <div id="logo-container"><img alt="logo" src="{GAMETHEMEURL}/img/logo.png"/></div>
        <div class="whiteblock"><div id="card-discard"></div></div>
    </div>
    <div id="quibbles-ui-row-2" class="quibbles-ui-row">
        <div class="whiteblock">
            <div id="card-display"></div>
        </div>
    </div>
    <div id="quibbles-ui-row-3" class="quibbles-ui-row">
        <div class="whiteblock">
            <div id="player-hand"></div>
        </div>
    </div>
    <div id="quibbles-ui-row-4" class="quibbles-ui-row">
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
