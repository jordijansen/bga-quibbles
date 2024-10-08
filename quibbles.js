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
var DEFAULT_ZOOM_LEVELS = [0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1];
var ZoomManager = /** @class */ (function () {
    /**
     * Place the settings.element in a zoom wrapper and init zoomControls.
     *
     * @param settings: a `ZoomManagerSettings` object
     */
    function ZoomManager(settings) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        this.settings = settings;
        if (!settings.element) {
            throw new DOMException('You need to set the element to wrap in the zoom element');
        }
        this.zoomLevels = (_a = settings.zoomLevels) !== null && _a !== void 0 ? _a : DEFAULT_ZOOM_LEVELS;
        this._zoom = this.settings.defaultZoom || 1;
        if (this.settings.localStorageZoomKey) {
            var zoomStr = localStorage.getItem(this.settings.localStorageZoomKey);
            if (zoomStr) {
                this._zoom = Number(zoomStr);
            }
        }
        this.wrapper = document.createElement('div');
        this.wrapper.id = 'bga-zoom-wrapper';
        this.wrapElement(this.wrapper, settings.element);
        this.wrapper.appendChild(settings.element);
        settings.element.classList.add('bga-zoom-inner');
        if ((_b = settings.smooth) !== null && _b !== void 0 ? _b : true) {
            settings.element.dataset.smooth = 'true';
            settings.element.addEventListener('transitionend', function () { return _this.zoomOrDimensionChanged(); });
        }
        if ((_d = (_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.visible) !== null && _d !== void 0 ? _d : true) {
            this.initZoomControls(settings);
        }
        if (this._zoom !== 1) {
            this.setZoom(this._zoom);
        }
        window.addEventListener('resize', function () {
            var _a;
            _this.zoomOrDimensionChanged();
            if ((_a = _this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth) {
                _this.setAutoZoom();
            }
        });
        if (window.ResizeObserver) {
            new ResizeObserver(function () { return _this.zoomOrDimensionChanged(); }).observe(settings.element);
        }
        if ((_e = this.settings.autoZoom) === null || _e === void 0 ? void 0 : _e.expectedWidth) {
            this.setAutoZoom();
        }
    }
    Object.defineProperty(ZoomManager.prototype, "zoom", {
        /**
         * Returns the zoom level
         */
        get: function () {
            return this._zoom;
        },
        enumerable: false,
        configurable: true
    });
    ZoomManager.prototype.setAutoZoom = function () {
        var _this = this;
        var _a, _b, _c;
        var zoomWrapperWidth = document.getElementById('bga-zoom-wrapper').clientWidth;
        if (!zoomWrapperWidth) {
            setTimeout(function () { return _this.setAutoZoom(); }, 200);
            return;
        }
        var expectedWidth = (_a = this.settings.autoZoom) === null || _a === void 0 ? void 0 : _a.expectedWidth;
        var newZoom = this.zoom;
        while (newZoom > this.zoomLevels[0] && newZoom > ((_c = (_b = this.settings.autoZoom) === null || _b === void 0 ? void 0 : _b.minZoomLevel) !== null && _c !== void 0 ? _c : 0) && zoomWrapperWidth / newZoom < expectedWidth) {
            newZoom = this.zoomLevels[this.zoomLevels.indexOf(newZoom) - 1];
        }
        if (this._zoom == newZoom) {
            if (this.settings.localStorageZoomKey) {
                localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
            }
        }
        else {
            this.setZoom(newZoom);
        }
    };
    /**
     * Set the zoom level. Ideally, use a zoom level in the zoomLevels range.
     * @param zoom zool level
     */
    ZoomManager.prototype.setZoom = function (zoom) {
        var _a, _b, _c, _d;
        if (zoom === void 0) { zoom = 1; }
        this._zoom = zoom;
        if (this.settings.localStorageZoomKey) {
            localStorage.setItem(this.settings.localStorageZoomKey, '' + this._zoom);
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom);
        (_a = this.zoomInButton) === null || _a === void 0 ? void 0 : _a.classList.toggle('disabled', newIndex === this.zoomLevels.length - 1);
        (_b = this.zoomOutButton) === null || _b === void 0 ? void 0 : _b.classList.toggle('disabled', newIndex === 0);
        this.settings.element.style.transform = zoom === 1 ? '' : "scale(".concat(zoom, ")");
        (_d = (_c = this.settings).onZoomChange) === null || _d === void 0 ? void 0 : _d.call(_c, this._zoom);
        this.zoomOrDimensionChanged();
    };
    /**
     * Call this method for the browsers not supporting ResizeObserver, everytime the table height changes, if you know it.
     * If the browsert is recent enough (>= Safari 13.1) it will just be ignored.
     */
    ZoomManager.prototype.manualHeightUpdate = function () {
        if (!window.ResizeObserver) {
            this.zoomOrDimensionChanged();
        }
    };
    /**
     * Everytime the element dimensions changes, we update the style. And call the optional callback.
     */
    ZoomManager.prototype.zoomOrDimensionChanged = function () {
        var _a, _b;
        this.settings.element.style.width = "".concat(this.wrapper.getBoundingClientRect().width / this._zoom, "px");
        this.wrapper.style.height = "".concat(this.settings.element.getBoundingClientRect().height, "px");
        (_b = (_a = this.settings).onDimensionsChange) === null || _b === void 0 ? void 0 : _b.call(_a, this._zoom);
    };
    /**
     * Simulates a click on the Zoom-in button.
     */
    ZoomManager.prototype.zoomIn = function () {
        if (this._zoom === this.zoomLevels[this.zoomLevels.length - 1]) {
            return;
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom) + 1;
        this.setZoom(newIndex === -1 ? 1 : this.zoomLevels[newIndex]);
    };
    /**
     * Simulates a click on the Zoom-out button.
     */
    ZoomManager.prototype.zoomOut = function () {
        if (this._zoom === this.zoomLevels[0]) {
            return;
        }
        var newIndex = this.zoomLevels.indexOf(this._zoom) - 1;
        this.setZoom(newIndex === -1 ? 1 : this.zoomLevels[newIndex]);
    };
    /**
     * Changes the color of the zoom controls.
     */
    ZoomManager.prototype.setZoomControlsColor = function (color) {
        if (this.zoomControls) {
            this.zoomControls.dataset.color = color;
        }
    };
    /**
     * Set-up the zoom controls
     * @param settings a `ZoomManagerSettings` object.
     */
    ZoomManager.prototype.initZoomControls = function (settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.zoomControls = document.createElement('div');
        this.zoomControls.id = 'bga-zoom-controls';
        this.zoomControls.dataset.position = (_b = (_a = settings.zoomControls) === null || _a === void 0 ? void 0 : _a.position) !== null && _b !== void 0 ? _b : 'top-right';
        this.zoomOutButton = document.createElement('button');
        this.zoomOutButton.type = 'button';
        this.zoomOutButton.addEventListener('click', function () { return _this.zoomOut(); });
        if ((_c = settings.zoomControls) === null || _c === void 0 ? void 0 : _c.customZoomOutElement) {
            settings.zoomControls.customZoomOutElement(this.zoomOutButton);
        }
        else {
            this.zoomOutButton.classList.add("bga-zoom-out-icon");
        }
        this.zoomInButton = document.createElement('button');
        this.zoomInButton.type = 'button';
        this.zoomInButton.addEventListener('click', function () { return _this.zoomIn(); });
        if ((_d = settings.zoomControls) === null || _d === void 0 ? void 0 : _d.customZoomInElement) {
            settings.zoomControls.customZoomInElement(this.zoomInButton);
        }
        else {
            this.zoomInButton.classList.add("bga-zoom-in-icon");
        }
        this.zoomControls.appendChild(this.zoomOutButton);
        this.zoomControls.appendChild(this.zoomInButton);
        this.wrapper.appendChild(this.zoomControls);
        this.setZoomControlsColor((_f = (_e = settings.zoomControls) === null || _e === void 0 ? void 0 : _e.color) !== null && _f !== void 0 ? _f : 'black');
    };
    /**
     * Wraps an element around an existing DOM element
     * @param wrapper the wrapper element
     * @param element the existing element
     */
    ZoomManager.prototype.wrapElement = function (wrapper, element) {
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
    };
    return ZoomManager;
}());
var BgaAnimation = /** @class */ (function () {
    function BgaAnimation(animationFunction, settings) {
        this.animationFunction = animationFunction;
        this.settings = settings;
        this.played = null;
        this.result = null;
        this.playWhenNoAnimation = false;
    }
    return BgaAnimation;
}());
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
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function attachWithAnimation(animationManager, animation) {
    var _a;
    var settings = animation.settings;
    var element = settings.animation.settings.element;
    var fromRect = element.getBoundingClientRect();
    settings.animation.settings.fromRect = fromRect;
    settings.attachElement.appendChild(element);
    (_a = settings.afterAttach) === null || _a === void 0 ? void 0 : _a.call(settings, element, settings.attachElement);
    return animationManager.play(settings.animation);
}
var BgaAttachWithAnimation = /** @class */ (function (_super) {
    __extends(BgaAttachWithAnimation, _super);
    function BgaAttachWithAnimation(settings) {
        var _this = _super.call(this, attachWithAnimation, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaAttachWithAnimation;
}(BgaAnimation));
/**
 * Just use playSequence from animationManager
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function cumulatedAnimations(animationManager, animation) {
    return animationManager.playSequence(animation.settings.animations);
}
var BgaCumulatedAnimation = /** @class */ (function (_super) {
    __extends(BgaCumulatedAnimation, _super);
    function BgaCumulatedAnimation(settings) {
        var _this = _super.call(this, cumulatedAnimations, settings) || this;
        _this.playWhenNoAnimation = true;
        return _this;
    }
    return BgaCumulatedAnimation;
}(BgaAnimation));
/**
 * Just does nothing for the duration
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function pauseAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a;
        var settings = animation.settings;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        setTimeout(function () { return success(); }, duration);
    });
    return promise;
}
var BgaPauseAnimation = /** @class */ (function (_super) {
    __extends(BgaPauseAnimation, _super);
    function BgaPauseAnimation(settings) {
        return _super.call(this, pauseAnimation, settings) || this;
    }
    return BgaPauseAnimation;
}(BgaAnimation));
/**
 * Show the element at the center of the screen
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function showScreenCenterAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c;
        var settings = animation.settings;
        var element = settings.element;
        var elementBR = element.getBoundingClientRect();
        var xCenter = (elementBR.left + elementBR.right) / 2;
        var yCenter = (elementBR.top + elementBR.bottom) / 2;
        var x = xCenter - (window.innerWidth / 2);
        var y = yCenter - (window.innerHeight / 2);
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg)");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaShowScreenCenterAnimation = /** @class */ (function (_super) {
    __extends(BgaShowScreenCenterAnimation, _super);
    function BgaShowScreenCenterAnimation(settings) {
        return _super.call(this, showScreenCenterAnimation, settings) || this;
    }
    return BgaShowScreenCenterAnimation;
}(BgaAnimation));
/**
 * Linear slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var _e = getDeltaCoordinates(element, settings), x = _e.x, y = _e.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        element.style.transition = null;
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg)");
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionCancel);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = (_d = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _d !== void 0 ? _d : null;
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideAnimation, _super);
    function BgaSlideAnimation(settings) {
        return _super.call(this, slideAnimation, settings) || this;
    }
    return BgaSlideAnimation;
}(BgaAnimation));
/**
 * Linear slide of the element from origin to destination.
 *
 * @param animationManager the animation manager
 * @param animation a `BgaAnimation` object
 * @returns a promise when animation ends
 */
function slideToAnimation(animationManager, animation) {
    var promise = new Promise(function (success) {
        var _a, _b, _c, _d;
        var settings = animation.settings;
        var element = settings.element;
        var _e = getDeltaCoordinates(element, settings), x = _e.x, y = _e.y;
        var duration = (_a = settings === null || settings === void 0 ? void 0 : settings.duration) !== null && _a !== void 0 ? _a : 500;
        var originalZIndex = element.style.zIndex;
        var originalTransition = element.style.transition;
        element.style.zIndex = "".concat((_b = settings === null || settings === void 0 ? void 0 : settings.zIndex) !== null && _b !== void 0 ? _b : 10);
        var timeoutId = null;
        var cleanOnTransitionEnd = function () {
            element.style.zIndex = originalZIndex;
            element.style.transition = originalTransition;
            success();
            element.removeEventListener('transitioncancel', cleanOnTransitionEnd);
            element.removeEventListener('transitionend', cleanOnTransitionEnd);
            document.removeEventListener('visibilitychange', cleanOnTransitionEnd);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
        var cleanOnTransitionCancel = function () {
            var _a;
            element.style.transition = "";
            element.offsetHeight;
            element.style.transform = (_a = settings === null || settings === void 0 ? void 0 : settings.finalTransform) !== null && _a !== void 0 ? _a : null;
            element.offsetHeight;
            cleanOnTransitionEnd();
        };
        element.addEventListener('transitioncancel', cleanOnTransitionEnd);
        element.addEventListener('transitionend', cleanOnTransitionEnd);
        document.addEventListener('visibilitychange', cleanOnTransitionCancel);
        element.offsetHeight;
        element.style.transition = "transform ".concat(duration, "ms linear");
        element.offsetHeight;
        element.style.transform = "translate(".concat(-x, "px, ").concat(-y, "px) rotate(").concat((_c = settings === null || settings === void 0 ? void 0 : settings.rotationDelta) !== null && _c !== void 0 ? _c : 0, "deg) scale(").concat((_d = settings.scale) !== null && _d !== void 0 ? _d : 1, ")");
        // safety in case transitionend and transitioncancel are not called
        timeoutId = setTimeout(cleanOnTransitionEnd, duration + 100);
    });
    return promise;
}
var BgaSlideToAnimation = /** @class */ (function (_super) {
    __extends(BgaSlideToAnimation, _super);
    function BgaSlideToAnimation(settings) {
        return _super.call(this, slideToAnimation, settings) || this;
    }
    return BgaSlideToAnimation;
}(BgaAnimation));
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var AnimationManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `AnimationManagerSettings` object
     */
    function AnimationManager(game, settings) {
        this.game = game;
        this.settings = settings;
        this.zoomManager = settings === null || settings === void 0 ? void 0 : settings.zoomManager;
        if (!game) {
            throw new Error('You must set your game as the first parameter of AnimationManager');
        }
    }
    AnimationManager.prototype.getZoomManager = function () {
        return this.zoomManager;
    };
    /**
     * Set the zoom manager, to get the scale of the current game.
     *
     * @param zoomManager the zoom manager
     */
    AnimationManager.prototype.setZoomManager = function (zoomManager) {
        this.zoomManager = zoomManager;
    };
    AnimationManager.prototype.getSettings = function () {
        return this.settings;
    };
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    AnimationManager.prototype.animationsActive = function () {
        return document.visibilityState !== 'hidden' && !this.game.instantaneousMode;
    };
    /**
     * Plays an animation if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @param animation the animation to play
     * @returns the animation promise.
     */
    AnimationManager.prototype.play = function (animation) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function () {
            var settings, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        animation.played = animation.playWhenNoAnimation || this.animationsActive();
                        if (!animation.played) return [3 /*break*/, 2];
                        settings = animation.settings;
                        (_a = settings.animationStart) === null || _a === void 0 ? void 0 : _a.call(settings, animation);
                        (_b = settings.element) === null || _b === void 0 ? void 0 : _b.classList.add((_c = settings.animationClass) !== null && _c !== void 0 ? _c : 'bga-animations_animated');
                        animation.settings = __assign(__assign({}, animation.settings), { duration: (_e = (_d = this.settings) === null || _d === void 0 ? void 0 : _d.duration) !== null && _e !== void 0 ? _e : 500, scale: (_g = (_f = this.zoomManager) === null || _f === void 0 ? void 0 : _f.zoom) !== null && _g !== void 0 ? _g : undefined });
                        _m = animation;
                        return [4 /*yield*/, animation.animationFunction(this, animation)];
                    case 1:
                        _m.result = _o.sent();
                        (_j = (_h = animation.settings).animationEnd) === null || _j === void 0 ? void 0 : _j.call(_h, animation);
                        (_k = settings.element) === null || _k === void 0 ? void 0 : _k.classList.remove((_l = settings.animationClass) !== null && _l !== void 0 ? _l : 'bga-animations_animated');
                        return [3 /*break*/, 3];
                    case 2: return [2 /*return*/, Promise.resolve(animation)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Plays multiple animations in parallel.
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playParallel = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.all(animations.map(function (animation) { return _this.play(animation); }))];
            });
        });
    };
    /**
     * Plays multiple animations in sequence (the second when the first ends, ...).
     *
     * @param animations the animations to play
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playSequence = function (animations) {
        return __awaiter(this, void 0, void 0, function () {
            var result, others;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!animations.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.play(animations[0])];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.playSequence(animations.slice(1))];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, __spreadArray([result], others, true)];
                    case 3: return [2 /*return*/, Promise.resolve([])];
                }
            });
        });
    };
    /**
     * Plays multiple animations with a delay between each animation start.
     *
     * @param animations the animations to play
     * @param delay the delay (in ms)
     * @returns a promise for all animations.
     */
    AnimationManager.prototype.playWithDelay = function (animations, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var promise;
            var _this = this;
            return __generator(this, function (_a) {
                promise = new Promise(function (success) {
                    var promises = [];
                    var _loop_1 = function (i) {
                        setTimeout(function () {
                            promises.push(_this.play(animations[i]));
                            if (i == animations.length - 1) {
                                Promise.all(promises).then(function (result) {
                                    success(result);
                                });
                            }
                        }, i * delay);
                    };
                    for (var i = 0; i < animations.length; i++) {
                        _loop_1(i);
                    }
                });
                return [2 /*return*/, promise];
            });
        });
    };
    /**
     * Attach an element to a parent, then play animation from element's origin to its new position.
     *
     * @param animation the animation function
     * @param attachElement the destination parent
     * @returns a promise when animation ends
     */
    AnimationManager.prototype.attachWithAnimation = function (animation, attachElement) {
        var attachWithAnimation = new BgaAttachWithAnimation({
            animation: animation,
            attachElement: attachElement
        });
        return this.play(attachWithAnimation);
    };
    return AnimationManager;
}());
function shouldAnimate(settings) {
    var _a;
    return document.visibilityState !== 'hidden' && !((_a = settings === null || settings === void 0 ? void 0 : settings.game) === null || _a === void 0 ? void 0 : _a.instantaneousMode);
}
/**
 * Return the x and y delta, based on the animation settings;
 *
 * @param settings an `AnimationSettings` object
 * @returns a promise when animation ends
 */
function getDeltaCoordinates(element, settings) {
    var _a;
    if (!settings.fromDelta && !settings.fromRect && !settings.fromElement) {
        throw new Error("[bga-animation] fromDelta, fromRect or fromElement need to be set");
    }
    var x = 0;
    var y = 0;
    if (settings.fromDelta) {
        x = settings.fromDelta.x;
        y = settings.fromDelta.y;
    }
    else {
        var originBR = (_a = settings.fromRect) !== null && _a !== void 0 ? _a : settings.fromElement.getBoundingClientRect();
        // TODO make it an option ?
        var originalTransform = element.style.transform;
        element.style.transform = '';
        var destinationBR = element.getBoundingClientRect();
        element.style.transform = originalTransform;
        x = (destinationBR.left + destinationBR.right) / 2 - (originBR.left + originBR.right) / 2;
        y = (destinationBR.top + destinationBR.bottom) / 2 - (originBR.top + originBR.bottom) / 2;
    }
    if (settings.scale) {
        x /= settings.scale;
        y /= settings.scale;
    }
    return { x: x, y: y };
}
function logAnimation(animationManager, animation) {
    var settings = animation.settings;
    var element = settings.element;
    if (element) {
        console.log(animation, settings, element, element.getBoundingClientRect(), element.style.transform);
    }
    else {
        console.log(animation, settings);
    }
    return Promise.resolve(false);
}
/**
 * The abstract stock. It shouldn't be used directly, use stocks that extends it.
 */
var CardStock = /** @class */ (function () {
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function CardStock(manager, element, settings) {
        this.manager = manager;
        this.element = element;
        this.settings = settings;
        this.cards = [];
        this.selectedCards = [];
        this.selectionMode = 'none';
        manager.addStock(this);
        element === null || element === void 0 ? void 0 : element.classList.add('card-stock' /*, this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase()* doesn't work in production because of minification */);
        this.bindClick();
        this.sort = settings === null || settings === void 0 ? void 0 : settings.sort;
    }
    /**
     * @returns the cards on the stock
     */
    CardStock.prototype.getCards = function () {
        return this.cards.slice();
    };
    /**
     * @returns if the stock is empty
     */
    CardStock.prototype.isEmpty = function () {
        return !this.cards.length;
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.getSelection = function () {
        return this.selectedCards.slice();
    };
    /**
     * @returns the selected cards
     */
    CardStock.prototype.isSelected = function (card) {
        var _this = this;
        return this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card
     * @returns if the card is present in the stock
     */
    CardStock.prototype.contains = function (card) {
        var _this = this;
        return this.cards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
    };
    /**
     * @param card a card in the stock
     * @returns the HTML element generated for the card
     */
    CardStock.prototype.getCardElement = function (card) {
        return this.manager.getCardElement(card);
    };
    /**
     * Checks if the card can be added. By default, only if it isn't already present in the stock.
     *
     * @param card the card to add
     * @param settings the addCard settings
     * @returns if the card can be added
     */
    CardStock.prototype.canAddCard = function (card, settings) {
        return !this.contains(card);
    };
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    CardStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b, _c;
        if (!this.canAddCard(card, settings)) {
            return Promise.resolve(false);
        }
        var promise;
        // we check if card is in a stock
        var originStock = this.manager.getCardStock(card);
        var index = this.getNewCardIndex(card);
        var settingsWithIndex = __assign({ index: index }, (settings !== null && settings !== void 0 ? settings : {}));
        var updateInformations = (_a = settingsWithIndex.updateInformations) !== null && _a !== void 0 ? _a : true;
        if (originStock === null || originStock === void 0 ? void 0 : originStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, __assign(__assign({}, animation), { fromStock: originStock }), settingsWithIndex);
            if (!updateInformations) {
                element.dataset.side = ((_b = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _b !== void 0 ? _b : this.manager.isCardVisible(card)) ? 'front' : 'back';
            }
        }
        else if ((animation === null || animation === void 0 ? void 0 : animation.fromStock) && animation.fromStock.contains(card)) {
            var element = this.getCardElement(card);
            promise = this.moveFromOtherStock(card, element, animation, settingsWithIndex);
        }
        else {
            var element = this.manager.createCardElement(card, ((_c = settingsWithIndex === null || settingsWithIndex === void 0 ? void 0 : settingsWithIndex.visible) !== null && _c !== void 0 ? _c : this.manager.isCardVisible(card)));
            promise = this.moveFromElement(card, element, animation, settingsWithIndex);
        }
        if (settingsWithIndex.index !== null && settingsWithIndex.index !== undefined) {
            this.cards.splice(index, 0, card);
        }
        else {
            this.cards.push(card);
        }
        if (updateInformations) { // after splice/push
            this.manager.updateCardInformations(card);
        }
        if (!promise) {
            console.warn("CardStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if (this.selectionMode !== 'none') {
            // make selectable only at the end of the animation
            promise.then(function () { var _a; return _this.setSelectableCard(card, (_a = settingsWithIndex.selectable) !== null && _a !== void 0 ? _a : true); });
        }
        return promise;
    };
    CardStock.prototype.getNewCardIndex = function (card) {
        if (this.sort) {
            var otherCards = this.getCards();
            for (var i = 0; i < otherCards.length; i++) {
                var otherCard = otherCards[i];
                if (this.sort(card, otherCard) < 0) {
                    return i;
                }
            }
            return otherCards.length;
        }
        else {
            return undefined;
        }
    };
    CardStock.prototype.addCardElementToParent = function (cardElement, settings) {
        var _a;
        var parent = (_a = settings === null || settings === void 0 ? void 0 : settings.forceToElement) !== null && _a !== void 0 ? _a : this.element;
        if ((settings === null || settings === void 0 ? void 0 : settings.index) === null || (settings === null || settings === void 0 ? void 0 : settings.index) === undefined || !parent.children.length || (settings === null || settings === void 0 ? void 0 : settings.index) >= parent.children.length) {
            parent.appendChild(cardElement);
        }
        else {
            parent.insertBefore(cardElement, parent.children[settings.index]);
        }
    };
    CardStock.prototype.moveFromOtherStock = function (card, cardElement, animation, settings) {
        var promise;
        var element = animation.fromStock.contains(card) ? this.manager.getCardElement(card) : animation.fromStock.element;
        var fromRect = element.getBoundingClientRect();
        this.addCardElementToParent(cardElement, settings);
        this.removeSelectionClassesFromElement(cardElement);
        promise = this.animationFromElement(cardElement, fromRect, {
            originalSide: animation.originalSide,
            rotationDelta: animation.rotationDelta,
            animation: animation.animation,
        });
        // in the case the card was move inside the same stock we don't remove it
        if (animation.fromStock && animation.fromStock != this) {
            animation.fromStock.removeCard(card);
        }
        if (!promise) {
            console.warn("CardStock.moveFromOtherStock didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    CardStock.prototype.moveFromElement = function (card, cardElement, animation, settings) {
        var promise;
        this.addCardElementToParent(cardElement, settings);
        if (animation) {
            if (animation.fromStock) {
                promise = this.animationFromElement(cardElement, animation.fromStock.element.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
                animation.fromStock.removeCard(card);
            }
            else if (animation.fromElement) {
                promise = this.animationFromElement(cardElement, animation.fromElement.getBoundingClientRect(), {
                    originalSide: animation.originalSide,
                    rotationDelta: animation.rotationDelta,
                    animation: animation.animation,
                });
            }
        }
        else {
            promise = Promise.resolve(false);
        }
        if (!promise) {
            console.warn("CardStock.moveFromElement didn't return a Promise");
            promise = Promise.resolve(false);
        }
        return promise;
    };
    /**
     * Add an array of cards to the stock.
     *
     * @param cards the cards to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @param shift if number, the number of milliseconds between each card. if true, chain animations
     */
    CardStock.prototype.addCards = function (cards, animation, settings, shift) {
        if (shift === void 0) { shift = false; }
        return __awaiter(this, void 0, void 0, function () {
            var promises, result, others, _loop_2, i, results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            shift = false;
                        }
                        promises = [];
                        if (!(shift === true)) return [3 /*break*/, 4];
                        if (!cards.length) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.addCard(cards[0], animation, settings)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, this.addCards(cards.slice(1), animation, settings, shift)];
                    case 2:
                        others = _a.sent();
                        return [2 /*return*/, result || others];
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        if (typeof shift === 'number') {
                            _loop_2 = function (i) {
                                setTimeout(function () { return promises.push(_this.addCard(cards[i], animation, settings)); }, i * shift);
                            };
                            for (i = 0; i < cards.length; i++) {
                                _loop_2(i);
                            }
                        }
                        else {
                            promises = cards.map(function (card) { return _this.addCard(card, animation, settings); });
                        }
                        _a.label = 5;
                    case 5: return [4 /*yield*/, Promise.all(promises)];
                    case 6:
                        results = _a.sent();
                        return [2 /*return*/, results.some(function (result) { return result; })];
                }
            });
        });
    };
    /**
     * Remove a card from the stock.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCard = function (card, settings) {
        if (this.contains(card) && this.element.contains(this.getCardElement(card))) {
            this.manager.removeCard(card, settings);
        }
        this.cardRemoved(card, settings);
    };
    /**
     * Notify the stock that a card is removed.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.cardRemoved = function (card, settings) {
        var _this = this;
        var index = this.cards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
        if (this.selectedCards.find(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); })) {
            this.unselectCard(card);
        }
    };
    /**
     * Remove a set of card from the stock.
     *
     * @param cards the cards to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeCards = function (cards, settings) {
        var _this = this;
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    /**
     * Remove all cards from the stock.
     * @param settings a `RemoveCardSettings` object
     */
    CardStock.prototype.removeAll = function (settings) {
        var _this = this;
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (card) { return _this.removeCard(card, settings); });
    };
    /**
     * Set if the stock is selectable, and if yes if it can be multiple.
     * If set to 'none', it will unselect all selected cards.
     *
     * @param selectionMode the selection mode
     * @param selectableCards the selectable cards (all if unset). Calls `setSelectableCards` method
     */
    CardStock.prototype.setSelectionMode = function (selectionMode, selectableCards) {
        var _this = this;
        if (selectionMode !== this.selectionMode) {
            this.unselectAll(true);
        }
        this.cards.forEach(function (card) { return _this.setSelectableCard(card, selectionMode != 'none'); });
        this.element.classList.toggle('bga-cards_selectable-stock', selectionMode != 'none');
        this.selectionMode = selectionMode;
        if (selectionMode === 'none') {
            this.getCards().forEach(function (card) { return _this.removeSelectionClasses(card); });
        }
        else {
            this.setSelectableCards(selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards());
        }
    };
    CardStock.prototype.setSelectableCard = function (card, selectable) {
        if (this.selectionMode === 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        if (selectableCardsClass) {
            element.classList.toggle(selectableCardsClass, selectable);
        }
        if (unselectableCardsClass) {
            element.classList.toggle(unselectableCardsClass, !selectable);
        }
        if (!selectable && this.isSelected(card)) {
            this.unselectCard(card, true);
        }
    };
    /**
     * Set the selectable class for each card.
     *
     * @param selectableCards the selectable cards. If unset, all cards are marked selectable. Default unset.
     */
    CardStock.prototype.setSelectableCards = function (selectableCards) {
        var _this = this;
        if (this.selectionMode === 'none') {
            return;
        }
        var selectableCardsIds = (selectableCards !== null && selectableCards !== void 0 ? selectableCards : this.getCards()).map(function (card) { return _this.manager.getId(card); });
        this.cards.forEach(function (card) {
            return _this.setSelectableCard(card, selectableCardsIds.includes(_this.manager.getId(card)));
        });
    };
    /**
     * Set selected state to a card.
     *
     * @param card the card to select
     */
    CardStock.prototype.selectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        var element = this.getCardElement(card);
        var selectableCardsClass = this.getSelectableCardClass();
        if (!element.classList.contains(selectableCardsClass)) {
            return;
        }
        if (this.selectionMode === 'single') {
            this.cards.filter(function (c) { return _this.manager.getId(c) != _this.manager.getId(card); }).forEach(function (c) { return _this.unselectCard(c, true); });
        }
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.add(selectedCardsClass);
        this.selectedCards.push(card);
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Set unselected state to a card.
     *
     * @param card the card to unselect
     */
    CardStock.prototype.unselectCard = function (card, silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var element = this.getCardElement(card);
        var selectedCardsClass = this.getSelectedCardClass();
        element.classList.remove(selectedCardsClass);
        var index = this.selectedCards.findIndex(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
        if (index !== -1) {
            this.selectedCards.splice(index, 1);
        }
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), card);
        }
    };
    /**
     * Select all cards
     */
    CardStock.prototype.selectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        if (this.selectionMode == 'none') {
            return;
        }
        this.cards.forEach(function (c) { return _this.selectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    /**
     * Unelect all cards
     */
    CardStock.prototype.unselectAll = function (silent) {
        var _this = this;
        var _a;
        if (silent === void 0) { silent = false; }
        var cards = this.getCards(); // use a copy of the array as we iterate and modify it at the same time
        cards.forEach(function (c) { return _this.unselectCard(c, true); });
        if (!silent) {
            (_a = this.onSelectionChange) === null || _a === void 0 ? void 0 : _a.call(this, this.selectedCards.slice(), null);
        }
    };
    CardStock.prototype.bindClick = function () {
        var _this = this;
        var _a;
        (_a = this.element) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function (event) {
            var cardDiv = event.target.closest('.card');
            if (!cardDiv) {
                return;
            }
            var card = _this.cards.find(function (c) { return _this.manager.getId(c) == cardDiv.id; });
            if (!card) {
                return;
            }
            _this.cardClick(card);
        });
    };
    CardStock.prototype.cardClick = function (card) {
        var _this = this;
        var _a;
        if (this.selectionMode != 'none') {
            var alreadySelected = this.selectedCards.some(function (c) { return _this.manager.getId(c) == _this.manager.getId(card); });
            if (alreadySelected) {
                this.unselectCard(card);
            }
            else {
                this.selectCard(card);
            }
        }
        (_a = this.onCardClick) === null || _a === void 0 ? void 0 : _a.call(this, card);
    };
    /**
     * @param element The element to animate. The element is added to the destination stock before the animation starts.
     * @param fromElement The HTMLElement to animate from.
     */
    CardStock.prototype.animationFromElement = function (element, fromRect, settings) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var side, cardSides_1, animation, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        side = element.dataset.side;
                        if (settings.originalSide && settings.originalSide != side) {
                            cardSides_1 = element.getElementsByClassName('card-sides')[0];
                            cardSides_1.style.transition = 'none';
                            element.dataset.side = settings.originalSide;
                            setTimeout(function () {
                                cardSides_1.style.transition = null;
                                element.dataset.side = side;
                            });
                        }
                        animation = settings.animation;
                        if (animation) {
                            animation.settings.element = element;
                            animation.settings.fromRect = fromRect;
                        }
                        else {
                            animation = new BgaSlideAnimation({ element: element, fromRect: fromRect });
                        }
                        return [4 /*yield*/, this.manager.animationManager.play(animation)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, (_a = result === null || result === void 0 ? void 0 : result.played) !== null && _a !== void 0 ? _a : false];
                }
            });
        });
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     */
    CardStock.prototype.setCardVisible = function (card, visible, settings) {
        this.manager.setCardVisible(card, visible, settings);
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     */
    CardStock.prototype.flipCard = function (card, settings) {
        this.manager.flipCard(card, settings);
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? this.manager.getSelectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Use class from manager is unset.
     */
    CardStock.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? this.manager.getUnselectableCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Use class from manager is unset.
     */
    CardStock.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? this.manager.getSelectedCardClass() : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    CardStock.prototype.removeSelectionClasses = function (card) {
        this.removeSelectionClassesFromElement(this.getCardElement(card));
    };
    CardStock.prototype.removeSelectionClassesFromElement = function (cardElement) {
        var selectableCardsClass = this.getSelectableCardClass();
        var unselectableCardsClass = this.getUnselectableCardClass();
        var selectedCardsClass = this.getSelectedCardClass();
        cardElement.classList.remove(selectableCardsClass, unselectableCardsClass, selectedCardsClass);
    };
    return CardStock;
}());
/**
 * A stock with manually placed cards
 */
var ManualPositionStock = /** @class */ (function (_super) {
    __extends(ManualPositionStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function ManualPositionStock(manager, element, settings, updateDisplay) {
        var _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        _this.updateDisplay = updateDisplay;
        element.classList.add('manual-position-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    ManualPositionStock.prototype.addCard = function (card, animation, settings) {
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        this.updateDisplay(this.element, this.getCards(), card, this);
        return promise;
    };
    ManualPositionStock.prototype.cardRemoved = function (card) {
        _super.prototype.cardRemoved.call(this, card);
        this.updateDisplay(this.element, this.getCards(), card, this);
    };
    return ManualPositionStock;
}(CardStock));
var AllVisibleDeck = /** @class */ (function (_super) {
    __extends(AllVisibleDeck, _super);
    function AllVisibleDeck(manager, element, settings) {
        var _this = this;
        var _a;
        _this = _super.call(this, manager, element, settings) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('all-visible-deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        element.style.setProperty('--shift', (_a = settings.shift) !== null && _a !== void 0 ? _a : '3px');
        return _this;
    }
    AllVisibleDeck.prototype.addCard = function (card, animation, settings) {
        var promise;
        var order = this.cards.length;
        promise = _super.prototype.addCard.call(this, card, animation, settings);
        var cardId = this.manager.getId(card);
        var cardDiv = document.getElementById(cardId);
        cardDiv.style.setProperty('--order', '' + order);
        this.element.style.setProperty('--tile-count', '' + this.cards.length);
        return promise;
    };
    /**
     * Set opened state. If true, all cards will be entirely visible.
     *
     * @param opened indicate if deck must be always opened. If false, will open only on hover/touch
     */
    AllVisibleDeck.prototype.setOpened = function (opened) {
        this.element.classList.toggle('opened', opened);
    };
    AllVisibleDeck.prototype.cardRemoved = function (card) {
        var _this = this;
        _super.prototype.cardRemoved.call(this, card);
        this.cards.forEach(function (c, index) {
            var cardId = _this.manager.getId(c);
            var cardDiv = document.getElementById(cardId);
            cardDiv.style.setProperty('--order', '' + index);
        });
        this.element.style.setProperty('--tile-count', '' + this.cards.length);
    };
    return AllVisibleDeck;
}(CardStock));
/**
 * A stock to make cards disappear (to automatically remove discarded cards, or to represent a bag)
 */
var VoidStock = /** @class */ (function (_super) {
    __extends(VoidStock, _super);
    /**
     * @param manager the card manager
     * @param element the stock element (should be an empty HTML Element)
     */
    function VoidStock(manager, element) {
        var _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('void-stock');
        return _this;
    }
    /**
     * Add a card to the stock.
     *
     * @param card the card to add
     * @param animation a `CardAnimation` object
     * @param settings a `AddCardToVoidStockSettings` object
     * @returns the promise when the animation is done (true if it was animated, false if it wasn't)
     */
    VoidStock.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a;
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        // center the element
        var cardElement = this.getCardElement(card);
        var originalLeft = cardElement.style.left;
        var originalTop = cardElement.style.top;
        cardElement.style.left = "".concat((this.element.clientWidth - cardElement.clientWidth) / 2, "px");
        cardElement.style.top = "".concat((this.element.clientHeight - cardElement.clientHeight) / 2, "px");
        if (!promise) {
            console.warn("VoidStock.addCard didn't return a Promise");
            promise = Promise.resolve(false);
        }
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.remove) !== null && _a !== void 0 ? _a : true) {
            return promise.then(function (result) {
                _this.removeCard(card);
                return result;
            });
        }
        else {
            cardElement.style.left = originalLeft;
            cardElement.style.top = originalTop;
            return promise;
        }
    };
    return VoidStock;
}(CardStock));
var SlideAndBackAnimation = /** @class */ (function (_super) {
    __extends(SlideAndBackAnimation, _super);
    function SlideAndBackAnimation(manager, element, tempElement) {
        var distance = (manager.getCardWidth() + manager.getCardHeight()) / 2;
        var angle = Math.random() * Math.PI * 2;
        var fromDelta = {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle),
        };
        return _super.call(this, {
            animations: [
                new BgaSlideToAnimation({ element: element, fromDelta: fromDelta, duration: 250 }),
                new BgaSlideAnimation({ element: element, fromDelta: fromDelta, duration: 250, animationEnd: tempElement ? (function () { return element.remove(); }) : undefined }),
            ]
        }) || this;
    }
    return SlideAndBackAnimation;
}(BgaCumulatedAnimation));
/**
 * Abstract stock to represent a deck. (pile of cards, with a fake 3d effect of thickness). *
 * Needs cardWidth and cardHeight to be set in the card manager.
 */
var Deck = /** @class */ (function (_super) {
    __extends(Deck, _super);
    function Deck(manager, element, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        _this = _super.call(this, manager, element) || this;
        _this.manager = manager;
        _this.element = element;
        element.classList.add('deck');
        var cardWidth = _this.manager.getCardWidth();
        var cardHeight = _this.manager.getCardHeight();
        if (cardWidth && cardHeight) {
            _this.element.style.setProperty('--width', "".concat(cardWidth, "px"));
            _this.element.style.setProperty('--height', "".concat(cardHeight, "px"));
        }
        else {
            throw new Error("You need to set cardWidth and cardHeight in the card manager to use Deck.");
        }
        _this.thicknesses = (_a = settings.thicknesses) !== null && _a !== void 0 ? _a : [0, 2, 5, 10, 20, 30];
        _this.setCardNumber((_b = settings.cardNumber) !== null && _b !== void 0 ? _b : 52);
        _this.autoUpdateCardNumber = (_c = settings.autoUpdateCardNumber) !== null && _c !== void 0 ? _c : true;
        _this.autoRemovePreviousCards = (_d = settings.autoRemovePreviousCards) !== null && _d !== void 0 ? _d : true;
        var shadowDirection = (_e = settings.shadowDirection) !== null && _e !== void 0 ? _e : 'bottom-right';
        var shadowDirectionSplit = shadowDirection.split('-');
        var xShadowShift = shadowDirectionSplit.includes('right') ? 1 : (shadowDirectionSplit.includes('left') ? -1 : 0);
        var yShadowShift = shadowDirectionSplit.includes('bottom') ? 1 : (shadowDirectionSplit.includes('top') ? -1 : 0);
        _this.element.style.setProperty('--xShadowShift', '' + xShadowShift);
        _this.element.style.setProperty('--yShadowShift', '' + yShadowShift);
        if (settings.topCard) {
            _this.addCard(settings.topCard, undefined);
        }
        else if (settings.cardNumber > 0) {
            console.warn("Deck is defined with ".concat(settings.cardNumber, " cards but no top card !"));
        }
        if (settings.counter && ((_f = settings.counter.show) !== null && _f !== void 0 ? _f : true)) {
            if (settings.cardNumber === null || settings.cardNumber === undefined) {
                throw new Error("You need to set cardNumber if you want to show the counter");
            }
            else {
                _this.createCounter((_g = settings.counter.position) !== null && _g !== void 0 ? _g : 'bottom', (_h = settings.counter.extraClasses) !== null && _h !== void 0 ? _h : 'round', settings.counter.counterId);
                if ((_j = settings.counter) === null || _j === void 0 ? void 0 : _j.hideWhenEmpty) {
                    _this.element.querySelector('.bga-cards_deck-counter').classList.add('hide-when-empty');
                }
            }
        }
        _this.setCardNumber((_k = settings.cardNumber) !== null && _k !== void 0 ? _k : 52);
        return _this;
    }
    Deck.prototype.createCounter = function (counterPosition, extraClasses, counterId) {
        var left = counterPosition.includes('right') ? 100 : (counterPosition.includes('left') ? 0 : 50);
        var top = counterPosition.includes('bottom') ? 100 : (counterPosition.includes('top') ? 0 : 50);
        this.element.style.setProperty('--bga-cards-deck-left', "".concat(left, "%"));
        this.element.style.setProperty('--bga-cards-deck-top', "".concat(top, "%"));
        this.element.insertAdjacentHTML('beforeend', "\n            <div ".concat(counterId ? "id=\"".concat(counterId, "\"") : '', " class=\"bga-cards_deck-counter ").concat(extraClasses, "\"></div>\n        "));
    };
    /**
     * Get the the cards number.
     *
     * @returns the cards number
     */
    Deck.prototype.getCardNumber = function () {
        return this.cardNumber;
    };
    /**
     * Set the the cards number.
     *
     * @param cardNumber the cards number
     */
    Deck.prototype.setCardNumber = function (cardNumber, topCard) {
        var _this = this;
        if (topCard === void 0) { topCard = null; }
        if (topCard) {
            this.addCard(topCard);
        }
        this.cardNumber = cardNumber;
        this.element.dataset.empty = (this.cardNumber == 0).toString();
        var thickness = 0;
        this.thicknesses.forEach(function (threshold, index) {
            if (_this.cardNumber >= threshold) {
                thickness = index;
            }
        });
        this.element.style.setProperty('--thickness', "".concat(thickness, "px"));
        var counterDiv = this.element.querySelector('.bga-cards_deck-counter');
        if (counterDiv) {
            counterDiv.innerHTML = "".concat(cardNumber);
        }
    };
    Deck.prototype.addCard = function (card, animation, settings) {
        var _this = this;
        var _a, _b;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber + 1);
        }
        var promise = _super.prototype.addCard.call(this, card, animation, settings);
        if ((_b = settings === null || settings === void 0 ? void 0 : settings.autoRemovePreviousCards) !== null && _b !== void 0 ? _b : this.autoRemovePreviousCards) {
            promise.then(function () {
                var previousCards = _this.getCards().slice(0, -1); // remove last cards
                _this.removeCards(previousCards, { autoUpdateCardNumber: false });
            });
        }
        return promise;
    };
    Deck.prototype.cardRemoved = function (card, settings) {
        var _a;
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.autoUpdateCardNumber) !== null && _a !== void 0 ? _a : this.autoUpdateCardNumber) {
            this.setCardNumber(this.cardNumber - 1);
        }
        _super.prototype.cardRemoved.call(this, card, settings);
    };
    Deck.prototype.getTopCard = function () {
        var cards = this.getCards();
        return cards.length ? cards[cards.length - 1] : null;
    };
    /**
     * Shows a shuffle animation on the deck
     *
     * @param animatedCardsMax number of animated cards for shuffle animation.
     * @param fakeCardSetter a function to generate a fake card for animation. Required if the card id is not based on a numerci `id` field, or if you want to set custom card back
     * @returns promise when animation ends
     */
    Deck.prototype.shuffle = function (animatedCardsMax, fakeCardSetter) {
        if (animatedCardsMax === void 0) { animatedCardsMax = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var animatedCards, elements, i, newCard, newElement;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.manager.animationsActive()) {
                            return [2 /*return*/, Promise.resolve(false)]; // we don't execute as it's just visual temporary stuff
                        }
                        animatedCards = Math.min(10, animatedCardsMax, this.getCardNumber());
                        if (!(animatedCards > 1)) return [3 /*break*/, 2];
                        elements = [this.getCardElement(this.getTopCard())];
                        for (i = elements.length; i <= animatedCards; i++) {
                            newCard = {};
                            if (fakeCardSetter) {
                                fakeCardSetter(newCard, i);
                            }
                            else {
                                newCard.id = -100000 + i;
                            }
                            newElement = this.manager.createCardElement(newCard, false);
                            newElement.dataset.tempCardForShuffleAnimation = 'true';
                            this.element.prepend(newElement);
                            elements.push(newElement);
                        }
                        return [4 /*yield*/, this.manager.animationManager.playWithDelay(elements.map(function (element) { return new SlideAndBackAnimation(_this.manager, element, element.dataset.tempCardForShuffleAnimation == 'true'); }), 50)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2: return [2 /*return*/, Promise.resolve(false)];
                }
            });
        });
    };
    return Deck;
}(CardStock));
var CardManager = /** @class */ (function () {
    /**
     * @param game the BGA game class, usually it will be `this`
     * @param settings: a `CardManagerSettings` object
     */
    function CardManager(game, settings) {
        var _a;
        this.game = game;
        this.settings = settings;
        this.stocks = [];
        this.updateFrontTimeoutId = [];
        this.updateBackTimeoutId = [];
        this.animationManager = (_a = settings.animationManager) !== null && _a !== void 0 ? _a : new AnimationManager(game);
    }
    /**
     * Returns if the animations are active. Animation aren't active when the window is not visible (`document.visibilityState === 'hidden'`), or `game.instantaneousMode` is true.
     *
     * @returns if the animations are active.
     */
    CardManager.prototype.animationsActive = function () {
        return this.animationManager.animationsActive();
    };
    CardManager.prototype.addStock = function (stock) {
        this.stocks.push(stock);
    };
    /**
     * @param card the card informations
     * @return the id for a card
     */
    CardManager.prototype.getId = function (card) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.settings).getId) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : "card-".concat(card.id);
    };
    CardManager.prototype.createCardElement = function (card, visible) {
        var _a, _b, _c, _d, _e, _f;
        if (visible === void 0) { visible = true; }
        var id = this.getId(card);
        var side = visible ? 'front' : 'back';
        if (this.getCardElement(card)) {
            throw new Error('This card already exists ' + JSON.stringify(card));
        }
        var element = document.createElement("div");
        element.id = id;
        element.dataset.side = '' + side;
        element.innerHTML = "\n            <div class=\"card-sides\">\n                <div id=\"".concat(id, "-front\" class=\"card-side front\">\n                </div>\n                <div id=\"").concat(id, "-back\" class=\"card-side back\">\n                </div>\n            </div>\n        ");
        element.classList.add('card');
        document.body.appendChild(element);
        (_b = (_a = this.settings).setupDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element);
        (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
        (_f = (_e = this.settings).setupBackDiv) === null || _f === void 0 ? void 0 : _f.call(_e, card, element.getElementsByClassName('back')[0]);
        document.body.removeChild(element);
        return element;
    };
    /**
     * @param card the card informations
     * @return the HTML element of an existing card
     */
    CardManager.prototype.getCardElement = function (card) {
        return document.getElementById(this.getId(card));
    };
    /**
     * Remove a card.
     *
     * @param card the card to remove
     * @param settings a `RemoveCardSettings` object
     */
    CardManager.prototype.removeCard = function (card, settings) {
        var _a;
        var id = this.getId(card);
        var div = document.getElementById(id);
        if (!div) {
            return false;
        }
        div.id = "deleted".concat(id);
        div.remove();
        // if the card is in a stock, notify the stock about removal
        (_a = this.getCardStock(card)) === null || _a === void 0 ? void 0 : _a.cardRemoved(card, settings);
        return true;
    };
    /**
     * Returns the stock containing the card.
     *
     * @param card the card informations
     * @return the stock containing the card
     */
    CardManager.prototype.getCardStock = function (card) {
        return this.stocks.find(function (stock) { return stock.contains(card); });
    };
    /**
     * Return if the card passed as parameter is suppose to be visible or not.
     * Use `isCardVisible` from settings if set, else will check if `card.type` is defined
     *
     * @param card the card informations
     * @return the visiblility of the card (true means front side should be displayed)
     */
    CardManager.prototype.isCardVisible = function (card) {
        var _a, _b, _c, _d;
        return (_c = (_b = (_a = this.settings).isCardVisible) === null || _b === void 0 ? void 0 : _b.call(_a, card)) !== null && _c !== void 0 ? _c : ((_d = card.type) !== null && _d !== void 0 ? _d : false);
    };
    /**
     * Set the card to its front (visible) or back (not visible) side.
     *
     * @param card the card informations
     * @param visible if the card is set to visible face. If unset, will use isCardVisible(card)
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.setCardVisible = function (card, visible, settings) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var element = this.getCardElement(card);
        if (!element) {
            return;
        }
        var isVisible = visible !== null && visible !== void 0 ? visible : this.isCardVisible(card);
        element.dataset.side = isVisible ? 'front' : 'back';
        var stringId = JSON.stringify(this.getId(card));
        if ((_a = settings === null || settings === void 0 ? void 0 : settings.updateFront) !== null && _a !== void 0 ? _a : true) {
            if (this.updateFrontTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateFrontTimeoutId[stringId]);
                delete this.updateFrontTimeoutId[stringId];
            }
            var updateFrontDelay = (_b = settings === null || settings === void 0 ? void 0 : settings.updateFrontDelay) !== null && _b !== void 0 ? _b : 500;
            if (!isVisible && updateFrontDelay > 0 && this.animationsActive()) {
                this.updateFrontTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupFrontDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('front')[0]); }, updateFrontDelay);
            }
            else {
                (_d = (_c = this.settings).setupFrontDiv) === null || _d === void 0 ? void 0 : _d.call(_c, card, element.getElementsByClassName('front')[0]);
            }
        }
        if ((_e = settings === null || settings === void 0 ? void 0 : settings.updateBack) !== null && _e !== void 0 ? _e : false) {
            if (this.updateBackTimeoutId[stringId]) { // make sure there is not a delayed animation that will overwrite the last flip request
                clearTimeout(this.updateBackTimeoutId[stringId]);
                delete this.updateBackTimeoutId[stringId];
            }
            var updateBackDelay = (_f = settings === null || settings === void 0 ? void 0 : settings.updateBackDelay) !== null && _f !== void 0 ? _f : 0;
            if (isVisible && updateBackDelay > 0 && this.animationsActive()) {
                this.updateBackTimeoutId[stringId] = setTimeout(function () { var _a, _b; return (_b = (_a = _this.settings).setupBackDiv) === null || _b === void 0 ? void 0 : _b.call(_a, card, element.getElementsByClassName('back')[0]); }, updateBackDelay);
            }
            else {
                (_h = (_g = this.settings).setupBackDiv) === null || _h === void 0 ? void 0 : _h.call(_g, card, element.getElementsByClassName('back')[0]);
            }
        }
        if ((_j = settings === null || settings === void 0 ? void 0 : settings.updateData) !== null && _j !== void 0 ? _j : true) {
            // card data has changed
            var stock = this.getCardStock(card);
            var cards = stock.getCards();
            var cardIndex = cards.findIndex(function (c) { return _this.getId(c) === _this.getId(card); });
            if (cardIndex !== -1) {
                stock.cards.splice(cardIndex, 1, card);
            }
        }
    };
    /**
     * Flips the card.
     *
     * @param card the card informations
     * @param settings the flip params (to update the card in current stock)
     */
    CardManager.prototype.flipCard = function (card, settings) {
        var element = this.getCardElement(card);
        var currentlyVisible = element.dataset.side === 'front';
        this.setCardVisible(card, !currentlyVisible, settings);
    };
    /**
     * Update the card informations. Used when a card with just an id (back shown) should be revealed, with all data needed to populate the front.
     *
     * @param card the card informations
     */
    CardManager.prototype.updateCardInformations = function (card, settings) {
        var newSettings = __assign(__assign({}, (settings !== null && settings !== void 0 ? settings : {})), { updateData: true });
        this.setCardVisible(card, undefined, newSettings);
    };
    /**
     * @returns the card with set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardWidth = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardWidth;
    };
    /**
     * @returns the card height set in the settings (undefined if unset)
     */
    CardManager.prototype.getCardHeight = function () {
        var _a;
        return (_a = this.settings) === null || _a === void 0 ? void 0 : _a.cardHeight;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_selectable-card'.
     */
    CardManager.prototype.getSelectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectableCardClass) === undefined ? 'bga-cards_selectable-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectableCardClass;
    };
    /**
     * @returns the class to apply to selectable cards. Default 'bga-cards_disabled-card'.
     */
    CardManager.prototype.getUnselectableCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.unselectableCardClass) === undefined ? 'bga-cards_disabled-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.unselectableCardClass;
    };
    /**
     * @returns the class to apply to selected cards. Default 'bga-cards_selected-card'.
     */
    CardManager.prototype.getSelectedCardClass = function () {
        var _a, _b;
        return ((_a = this.settings) === null || _a === void 0 ? void 0 : _a.selectedCardClass) === undefined ? 'bga-cards_selected-card' : (_b = this.settings) === null || _b === void 0 ? void 0 : _b.selectedCardClass;
    };
    return CardManager;
}());
function sortFunction() {
    var sortedFields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sortedFields[_i] = arguments[_i];
    }
    return function (a, b) {
        for (var i = 0; i < sortedFields.length; i++) {
            var direction = 1;
            var field = sortedFields[i];
            if (field[0] == '-') {
                direction = -1;
                field = field.substring(1);
            }
            else if (field[0] == '+') {
                field = field.substring(1);
            }
            var type = typeof a[field];
            if (type === 'string') {
                var compare = a[field].localeCompare(b[field]);
                if (compare !== 0) {
                    return compare;
                }
            }
            else if (type === 'number') {
                var compare = (a[field] - b[field]) * direction;
                if (compare !== 0) {
                    return compare * direction;
                }
            }
        }
        return 0;
    };
}
var determineBoardWidth = function (game) {
    return 740;
};
var determineMaxZoomLevel = function (game) {
    var bodycoords = dojo.marginBox("zoom-overall");
    var contentWidth = bodycoords.w;
    var rowWidth = determineBoardWidth(game);
    return contentWidth / rowWidth;
};
var getZoomLevels = function (maxZoomLevel) {
    var zoomLevels = [];
    var increments = 0.05;
    if (maxZoomLevel > 1) {
        var maxZoomLevelsAbove1 = maxZoomLevel - 1;
        increments = (maxZoomLevelsAbove1 / 9);
        zoomLevels = [];
        for (var i = 1; i <= 9; i++) {
            zoomLevels.push((increments * i) + 1);
        }
    }
    for (var i = 1; i <= 9; i++) {
        zoomLevels.push(1 - (increments * i));
    }
    zoomLevels = __spreadArray(__spreadArray([], zoomLevels, true), [1, maxZoomLevel], false);
    zoomLevels = zoomLevels.sort();
    zoomLevels = zoomLevels.filter(function (zoomLevel) { return (zoomLevel <= maxZoomLevel) && (zoomLevel > 0.3); });
    return zoomLevels;
};
var AutoZoomManager = /** @class */ (function (_super) {
    __extends(AutoZoomManager, _super);
    function AutoZoomManager(game, elementId, localStorageKey) {
        var storedZoomLevel = localStorage.getItem(localStorageKey);
        var maxZoomLevel = determineMaxZoomLevel(game);
        if (storedZoomLevel && Number(storedZoomLevel) > maxZoomLevel) {
            localStorage.removeItem(localStorageKey);
        }
        var zoomLevels = getZoomLevels(determineMaxZoomLevel(game));
        console.log(zoomLevels);
        console.log(maxZoomLevel < 1 ? maxZoomLevel : 1);
        return _super.call(this, {
            element: document.getElementById(elementId),
            smooth: false,
            zoomLevels: zoomLevels,
            defaultZoom: maxZoomLevel < 1 ? maxZoomLevel : 1,
            zoomControls: {
                color: 'black',
                position: 'top-right',
            },
            onDimensionsChange: function () {
                game.cardsManager.updateLineFitPositionStocks();
            }
        }) || this;
    }
    return AutoZoomManager;
}(ZoomManager));
/**
 * Similar to LineStock except this stock uses the available space to lay out the elements and overlap them if there is not enough space guaranteeing a single line of elements.
 */
var LineFitPositionStock = /** @class */ (function (_super) {
    __extends(LineFitPositionStock, _super);
    function LineFitPositionStock(manager, element, settings) {
        var _this = _super.call(this, manager, element, settings, function (element, cards, lastCard, stock) { return _this.adjustDisplay(element, cards, stock); }) || this;
        return _this;
    }
    LineFitPositionStock.prototype.adjust = function () {
        this.adjustDisplay(this.element, this.cards, this);
    };
    LineFitPositionStock.prototype.cardRemoved = function (card) {
        var cardDiv = this.getCardElement(card);
        cardDiv.style.left = null;
        cardDiv.classList.remove('to-discard');
        _super.prototype.cardRemoved.call(this, card);
    };
    LineFitPositionStock.prototype.adjustDisplay = function (element, cards, stock) {
        var margin = 8;
        var totalCardWidth = cards.length * this.manager.getCardWidth();
        var totalMarginWidth = (cards.length - 1) * margin;
        var totalWidth = totalCardWidth + totalMarginWidth;
        var leftOffset = 0;
        var leftForSingleCard = this.manager.getCardWidth() + margin;
        if (totalWidth > element.clientWidth) {
            // The totalWidth required is larger than the available with we need to calculate overlap
            leftForSingleCard = (element.clientWidth - this.manager.getCardWidth() - margin) / (cards.length - 1);
        }
        else {
            leftOffset = ((element.clientWidth - totalWidth) / 2) - 10;
        }
        cards.forEach(function (card, index) {
            var cardDiv = stock.getCardElement(card);
            var cardLeft = (leftForSingleCard * index) + leftOffset;
            cardDiv.style.left = "".concat(cardLeft, "px");
        });
    };
    return LineFitPositionStock;
}(ManualPositionStock));
var cardWidth = 165;
var cardHeight = 257;
var CardsManager = /** @class */ (function (_super) {
    __extends(CardsManager, _super);
    function CardsManager(quibblesGame) {
        var _this = _super.call(this, quibblesGame, {
            getId: function (card) { return "quibbles-card-".concat(card.id); },
            setupDiv: function (card, div) {
                div.classList.add('quibbles-card');
                div.dataset.id = '' + card.id;
            },
            setupFrontDiv: function (card, div) {
                div.id = "".concat(_this.getId(card), "-front");
                div.dataset.number = '' + card.type;
                div.dataset.variation = '' + card.type_arg;
            },
            isCardVisible: function (card) { return !!card.type; },
            cardWidth: cardWidth,
            cardHeight: cardHeight,
        }) || this;
        _this.quibblesGame = quibblesGame;
        _this.playerStocks = [];
        _this.playerCollections = [];
        _this.selectedSets = null;
        return _this;
    }
    CardsManager.prototype.setUp = function (gameData) {
        this.display = new LineFitPositionStock(this, $('card-display'), { sort: sortFunction('type') });
        this.deck = new Deck(this, $('card-deck'), {
            autoUpdateCardNumber: false,
            counter: { show: true, position: "center", extraClasses: "quibbles-counter" },
            cardNumber: gameData.deckCount,
            topCard: gameData.deckCount > 0 ? { id: -1 } : undefined, // this is just a card as this will never change
        });
        this.discard = new Deck(this, $('card-discard'), {
            autoUpdateCardNumber: true,
            counter: { show: true, position: "center", extraClasses: "quibbles-counter" },
            cardNumber: 0,
        });
        this.discard.addCards(gameData.discard);
        this.display.addCards(gameData.display);
        for (var playersKey in gameData.players) {
            var playerId = Number(playersKey);
            if (this.quibblesGame.getPlayerId() === playerId &&
                this.quibblesGame.getPlayer(playerId).self) {
                this.playerHand = new LineFitPositionStock(this, $('player-hand'), { sort: sortFunction('type') });
                this.playerHand.addCards(gameData.players[playersKey].hand);
            }
            else {
                this.playerStocks[playerId] = new VoidStock(this, $("playerhand-stock-".concat(playerId)));
            }
            this.playerCollections[playerId] = new LineFitPositionStock(this, $("player-collection-".concat(playerId)), { sort: sortFunction('type') });
            this.playerCollections[playerId].addCards(gameData.players[playersKey].collection);
        }
    };
    CardsManager.prototype.setHandCardsSelectable = function (selectionMode, maxTotalValue) {
        var _this = this;
        var _a;
        (_a = this.playerHand) === null || _a === void 0 ? void 0 : _a.setSelectionMode(selectionMode);
        if (selectionMode != 'none') {
            if (maxTotalValue) {
                this.playerHand.onSelectionChange = (function (selection) {
                    var selectedValue = selection.map(function (card) { return Number(card.type); }).reduce(function (sum, current) { return sum + current; }, 0);
                    var remainingValue = maxTotalValue - selectedValue;
                    var selectableCards = _this.playerHand.getCards()
                        .filter(function (card) { return selection.includes(card) || Number(card.type) <= remainingValue; });
                    _this.playerHand.setSelectableCards(selectableCards);
                    _this.unsetDisplayDisabledCards();
                    _this.setAllOtherDisplayCardsToDisabled(_this.determineSelectableCardsForTake(selection.length > 1, selection.map(function (card) { return Number(card.type); }).reduce(function (sum, current) { return sum + current; }, 0)));
                });
            }
            else {
                this.playerHand.onSelectionChange = undefined;
            }
        }
    };
    CardsManager.prototype.setDisplayCardsSelectableSets = function (selectionMode, totalDiscardValue) {
        var _this = this;
        this.selectedSets = [];
        this.display.setSelectionMode(selectionMode);
        if (selectionMode != 'none') {
            this.display.setSelectableCards(this.determineSelectableCardsForTake(false, totalDiscardValue));
            this.display.onSelectionChange = (function (selection) {
                var selectedValue = selection.map(function (card) { return Number(card.type); }).reduce(function (sum, current) { return sum + current; }, 0);
                var remainingValue = totalDiscardValue - selectedValue;
                if (remainingValue === 0) {
                    _this.selectedSets.push(selection.map(function (card) { return card.id; }));
                    _this.playerHand.addCards(selection);
                    _this.display.setSelectableCards(_this.determineSelectableCardsForTake(false, totalDiscardValue));
                }
                else {
                    var selectableCards = _this.display.getCards()
                        .filter(function (card) { return selection.includes(card) || (Number(card.type) <= remainingValue && Number(card.type) < totalDiscardValue); });
                    _this.display.setSelectableCards(selectableCards);
                }
            });
        }
    };
    CardsManager.prototype.determineSelectableCardsForTake = function (isSingleTake, totalDiscardValue) {
        if (isSingleTake) {
            return this.display.getCards().filter(function (card) { return Number(card.type) === totalDiscardValue; });
        }
        else {
            var listOfNumbers = this.display.getCards().map(function (card) { return Number(card.type); }).sort(function (a, b) { return a - b; });
            var result_1 = [];
            this.unique_combination(0, 0, totalDiscardValue, [], listOfNumbers, result_1);
            return this.display.getCards().filter(function (card) { return result_1.includes(Number(card.type)); });
        }
    };
    CardsManager.prototype.setDisplayCardsSelectableSingle = function (selectionMode, totalDiscardValue) {
        var _this = this;
        this.selectedSets = [];
        this.display.setSelectionMode(selectionMode);
        if (selectionMode != 'none') {
            this.display.setSelectableCards(this.determineSelectableCardsForTake(true, totalDiscardValue));
            this.display.onSelectionChange = (function (selection) {
                if (selection.length == 1) {
                    _this.selectedSets.push(selection.map(function (card) { return card.id; }));
                    _this.playerHand.addCards(selection);
                }
            });
        }
    };
    CardsManager.prototype.setCollectionCardsSelectableForDiscard = function (selectionMode, playerId) {
        var _this = this;
        this.playerCollections[playerId].setSelectionMode(selectionMode);
        this.playerCollections[playerId].onSelectionChange = undefined;
        this.unsetCardsToDiscard(this.playerCollections[playerId].getCards());
        if (selectionMode != 'none') {
            this.playerCollections[playerId].onSelectionChange = (function (selection) {
                _this.unsetCardsToDiscard(_this.playerCollections[playerId].getCards());
                if (selection.length == 1) {
                    _this.setCardsToDiscard(selection);
                }
            });
        }
    };
    CardsManager.prototype.getSelectedCollectionCards = function (playerId) {
        return this.playerCollections[playerId].getSelection();
    };
    CardsManager.prototype.getSelectedPlayerHandCards = function () {
        return this.playerHand.getSelection();
    };
    CardsManager.prototype.discardCards = function (cards) {
        this.discard.addCards(cards, {}, { visible: true, updateInformations: true });
    };
    CardsManager.prototype.discardCardsFromPlayer = function (cards, playerId) {
        this.discard.addCards(cards, { fromStock: this.quibblesGame.getPlayer(playerId).self ? this.playerHand : this.playerStocks[playerId] }, { visible: true, updateInformations: true });
    };
    CardsManager.prototype.addCardsToDisplayFromDeck = function (cards) {
        this.display.addCards(cards, { fromStock: this.deck });
    };
    CardsManager.prototype.addCardsToDisplay = function (cards, playerId) {
        this.display.addCards(cards, { fromStock: this.quibblesGame.getPlayer(playerId).self ? this.playerHand : this.playerStocks[playerId] });
    };
    CardsManager.prototype.addCardsToPlayerHandFromDeck = function (playerId, cards) {
        this.addCardsToPlayerHand(playerId, cards, { fromStock: this.deck });
    };
    CardsManager.prototype.addCardsToPlayerHand = function (playerId, cards, animation) {
        if (animation === void 0) { animation = {}; }
        if (this.quibblesGame.getPlayerId() === playerId &&
            this.quibblesGame.getPlayer(playerId).self) {
            this.playerHand.addCards(cards, animation);
        }
        else {
            this.playerStocks[playerId].addCards(cards, animation);
        }
    };
    CardsManager.prototype.setCardsToDiscard = function (cards) {
        var _this = this;
        cards.map(function (card) { return _this.getCardElement(card); })
            .forEach(function (card) { return card.classList.add('to-discard'); });
    };
    CardsManager.prototype.unsetCardsToDiscard = function (cards) {
        var _this = this;
        cards.map(function (card) { return _this.getCardElement(card); })
            .forEach(function (card) { return card.classList.remove('to-discard'); });
    };
    CardsManager.prototype.setAllOtherDisplayCardsToDisabled = function (cards) {
        var _this = this;
        this.display.getCards()
            .filter(function (card) { return !cards.includes(card); })
            .map(function (card) { return _this.getCardElement(card); })
            .forEach(function (card) { return card.classList.add('disabled'); });
    };
    CardsManager.prototype.unsetDisplayDisabledCards = function () {
        var _this = this;
        this.display.getCards()
            .map(function (card) { return _this.getCardElement(card); })
            .forEach(function (card) { return card.classList.remove('disabled'); });
    };
    CardsManager.prototype.unsetCardsToDiscardPlayerHand = function () {
        this.unsetCardsToDiscard(this.playerHand.getCards());
    };
    CardsManager.prototype.addCardToCollection = function (cardCollected, playerId) {
        this.playerCollections[playerId].addCard(cardCollected, { fromStock: this.quibblesGame.getPlayer(playerId).self ? this.playerHand : this.playerStocks[playerId] });
    };
    CardsManager.prototype.updateLineFitPositionStocks = function () {
        var lineFitPositionStocks = __spreadArray([this.display, this.playerHand], Object.values(this.playerCollections), true);
        lineFitPositionStocks.forEach(function (stock) { return stock === null || stock === void 0 ? void 0 : stock.adjust(); });
    };
    CardsManager.prototype.setDeckCount = function (deckCount) {
        this.deck.setCardNumber(deckCount);
    };
    CardsManager.prototype.getCardsInCollection = function (playerId) {
        return this.playerCollections[playerId].getCards();
    };
    CardsManager.prototype.deckReshuffled = function (deckCount) {
        this.discard.removeAll();
        this.discard.setCardNumber(0);
        this.deck.setCardNumber(deckCount, { id: -1 });
        this.deck.shuffle();
    };
    CardsManager.prototype.unique_combination = function (l, sum, K, local, A, result) {
        // If a unique combination is found
        if (sum == K && local.length > 1) {
            var newResult = __spreadArray(__spreadArray([], result, true), local, true);
            result.pop();
            result.push.apply(result, newResult);
            return;
        }
        // For all other combinations
        for (var i = l; i < A.length; i++) {
            // Check if the sum exceeds K
            if (sum + A[i] > K)
                continue;
            // Check if it is repeated or not
            if (i > l && A[i] == A[i - 1])
                continue;
            // Take the element into the combination
            local.push(A[i]);
            // Recursive call
            this.unique_combination(i + 1, sum + A[i], K, local, A, result);
            // Remove element from the combination
            local.pop();
        }
    };
    return CardsManager;
}(CardManager));
var PlayerManager = /** @class */ (function () {
    function PlayerManager(game) {
        this.game = game;
        this.handCounters = [];
    }
    PlayerManager.prototype.setUp = function (gameData) {
        var playerAreas = [];
        for (var playerId in gameData.players) {
            var player = gameData.players[playerId];
            this.createPlayerPanels(player);
            var playerArea = this.createPlayerArea(player);
            if (player.self) {
                playerAreas.unshift(playerArea);
            }
            else {
                playerAreas.push(playerArea);
            }
        }
        playerAreas.forEach(function (playerArea) { return dojo.place(playerArea, "quibbles-ui-row-4"); });
        this.game.setTooltipToClass('playerhand-counter', _('Number of cards in hand'));
    };
    PlayerManager.prototype.setHandCounter = function (playerId, handCount) {
        this.handCounters[playerId].toValue(handCount);
    };
    PlayerManager.prototype.createPlayerArea = function (player) {
        return "<div id=\"player-area-".concat(player.id, "\" class=\"player-area whiteblock\">\n                    <div class=\"quibbles-title-wrapper\">\n                        <h2 class=\"quibbles-title\" style=\"background-color: #").concat(player.color, ";\">").concat(player.name).concat(_("'s Collection"), "</h2>\n                    </div>\n                    <div id=\"player-collection-").concat(player.id, "\" class=\"player-collection\"></div>\n                </div>");
    };
    PlayerManager.prototype.createPlayerPanels = function (player) {
        var playerId = Number(player.id);
        var html = "<div class=\"counters\">\n                <div id=\"playerhand-counter-wrapper-".concat(player.id, "\" class=\"playerhand-counter\">\n                    <div class=\"player-hand-card\"></div> \n                    <span id=\"playerhand-counter-").concat(player.id, "\"></span>\n                    <div id=\"playerhand-stock-").concat(player.id, "\"></div>\n                </div>\n            </div><div class=\"counters\">");
        dojo.place(html, "player_board_".concat(player.id));
        var handCounter = new ebg.counter();
        handCounter.create("playerhand-counter-".concat(player.id));
        handCounter.setValue(player.handCount);
        this.handCounters[playerId] = handCounter;
    };
    return PlayerManager;
}());
var ANIMATION_MS = 500;
var TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
var LOCAL_STORAGE_ZOOM_KEY = 'Quibbles-zoom';
var Quibbles = /** @class */ (function () {
    function Quibbles() {
        this.passInterval = undefined;
        // @ts-ignore
        this.default_viewport = 'width=740';
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
        this.cardsManager = new CardsManager(this);
        this.playerManager = new PlayerManager(this);
        this.zoomManager = new AutoZoomManager(this, 'quibbles-table', LOCAL_STORAGE_ZOOM_KEY);
        log('gamedatas', gamedatas);
        this.gamedatas = gamedatas;
        this.playerManager.setUp(gamedatas);
        this.cardsManager.setUp(gamedatas);
        this.setupNotifications();
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
            case 'playerTurnTake':
                this.onEnteringPlayerTurnTake();
                break;
            case 'playerTurnTakeConfirm':
                this.onEnteringPlayerTurnTakeConfirm(args.args);
                break;
            case 'playerTurnAddCollection':
                this.onEnteringPlayerTurnAddCollection(args.args);
                break;
            case 'playerTurnPass':
                this.onEnteringPlayerTurnPass();
                break;
            case 'discardCollectionCard':
                this.onEnteringDiscardCollectionCard();
                break;
        }
    };
    Quibbles.prototype.onEnteringPlayerTurnTake = function () {
        if (this.isCurrentPlayerActive()) {
            var maxTotalValue = 6;
            this.cardsManager.setHandCardsSelectable('multiple', maxTotalValue);
        }
    };
    Quibbles.prototype.onEnteringPlayerTurnTakeConfirm = function (args) {
        if (this.isCurrentPlayerActive()) {
            this.cardsManager.setCardsToDiscard(args.cardsToDiscard);
            if (args.cardsToDiscard.length === 1) {
                this.gamedatas.gamestate.descriptionmyturn = _(this.gamedatas.gamestate.descriptionmyturn) + '<br />' + _('Select sets of cards to take that total:') + '&nbsp;' + args.totalDiscardValue + '<br />';
                this.updatePageTitle();
                this.cardsManager.setDisplayCardsSelectableSets('multiple', args.totalDiscardValue);
            }
            else {
                this.gamedatas.gamestate.descriptionmyturn = _(this.gamedatas.gamestate.descriptionmyturn) + '<br />' + _('Select cards to take with value:') + '&nbsp;' + args.totalDiscardValue + '<br />';
                this.updatePageTitle();
                this.cardsManager.setDisplayCardsSelectableSingle('single', args.totalDiscardValue);
            }
        }
    };
    Quibbles.prototype.onEnteringPlayerTurnAddCollection = function (args) {
        if (this.isCurrentPlayerActive()) {
            var canAddToCollection = this.findCollectionAddCards(args.playerHandTypeCount);
            if (canAddToCollection.length === 0) {
                this.gamedatas.gamestate.descriptionmyturn = _("You can't add a card to your collection");
            }
            this.gamedatas.gamestate.descriptionmyturn = _(this.gamedatas.gamestate.descriptionmyturn) + '<br />';
            this.updatePageTitle();
        }
    };
    Quibbles.prototype.onEnteringPlayerTurnPass = function () {
        if (this.isCurrentPlayerActive()) {
            this.cardsManager.setHandCardsSelectable('single');
        }
    };
    Quibbles.prototype.onEnteringDiscardCollectionCard = function () {
        if (this.isCurrentPlayerActive()) {
            this.cardsManager.setCollectionCardsSelectableForDiscard('single', this.getPlayerId());
        }
    };
    Quibbles.prototype.onLeavingState = function (stateName) {
        log('Leaving state: ' + stateName);
        switch (stateName) {
            case 'playerTurnTake':
                this.onLeavingPlayerTurnTake();
                break;
            case 'playerTurnTakeConfirm':
                this.onLeavingPlayerTurnTakeConfirm();
                break;
            case 'playerTurnPass':
                this.onLeavingPlayerTurnPass();
                break;
            case 'discardCollectionCard':
                this.onLeavingDiscardCollectionCard();
                break;
        }
    };
    Quibbles.prototype.onLeavingPlayerTurnTake = function () {
        if (this.isCurrentPlayerActive()) {
            this.cardsManager.unsetDisplayDisabledCards();
            this.cardsManager.setHandCardsSelectable('none');
        }
    };
    Quibbles.prototype.onLeavingPlayerTurnTakeConfirm = function () {
        if (this.isCurrentPlayerActive()) {
            this.cardsManager.unsetCardsToDiscardPlayerHand();
            this.cardsManager.setDisplayCardsSelectableSets('none');
        }
    };
    Quibbles.prototype.onLeavingPlayerTurnPass = function () {
        if (this.isCurrentPlayerActive()) {
            this.cardsManager.setHandCardsSelectable('none');
        }
    };
    Quibbles.prototype.onLeavingDiscardCollectionCard = function () {
        if (this.isCurrentPlayerActive()) {
            this.cardsManager.setCollectionCardsSelectableForDiscard('none', this.getPlayerId());
        }
    };
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    Quibbles.prototype.onUpdateActionButtons = function (stateName, args) {
        var _this = this;
        console.log('onUpdateActionButtons: ' + stateName);
        if (this.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'playerTurn':
                    this.addActionButton('playerTurnTake', _("TAKE"), function () { return _this.chooseAction("take"); });
                    this.addActionButton('playerTurnPass', _("PASS"), function () { return _this.chooseAction("pass"); });
                    break;
                case 'playerTurnTake':
                    this.addActionButton('takeConfirmDiscard', _("Confirm Discard"), function () { return _this.takeConfirmDiscard(); });
                    break;
                case 'playerTurnTakeConfirm':
                    this.addActionButton('takeConfirm', _("Confirm Take"), function () { return _this.takeConfirm(); });
                    break;
                case 'playerTurnAddCollection':
                    var cardsThatCanBeAdded = this.findCollectionAddCards(args.playerHandTypeCount);
                    if (cardsThatCanBeAdded.length > 0) {
                        cardsThatCanBeAdded.forEach(function (cardThatCanBeAdded) { return _this.addActionButton("addCardToCollection".concat(cardThatCanBeAdded.card_type), _("Add") + " ".concat(_this.getTypeIcon(cardThatCanBeAdded.card_type)), function () { return _this.addCardToCollection(Number(cardThatCanBeAdded.card_type)); }); });
                    }
                    this.addActionButton('endTurn', _("End Turn"), function () { return _this.endTurn(); });
                    if (cardsThatCanBeAdded.length === 0) {
                        this.addTimerButton($('endTurn'), 5);
                    }
                    break;
                case 'playerTurnPass':
                    this.addActionButton('passConfirm', _("Confirm Card"), function () { return _this.passConfirm(); });
                    break;
                case 'discardCollectionCard':
                    this.addActionButton('confirmDiscard', _("Confirm Discard"), function () { return _this.confirmCollectionCardDiscard(args.type); });
                    this.addActionButton('cancelDiscard', _("Cancel"), function () { return _this.restoreServerGameState(); }, null, null, 'gray');
                    break;
            }
            if (['playerTurnTake', 'playerTurnTakeConfirm', 'playerTurnPass'].includes(stateName) && args.canCancelMoves) {
                this.addActionButton('undoLastMoves', _("Undo last moves"), function () { return _this.undoLastMoves(); }, null, null, 'gray');
            }
        }
    };
    Quibbles.prototype.addTimerButton = function (button, duration) {
        // Reduce the seconds every second, and if we reach 0 click the button
        var txtButton = button.textContent;
        button.textContent = txtButton + ' (' + duration + ')';
        // Reduce the seconds every second, and if we reach 0 click the button
        clearInterval(this.passInterval);
        this.passInterval = setInterval(function () {
            if (dojo.query(button).length == 0) {
                clearInterval(this.passInterval);
            }
            else {
                duration -= 1;
                if (duration == -1) {
                    clearInterval(this.passInterval);
                    button.click();
                }
                else {
                    button.textContent = txtButton + ' (' + duration + ')';
                }
            }
        }.bind(this), 1000);
    };
    Quibbles.prototype.undoLastMoves = function () {
        this.takeAction('undoLastMoves');
    };
    Quibbles.prototype.chooseAction = function (chosenAction) {
        this.takeAction("chooseAction", { chosenAction: chosenAction });
    };
    Quibbles.prototype.takeConfirmDiscard = function () {
        var selectedPlayerHandCards = this.cardsManager.getSelectedPlayerHandCards();
        var selectableCardsForTake = this.cardsManager.determineSelectableCardsForTake(selectedPlayerHandCards.length > 1, selectedPlayerHandCards.map(function (card) { return Number(card.type); }).reduce(function (sum, current) { return sum + current; }, 0));
        if (selectableCardsForTake.length > 0) {
            var cardIds = selectedPlayerHandCards.map(function (card) { return card.id; });
            this.takeAction("takeConfirmDiscard", { cardIds: JSON.stringify(cardIds) });
        }
        else {
            this.showMessage(_("You can't take cards with this selection of hand cards"), 'error');
        }
    };
    Quibbles.prototype.takeConfirm = function () {
        var _this = this;
        var selectedSets = this.cardsManager.selectedSets;
        this.wrapInConfirm(function () { return _this.takeAction("takeConfirm", { selectedSets: JSON.stringify(selectedSets) }); }, _('You can take as many cards as you can from the display. This action can not be undone.'));
    };
    Quibbles.prototype.endTurn = function () {
        if (this.passInterval) {
            clearInterval(this.passInterval);
            this.passInterval = undefined;
        }
        this.takeAction("endTurn");
    };
    Quibbles.prototype.addCardToCollection = function (type) {
        var cardsInCollection = this.cardsManager.getCardsInCollection(this.getPlayerId());
        if (cardsInCollection.length == 6) {
            this.setClientState("discardCollectionCard", { descriptionmyturn: _("${you} must discard a card from your collection as you already have 6 cards in your collection") + "<br />", args: { type: type } });
        }
        else {
            this.takeAction("addCardToCollection", { type: type, cardIdToDiscard: null });
        }
    };
    Quibbles.prototype.confirmCollectionCardDiscard = function (type) {
        var selectedCardIds = this.cardsManager.getSelectedCollectionCards(this.getPlayerId())
            .map(function (card) { return card.id; });
        var cardIdToDiscard = selectedCardIds.length == 1 ? selectedCardIds[0] : null;
        this.takeAction("addCardToCollection", { type: type, cardIdToDiscard: cardIdToDiscard });
    };
    Quibbles.prototype.passConfirm = function () {
        var _this = this;
        var selectedCards = this.cardsManager.getSelectedPlayerHandCards();
        var cardId = selectedCards.length > 0 ? selectedCards[0].id : null;
        var performAction = function () { return _this.takeAction("pass", { cardId: cardId }); };
        if (cardId) {
            this.wrapInConfirm(performAction);
        }
        else {
            // This fails because no card selected, but will be handled by the backend.
            performAction();
        }
    };
    Quibbles.prototype.wrapInConfirm = function (runnable, message) {
        if (message === void 0) { message = _("This action can not be undone. Are you sure?"); }
        if (this.isAskForConfirmation()) {
            this.confirmationDialog(message, function () {
                runnable();
            });
        }
        else {
            runnable();
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
        this.ajaxcall("/quibbles/quibbles/".concat(action, ".html"), data, this, function () { });
    };
    Quibbles.prototype.takeNoLockAction = function (action, data) {
        data = data || {};
        this.ajaxcall("/quibbles/quibbles/".concat(action, ".html"), data, this, function () { });
    };
    Quibbles.prototype.setTooltip = function (id, html) {
        this.addTooltipHtml(id, html, TOOLTIP_DELAY);
    };
    Quibbles.prototype.setTooltipToClass = function (className, html) {
        this.addTooltipHtmlToClass(className, html, TOOLTIP_DELAY);
    };
    Quibbles.prototype.findCollectionAddCards = function (typeCounts) {
        return Object.values(typeCounts)
            .filter(function (typeCount) { return typeCount.count >= Number(typeCount.card_type); });
    };
    Quibbles.prototype.setScore = function (playerId, score) {
        var _a;
        (_a = this.scoreCtrl[playerId]) === null || _a === void 0 ? void 0 : _a.toValue(score);
    };
    Quibbles.prototype.isAskForConfirmation = function () {
        return true; // For now always ask for confirmation, might make this a preference later on.
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
            ['cancelLastMoves', ANIMATION_MS],
            ['takeConfirmed', ANIMATION_MS],
            ['displayDiscarded', ANIMATION_MS],
            ['displayRefilled', ANIMATION_MS],
            ['cardAddedToCollection', ANIMATION_MS],
            ['cardRemovedFromCollection', ANIMATION_MS],
            ['passConfirmed', ANIMATION_MS],
            ['cardsDrawn', ANIMATION_MS],
            ['handDiscarded', ANIMATION_MS],
            ['deckReshuffled', ANIMATION_MS]
        ];
        notifs.forEach(function (notif) {
            dojo.subscribe(notif[0], _this, "notif_".concat(notif[0]));
            _this.notifqueue.setSynchronous(notif[0], notif[1]);
        });
    };
    Quibbles.prototype.notif_cancelLastMoves = function (notif) {
        log('notif_cancelLastMoves: ');
        log(notif);
        this.cardsManager.addCardsToDisplay(notif.args.displayCards, this.getPlayerId());
    };
    Quibbles.prototype.notif_takeConfirmed = function (notif) {
        log('notif_takeConfirmed: ');
        log(notif);
        this.cardsManager.discardCardsFromPlayer(notif.args.cardsDiscarded, notif.args.playerId);
        this.cardsManager.addCardsToPlayerHand(notif.args.playerId, notif.args.cardsTaken);
        this.playerManager.setHandCounter(notif.args.playerId, notif.args.handCount);
    };
    Quibbles.prototype.notif_displayDiscarded = function (notif) {
        log('notif_displayDiscarded: ');
        log(notif);
        this.cardsManager.discardCards(notif.args.cardsDiscarded);
    };
    Quibbles.prototype.notif_displayRefilled = function (notif) {
        log('notif_displayRefilled: ');
        log(notif);
        this.cardsManager.setDeckCount(notif.args.deckCount);
        this.cardsManager.addCardsToDisplayFromDeck(notif.args.displayCards);
    };
    Quibbles.prototype.notif_cardAddedToCollection = function (notif) {
        log('notif_cardAddedToCollection: ');
        log(notif);
        this.setScore(notif.args.playerId, notif.args.playerScore);
        this.playerManager.setHandCounter(notif.args.playerId, notif.args.handCount);
        this.cardsManager.discardCardsFromPlayer(notif.args.cardsDiscarded, notif.args.playerId);
        this.cardsManager.addCardToCollection(notif.args.cardCollected, notif.args.playerId);
    };
    Quibbles.prototype.notif_cardRemovedFromCollection = function (notif) {
        log('notif_cardRemovedFromCollection: ');
        log(notif);
        this.cardsManager.discardCards([notif.args.cardRemoved]);
    };
    Quibbles.prototype.notif_passConfirmed = function (notif) {
        log('notif_passConfirmed: ');
        log(notif);
        this.cardsManager.setDeckCount(notif.args.deckCount);
        this.cardsManager.addCardsToDisplay([notif.args.cardToDisplay], notif.args.playerId);
        if (this.getPlayerId() !== notif.args.playerId) {
            this.cardsManager.addCardsToPlayerHandFromDeck(notif.args.playerId, notif.args.cardsDrawn);
        }
        this.playerManager.setHandCounter(notif.args.playerId, notif.args.handCount);
    };
    Quibbles.prototype.notif_cardsDrawn = function (notif) {
        log('notif_cardsDrawn: ');
        log(notif);
        // Only received by the player that has drawn cards
        if (this.getPlayerId() === notif.args.playerId) {
            this.cardsManager.addCardsToPlayerHandFromDeck(notif.args.playerId, notif.args.cardsDrawn);
        }
    };
    Quibbles.prototype.notif_handDiscarded = function (notif) {
        log('notif_handDiscarded: ');
        log(notif);
        this.cardsManager.discardCardsFromPlayer(notif.args.cardsDiscarded, notif.args.playerId);
        this.playerManager.setHandCounter(notif.args.playerId, notif.args.handCount);
    };
    Quibbles.prototype.notif_deckReshuffled = function (notif) {
        log('notif_deckReshuffled: ');
        log(notif);
        this.cardsManager.deckReshuffled(notif.args.deckCount);
    };
    Quibbles.prototype.format_string_recursive = function (log, args) {
        var _this = this;
        try {
            if (log && args && !args.processed) {
                Object.keys(args).forEach(function (argKey) {
                    if (argKey.startsWith('cardSet') && Array.isArray(args[argKey])) {
                        args[argKey] = args[argKey].map(function (cardType) { return _this.getTypeIcon(cardType); }).join(",");
                    }
                    if (argKey.startsWith('cardSets') && Array.isArray(args[argKey])) {
                        args[argKey] = args[argKey].map(function (cardSet) { return cardSet.map(function (cardType) { return _this.getTypeIcon(cardType); }).join(","); }).join(" - ");
                    }
                });
            }
        }
        catch (e) {
            console.error(log, args, "Exception thrown", e.stack);
        }
        return this.inherited(arguments);
    };
    Quibbles.prototype.getTypeIcon = function (type) {
        return "<span class=\"quibbles-icon type-icon\" data-type=\"".concat(type, "\">").concat(type, "</span>");
    };
    return Quibbles;
}());
