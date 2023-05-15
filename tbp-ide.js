/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Villagers implementation : © The Brothers Perry arperry@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * tbp-ide.js
 *
 * Not actually included, but it makes the IDE happy
 */

const TBP = {
  current_player_is_active: true,
  isCurrentPlayerActive: () => TBP.current_player_is_active,
  ajaxcall: (url, data, binding, success, always) => {
    // Here I list functions that are used by the framework so that the IDE knows they're not unused
    TBP.onEnteringState(1, 2);
    TBP.onLeavingState();
    TBP.setup(3);
  },
  checkAction: (action) => {},
  confirmationDialog: (text, cb) => {},
  displayScoring: (id, color, points, duration, offsetX, offsetY) => {},
  notifqueue: () => ({ setSynchronous: (notification, delay) => {} }),
  isSpectator: 0,
  scoreCtrl: { 0: new ebg.counter() },
  format_block: (tpl, params, destId) => {},
  slideTemporaryObject: (obj, parent, from, to, duration, delay) => {},
  updatePageTitle: () => {},
  removeActionButtons: () => {},
  disconnectAll: () => {},
  connectClass: (className, event, cb) => {},
  addTooltip: (id, text, clickText) => {},
  addTooltipHtml: (id, html) => {},
  showMessage: (text, type) => {},
  gamedatas: {
    gamestate: {
      name: 'state'
    },
  }
};

const _ = (t) => t;
const $ = (id) => document.getElementById(id);

const gameui = {
  addActionButton: (id, label, cb, x, y, color) => {},
};

const define = () => {};
const g_gamethemeurl = './';

const ebg = {
  core: {
    gamegui: {}
  },

  zone: function () {
    this.create = (bind, id, itemWidth, itemHeight) => {};
    this.setPattern = (pattern) => {};
    this.placeInZone = (id, weight) => {};
    this.removeFromZone = (id, isDestroyed, destination) => {};
    this.getItemNumber = () => 0;
    this.getAllItems = () => [];
    this.removeAll = () => {};
  },

  counter: function () {
    this.toValue = () => {};
    this.setValue = () => {};
    this.getValue = () => 0;
  },

  popindialog: function () {
    this.create = (id) => id;
    this.setContent = (content) => content;
    this.setTitle = (title) => title;
  },

  stock: function () {
    this.create = (id) => id;
    this.getSelectedItems = () => [];
    this.setSelectionMode = (mode) => {};
    this.setSelectionAppearance = (type) => {};
    this.addItemType = (type, weight, image, imagePosition) => {};
    this.addToStock = (type, from) => {};
    this.addToStockWithId = (type, id, from) => {};
    this.removeFromStock = (type, to, noUpdate) => {};
    this.removeFromStockById = (id, to, noUpdate) => {};
    this.unselectAll = () => {};
    this.setOverlap = (xPct, yPct) => {};
    this.removeAll = () => {};
    this.updateDisplay = () => {};
  },
};

const dojo = {
  subscribe: (notification, bind, handler) => {},
  place: (html, id) => {},
  hitch: (scope, fn, ...args) => {},
  fadeIn: (options) => {},
  query: (selector) => ({
    addClass: (className) => {},
    removeClass: (className) => {},
  }),
  byId: (id) => dojo.query(id),
  stopEvent: (event) => {},
  hasClass: (el, className) => el.classList.contains(className),
  string: {
    substitute: (text, params) => '',
  },
};

this.game = TBP;
