<?php

const DISPLAY_CARD_SIZE = 5;

/**
 * State
 */
const ST_GAME_SETUP = 'gameSetup';
const ST_GAME_SETUP_ID = 1;
const ST_PLAYER_TURN = 'playerTurn';
const ST_PLAYER_TURN_ID = 10;
const ST_NEXT_PLAYER = 'nextPlayer';
const ST_NEXT_PLAYER_ID = 11;
const ST_GAME_END = 'gameEnd';
const ST_GAME_END_ID = 99;


/**
 * Actions
 */
const ACT_PLAY = 'play';
const ACT_PASS = 'pass';

/**
 * Card Zones
 */
const ZONE_DECK = 'deck';
const ZONE_DISPLAY = 'display';
const ZONE_DISCARD = 'discard';
const ZONE_PLAYER_HAND = 'hand';
const ZONE_PLAYER_AREA = 'player';
