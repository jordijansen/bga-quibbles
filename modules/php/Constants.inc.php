<?php

const DISPLAY_CARD_SIZE = 6;
const INITIAL_HAND_SIZE = 3;

/**
 * State
 */
const ST_GAME_SETUP = 'gameSetup';
const ST_GAME_SETUP_ID = 1;
const ST_PLAYER_TURN = 'playerTurn';
const ST_PLAYER_TURN_ID = 10;
const ST_PLAYER_TURN_TAKE = 'playerTurnTake';
const ST_PLAYER_TURN_TAKE_ID = 11;
const ST_PLAYER_TURN_TAKE_CONFIRM = 'playerTurnTakeConfirm';
const ST_PLAYER_TURN_TAKE_CONFIRM_ID = 12;
const ST_PLAYER_TURN_ADD_COLLECTION = 'playerTurnAddCollection';
const ST_PLAYER_TURN_ADD_COLLECTION_ID = 13;

const ST_NEXT_PLAYER = 'nextPlayer';
const ST_NEXT_PLAYER_ID = 20;
const ST_GAME_END = 'gameEnd';
const ST_GAME_END_ID = 99;


/**
 * Actions
 */
const ACT_CHOOSE_ACTION = 'chooseAction';
const ACT_TAKE = 'take';
const ACT_TAKE_CONFIRM_DISCARD = 'takeConfirmDiscard';
const ACT_PASS = 'pass';
const ACT_END_TURN = 'endTurn';
const ACT_ADD_COLLECTION = 'addCollection';
const ACT_CONFIRM = 'confirm';
const ACT_CANCEL = 'cancel';


/**
 * Card Zones
 */
const ZONE_DECK = 'deck';
const ZONE_DISPLAY = 'display';
const ZONE_DISCARD = 'discard';
const ZONE_PLAYER_HAND = 'hand';
const ZONE_PLAYER_AREA = 'player';

/**
 * Global variables
 */
const UNDO = 'undo';
const TAKE = 'take';

/*
 * Constants
 */
const CANCELLABLE_MOVES = 10;
const DISCARDED_HAND_CARDS = 11;
