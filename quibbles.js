var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var log = isDebug ? console.log.bind(window.console) : function () { };
define([
    "dojo", "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"
], function (dojo, declare) {
    return declare("bgagame.quibbles", ebg.core.gamegui, new Quibbles());
});
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var CardManager = /** @class */ (function () {
    function CardManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.locations = {};
    }
    CardManager.prototype.addLocation = function (name, location) {
        this.locations[name] = location;
    };
    CardManager.prototype.getLocation = function (name) {
        return this.locations[name];
    };
    CardManager.prototype.addClickListener = function (card, handler) {
        dojo.connect($(this.settings.getId(card)), 'onClick', handler);
    };
    CardManager.prototype.createCardElement = function (card) {
        return "<div id=\"".concat(this.settings.getId(card), "\" class=\"bga-card ").concat(this.settings.getCardClassNames(card), "\">\n                    <div class=\"bga-card-inner\">\n                        <div class=\"bga-card-front\"></div>\n                        <div class=\"bga-card-back\"></div>\n                    </div>\n                </div>");
    };
    return CardManager;
}());
var CardLocation = /** @class */ (function () {
    function CardLocation(cardManager, containerId) {
        this.cardManager = cardManager;
        this.containerId = containerId;
        this.cards = [];
        dojo.addClass($(containerId), 'card-location');
    }
    CardLocation.prototype.addAll = function (cardsToAdd) {
        var _this = this;
        cardsToAdd.forEach(function (card) { return _this.add(card); });
    };
    CardLocation.prototype.add = function (cardToAdd) {
        this.cards.push(cardToAdd);
        var cardElement = this.cardManager.createCardElement(cardToAdd);
        dojo.place(cardElement, $(this.containerId));
    };
    CardLocation.prototype.getCards = function () {
        return __spreadArray([], this.cards, true);
    };
    CardLocation.prototype.getCardIds = function () {
        return this.getCards().map(function (card) { return card.id; });
    };
    CardLocation.prototype.hasCardId = function (id) {
        return this.getCardIds().includes(id);
    };
    return CardLocation;
}());
var HorizontalCardLocation = /** @class */ (function (_super) {
    __extends(HorizontalCardLocation, _super);
    function HorizontalCardLocation(cardManager, containerId) {
        var _this = _super.call(this, cardManager, containerId) || this;
        dojo.addClass($(containerId), 'horizontal-card-location');
        return _this;
    }
    return HorizontalCardLocation;
}(CardLocation));
var Quibbles = /** @class */ (function () {
    function Quibbles() {
    }
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */
    Quibbles.prototype.setup = function (gamedatas) {
        log("Starting game setup");
        this.gamedatas = gamedatas;
        this.cardManager = new CardManager(this, {
            cardHeightInPixels: 257,
            cardWidthInPixels: 165,
            getId: function (card) {
                return "quibbles-card-".concat(card.id);
            },
            getCardClassNames: function (card) {
                return "quibbles-card quibbles-card-".concat(card.type, "-").concat(card.type_arg);
            }
        });
        this.cardManager.addLocation('player-hand', new HorizontalCardLocation(this.cardManager, 'player-hand'));
        this.cardManager.addLocation('display', new HorizontalCardLocation(this.cardManager, 'card-display'));
        this.cardManager.getLocation('display').addAll(gamedatas.display);
        log('gamedatas', gamedatas);
        log("Ending game setup");
    };
    ///////////////////////////////////////////////////
    //// Game & client states
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    Quibbles.prototype.onEnteringState = function (stateName, args) {
        log('Entering state: ' + stateName, args.args);
        switch (stateName) {
            //TODO
        }
    };
    Quibbles.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            //TODO
        }
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Quibbles.prototype.onUpdateActionButtons = function (stateName, args) {
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                //TODO
            }
        }
    };
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    Quibbles.prototype.isReadOnly = function () {
        return this.isSpectator || typeof g_replayFrom != 'undefined' || g_archive_mode;
    };
    Quibbles.prototype.getPlayerId = function () {
        return Number(this.player_id);
    };
    Quibbles.prototype.getPlayer = function (playerId) {
        return Object.values(this.gamedatas.players).find(function (player) { return Number(player.id) == playerId; });
    };
    Quibbles.prototype.takeAction = function (action, data) {
        data = data || {};
        data.lock = true;
        this.ajaxcall("/elawa/elawa/".concat(action, ".html"), data, this, function () { });
    };
    Quibbles.prototype.takeNoLockAction = function (action, data) {
        data = data || {};
        this.ajaxcall("/elawa/elawa/".concat(action, ".html"), data, this, function () { });
    };
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    Quibbles.prototype.setupNotifications = function () {
        var _this = this;
        log('notifications subscriptions setup');
        var notifs = [
        // TODO
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    return Quibbles;
}());
