<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * quibbles implementation : © jordijansen <jordi@itbyjj.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 * 
 * states.inc.php
 *
 * quibbles game states description
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!

require_once("modules/php/Constants.inc.php");

$basicGameStates = [

    // The initial state. Please do not modify.
    ST_GAME_SETUP_ID => [
        "name" => ST_GAME_SETUP,
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => [ "" => ST_PLAYER_TURN_ID ]
    ],

    // Final state.
    // Please do not modify.
    ST_GAME_END_ID => [
        "name" => ST_GAME_END,
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd",
    ],
];

$playerActionsGameStates = [
    ST_PLAYER_TURN_ID => [
        "name" => ST_PLAYER_TURN,
        "description" => clienttranslate('${actplayer} must TAKE or PASS'),
        "descriptionmyturn" => clienttranslate('${you} must TAKE or PASS'),
        "type" => "activeplayer",
        "action" => "stPlayerTurn",
        "possibleactions" => [
            ACT_CHOOSE_ACTION,
        ],
        "transitions" => [
            ACT_TAKE => ST_PLAYER_TURN_TAKE_ID,
            ACT_PASS => ST_PLAYER_TURN_PASS_ID
        ]
    ],
    ST_PLAYER_TURN_TAKE_ID => [
        "name" => ST_PLAYER_TURN_TAKE,
        "description" => clienttranslate('TAKE: ${actplayer} must select between 1 - 6 cards from their hand with a total value of 6 or less to discard'),
        "descriptionmyturn" => clienttranslate('TAKE: ${you} must select between 1 - 6 cards from your hand with a total value of 6 or less to discard'),
        "type" => "activeplayer",
        "args" => "argPlayerTurnTake",
        "possibleactions" => [
            ACT_TAKE_CONFIRM_DISCARD,
            ACT_CANCEL,
        ],
        "transitions" => [
            ACT_TAKE_CONFIRM_DISCARD => ST_PLAYER_TURN_TAKE_CONFIRM_ID,
            ACT_CANCEL => ST_PLAYER_TURN_ID
        ]
    ],
    ST_PLAYER_TURN_TAKE_CONFIRM_ID => [
        "name" => ST_PLAYER_TURN_TAKE_CONFIRM,
        "description" => clienttranslate('TAKE: ${actplayer} must take card(s) from the display'),
        "descriptionmyturn" => clienttranslate('TAKE: ${you} can take as many cards as you can from the display'),
        "type" => "activeplayer",
        "args" => "argPlayerTurnTakeConfirm",
        "possibleactions" => [
            ACT_CONFIRM,
            ACT_CANCEL,
        ],
        "transitions" => [
            ACT_CONFIRM => ST_PLAYER_TURN_ADD_COLLECTION_ID,
            ACT_CANCEL => ST_PLAYER_TURN_ID
        ]
    ],

    ST_PLAYER_TURN_ADD_COLLECTION_ID => [
        "name" => ST_PLAYER_TURN_ADD_COLLECTION,
        "description" => clienttranslate('${actplayer} may add a card to their collection'),
        "descriptionmyturn" => clienttranslate('${you} may add a card to your collection'),
        "type" => "activeplayer",
        "args" => "argPlayerTurnAddCollection",
        "possibleactions" => [
            ACT_END_TURN,
            ACT_ADD_COLLECTION
        ],
        "transitions" => [
            ST_NEXT_PLAYER => ST_NEXT_PLAYER_ID
        ]
    ],

    ST_PLAYER_TURN_PASS_ID => [
        "name" => ST_PLAYER_TURN_PASS,
        "description" => clienttranslate('PASS: ${actplayer} must choose a card to add to the display'),
        "descriptionmyturn" => clienttranslate('PASS: ${you} must choose a card to add to the display'),
        "type" => "activeplayer",
        "args" => "argPlayerTurnPass",
        "possibleactions" => [
            ACT_PASS,
            ACT_CANCEL
        ],
        "transitions" => [
            ACT_PASS => ST_PLAYER_TURN_ADD_COLLECTION_ID,
            ACT_CANCEL => ST_PLAYER_TURN_ID
        ]
    ],
];

$gameGameStates = [
    ST_NEXT_PLAYER_ID => [
        "name" => ST_NEXT_PLAYER,
        "description" => "",
        "type" => "game",
        "action" => "stNextPlayer",
        "transitions" => [
            ST_PLAYER_TURN => ST_PLAYER_TURN_ID,
            ST_GAME_END => ST_GAME_END_ID,
        ],
        "updateGameProgression" => true
    ],
];

$machinestates = $basicGameStates + $playerActionsGameStates + $gameGameStates;