/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@overwolf/overwolf-api-ts/dist/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/@overwolf/overwolf-api-ts/dist/index.js ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./ow-game-listener */ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-game-listener.js"), exports);
__exportStar(__webpack_require__(/*! ./ow-games-events */ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-games-events.js"), exports);
__exportStar(__webpack_require__(/*! ./ow-games */ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-games.js"), exports);
__exportStar(__webpack_require__(/*! ./ow-hotkeys */ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-hotkeys.js"), exports);
__exportStar(__webpack_require__(/*! ./ow-listener */ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-listener.js"), exports);
__exportStar(__webpack_require__(/*! ./ow-window */ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-window.js"), exports);


/***/ }),

/***/ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-game-listener.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@overwolf/overwolf-api-ts/dist/ow-game-listener.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OWGameListener = void 0;
const ow_listener_1 = __webpack_require__(/*! ./ow-listener */ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-listener.js");
class OWGameListener extends ow_listener_1.OWListener {
    constructor(delegate) {
        super(delegate);
        this.onGameInfoUpdated = (update) => {
            if (!update || !update.gameInfo) {
                return;
            }
            if (!update.runningChanged && !update.gameChanged) {
                return;
            }
            if (update.gameInfo.isRunning) {
                if (this._delegate.onGameStarted) {
                    this._delegate.onGameStarted(update.gameInfo);
                }
            }
            else {
                if (this._delegate.onGameEnded) {
                    this._delegate.onGameEnded(update.gameInfo);
                }
            }
        };
        this.onRunningGameInfo = (info) => {
            if (!info) {
                return;
            }
            if (info.isRunning) {
                if (this._delegate.onGameStarted) {
                    this._delegate.onGameStarted(info);
                }
            }
        };
    }
    start() {
        super.start();
        overwolf.games.onGameInfoUpdated.addListener(this.onGameInfoUpdated);
        overwolf.games.getRunningGameInfo(this.onRunningGameInfo);
    }
    stop() {
        overwolf.games.onGameInfoUpdated.removeListener(this.onGameInfoUpdated);
    }
}
exports.OWGameListener = OWGameListener;


/***/ }),

/***/ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-games-events.js":
/*!************************************************************************!*\
  !*** ./node_modules/@overwolf/overwolf-api-ts/dist/ow-games-events.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OWGamesEvents = void 0;
const timer_1 = __webpack_require__(/*! ./timer */ "./node_modules/@overwolf/overwolf-api-ts/dist/timer.js");
class OWGamesEvents {
    constructor(delegate, requiredFeatures, featureRetries = 10) {
        this.onInfoUpdates = (info) => {
            this._delegate.onInfoUpdates(info.info);
        };
        this.onNewEvents = (e) => {
            this._delegate.onNewEvents(e);
        };
        this._delegate = delegate;
        this._requiredFeatures = requiredFeatures;
        this._featureRetries = featureRetries;
    }
    async getInfo() {
        return new Promise((resolve) => {
            overwolf.games.events.getInfo(resolve);
        });
    }
    async setRequiredFeatures() {
        let tries = 1, result;
        while (tries <= this._featureRetries) {
            result = await new Promise(resolve => {
                overwolf.games.events.setRequiredFeatures(this._requiredFeatures, resolve);
            });
            if (result.status === 'success') {
                console.log('setRequiredFeatures(): success: ' + JSON.stringify(result, null, 2));
                return (result.supportedFeatures.length > 0);
            }
            await timer_1.Timer.wait(3000);
            tries++;
        }
        console.warn('setRequiredFeatures(): failure after ' + tries + ' tries' + JSON.stringify(result, null, 2));
        return false;
    }
    registerEvents() {
        this.unRegisterEvents();
        overwolf.games.events.onInfoUpdates2.addListener(this.onInfoUpdates);
        overwolf.games.events.onNewEvents.addListener(this.onNewEvents);
    }
    unRegisterEvents() {
        overwolf.games.events.onInfoUpdates2.removeListener(this.onInfoUpdates);
        overwolf.games.events.onNewEvents.removeListener(this.onNewEvents);
    }
    async start() {
        console.log(`[ow-game-events] START`);
        this.registerEvents();
        await this.setRequiredFeatures();
        const { res, status } = await this.getInfo();
        if (res && status === 'success') {
            this.onInfoUpdates({ info: res });
        }
    }
    stop() {
        console.log(`[ow-game-events] STOP`);
        this.unRegisterEvents();
    }
}
exports.OWGamesEvents = OWGamesEvents;


/***/ }),

/***/ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-games.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@overwolf/overwolf-api-ts/dist/ow-games.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OWGames = void 0;
class OWGames {
    static getRunningGameInfo() {
        return new Promise((resolve) => {
            overwolf.games.getRunningGameInfo(resolve);
        });
    }
    static classIdFromGameId(gameId) {
        let classId = Math.floor(gameId / 10);
        return classId;
    }
    static async getRecentlyPlayedGames(limit = 3) {
        return new Promise((resolve) => {
            if (!overwolf.games.getRecentlyPlayedGames) {
                return resolve(null);
            }
            overwolf.games.getRecentlyPlayedGames(limit, result => {
                resolve(result.games);
            });
        });
    }
    static async getGameDBInfo(gameClassId) {
        return new Promise((resolve) => {
            overwolf.games.getGameDBInfo(gameClassId, resolve);
        });
    }
}
exports.OWGames = OWGames;


/***/ }),

/***/ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-hotkeys.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@overwolf/overwolf-api-ts/dist/ow-hotkeys.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OWHotkeys = void 0;
class OWHotkeys {
    constructor() { }
    static getHotkeyText(hotkeyId, gameId) {
        return new Promise(resolve => {
            overwolf.settings.hotkeys.get(result => {
                if (result && result.success) {
                    let hotkey;
                    if (gameId === undefined)
                        hotkey = result.globals.find(h => h.name === hotkeyId);
                    else if (result.games && result.games[gameId])
                        hotkey = result.games[gameId].find(h => h.name === hotkeyId);
                    if (hotkey)
                        return resolve(hotkey.binding);
                }
                resolve('UNASSIGNED');
            });
        });
    }
    static onHotkeyDown(hotkeyId, action) {
        overwolf.settings.hotkeys.onPressed.addListener((result) => {
            if (result && result.name === hotkeyId)
                action(result);
        });
    }
}
exports.OWHotkeys = OWHotkeys;


/***/ }),

/***/ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-listener.js":
/*!********************************************************************!*\
  !*** ./node_modules/@overwolf/overwolf-api-ts/dist/ow-listener.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OWListener = void 0;
class OWListener {
    constructor(delegate) {
        this._delegate = delegate;
    }
    start() {
        this.stop();
    }
}
exports.OWListener = OWListener;


/***/ }),

/***/ "./node_modules/@overwolf/overwolf-api-ts/dist/ow-window.js":
/*!******************************************************************!*\
  !*** ./node_modules/@overwolf/overwolf-api-ts/dist/ow-window.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OWWindow = void 0;
class OWWindow {
    constructor(name = null) {
        this._name = name;
        this._id = null;
    }
    async restore() {
        let that = this;
        return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.restore(id, result => {
                if (!result.success)
                    console.error(`[restore] - an error occurred, windowId=${id}, reason=${result.error}`);
                resolve();
            });
        });
    }
    async minimize() {
        let that = this;
        return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.minimize(id, () => { });
            return resolve();
        });
    }
    async maximize() {
        let that = this;
        return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.maximize(id, () => { });
            return resolve();
        });
    }
    async hide() {
        let that = this;
        return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.hide(id, () => { });
            return resolve();
        });
    }
    async close() {
        let that = this;
        return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            const result = await this.getWindowState();
            if (result.success &&
                (result.window_state !== 'closed')) {
                await this.internalClose();
            }
            return resolve();
        });
    }
    dragMove(elem) {
        elem.className = elem.className + ' draggable';
        elem.onmousedown = e => {
            e.preventDefault();
            overwolf.windows.dragMove(this._name);
        };
    }
    async getWindowState() {
        let that = this;
        return new Promise(async (resolve) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.getWindowState(id, resolve);
        });
    }
    static async getCurrentInfo() {
        return new Promise(async (resolve) => {
            overwolf.windows.getCurrentWindow(result => {
                resolve(result.window);
            });
        });
    }
    obtain() {
        return new Promise((resolve, reject) => {
            const cb = res => {
                if (res && res.status === "success" && res.window && res.window.id) {
                    this._id = res.window.id;
                    if (!this._name) {
                        this._name = res.window.name;
                    }
                    resolve(res.window);
                }
                else {
                    this._id = null;
                    reject();
                }
            };
            if (!this._name) {
                overwolf.windows.getCurrentWindow(cb);
            }
            else {
                overwolf.windows.obtainDeclaredWindow(this._name, cb);
            }
        });
    }
    async assureObtained() {
        let that = this;
        return new Promise(async (resolve) => {
            await that.obtain();
            return resolve();
        });
    }
    async internalClose() {
        let that = this;
        return new Promise(async (resolve, reject) => {
            await that.assureObtained();
            let id = that._id;
            overwolf.windows.close(id, res => {
                if (res && res.success)
                    resolve();
                else
                    reject(res);
            });
        });
    }
}
exports.OWWindow = OWWindow;


/***/ }),

/***/ "./node_modules/@overwolf/overwolf-api-ts/dist/timer.js":
/*!**************************************************************!*\
  !*** ./node_modules/@overwolf/overwolf-api-ts/dist/timer.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Timer = void 0;
class Timer {
    constructor(delegate, id) {
        this._timerId = null;
        this.handleTimerEvent = () => {
            this._timerId = null;
            this._delegate.onTimer(this._id);
        };
        this._delegate = delegate;
        this._id = id;
    }
    static async wait(intervalInMS) {
        return new Promise(resolve => {
            setTimeout(resolve, intervalInMS);
        });
    }
    start(intervalInMS) {
        this.stop();
        this._timerId = setTimeout(this.handleTimerEvent, intervalInMS);
    }
    stop() {
        if (this._timerId == null) {
            return;
        }
        clearTimeout(this._timerId);
        this._timerId = null;
    }
}
exports.Timer = Timer;


/***/ }),

/***/ "./src/consts.ts":
/*!***********************!*\
  !*** ./src/consts.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.kHotkeys = exports.kWindowNames = exports.kGameClassIds = exports.kGamesFeatures = void 0;
exports.kGamesFeatures = new Map([
    [
        5426,
        [
            'live_client_data',
            'matchState',
            'match_info',
            'death',
            'respawn',
            'abilities',
            'kill',
            'assist',
            'gold',
            'minions',
            'summoner_info',
            'gameMode',
            'teams',
            'level',
            'announcer',
            'counters',
            'damage',
            'heal'
        ]
    ]
]);
exports.kGameClassIds = Array.from(exports.kGamesFeatures.keys());
exports.kWindowNames = {
    inGame: 'in_game',
    desktop: 'desktop'
};
exports.kHotkeys = {
    toggle: 'sample_app_ts_showhide'
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**************************************!*\
  !*** ./src/background/background.ts ***!
  \**************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const overwolf_api_ts_1 = __webpack_require__(/*! @overwolf/overwolf-api-ts */ "./node_modules/@overwolf/overwolf-api-ts/dist/index.js");
const consts_1 = __webpack_require__(/*! ../consts */ "./src/consts.ts");
class BackgroundController {
    constructor() {
        this._windows = {};
        this._windows[consts_1.kWindowNames.desktop] = new overwolf_api_ts_1.OWWindow(consts_1.kWindowNames.desktop);
        this._windows[consts_1.kWindowNames.inGame] = new overwolf_api_ts_1.OWWindow(consts_1.kWindowNames.inGame);
        this._gameListener = new overwolf_api_ts_1.OWGameListener({
            onGameStarted: this.toggleWindows.bind(this),
            onGameEnded: this.toggleWindows.bind(this)
        });
        overwolf.extensions.onAppLaunchTriggered.addListener(e => this.onAppLaunchTriggered(e));
    }
    ;
    static instance() {
        if (!BackgroundController._instance) {
            BackgroundController._instance = new BackgroundController();
        }
        return BackgroundController._instance;
    }
    async run() {
        this._gameListener.start();
        const currWindowName = (await this.isSupportedGameRunning())
            ? consts_1.kWindowNames.inGame
            : consts_1.kWindowNames.desktop;
        this._windows[currWindowName].restore();
    }
    async onAppLaunchTriggered(e) {
        console.log('onAppLaunchTriggered():', e);
        if (!e || e.origin.includes('gamelaunchevent')) {
            return;
        }
        if (await this.isSupportedGameRunning()) {
            this._windows[consts_1.kWindowNames.desktop].close();
            this._windows[consts_1.kWindowNames.inGame].restore();
        }
        else {
            this._windows[consts_1.kWindowNames.desktop].restore();
            this._windows[consts_1.kWindowNames.inGame].close();
        }
    }
    toggleWindows(info) {
        if (!info || !this.isSupportedGame(info)) {
            return;
        }
        if (info.isRunning) {
            this._windows[consts_1.kWindowNames.desktop].close();
            this._windows[consts_1.kWindowNames.inGame].restore();
        }
        else {
            this._windows[consts_1.kWindowNames.desktop].restore();
            this._windows[consts_1.kWindowNames.inGame].close();
        }
    }
    async isSupportedGameRunning() {
        const info = await overwolf_api_ts_1.OWGames.getRunningGameInfo();
        return info && info.isRunning && this.isSupportedGame(info);
    }
    isSupportedGame(info) {
        return consts_1.kGameClassIds.includes(info.classId);
    }
}
BackgroundController.instance().run();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vbm9kZV9tb2R1bGVzL0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vbm9kZV9tb2R1bGVzL0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMvZGlzdC9vdy1nYW1lLWxpc3RlbmVyLmpzIiwid2VicGFjazovL2V4YW1wbGUtdHMvLi9ub2RlX21vZHVsZXMvQG92ZXJ3b2xmL292ZXJ3b2xmLWFwaS10cy9kaXN0L293LWdhbWVzLWV2ZW50cy5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vbm9kZV9tb2R1bGVzL0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMvZGlzdC9vdy1nYW1lcy5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vbm9kZV9tb2R1bGVzL0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMvZGlzdC9vdy1ob3RrZXlzLmpzIiwid2VicGFjazovL2V4YW1wbGUtdHMvLi9ub2RlX21vZHVsZXMvQG92ZXJ3b2xmL292ZXJ3b2xmLWFwaS10cy9kaXN0L293LWxpc3RlbmVyLmpzIiwid2VicGFjazovL2V4YW1wbGUtdHMvLi9ub2RlX21vZHVsZXMvQG92ZXJ3b2xmL292ZXJ3b2xmLWFwaS10cy9kaXN0L293LXdpbmRvdy5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vbm9kZV9tb2R1bGVzL0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMvZGlzdC90aW1lci5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vc3JjL2NvbnN0cy50cyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4YW1wbGUtdHMvLi9zcmMvYmFja2dyb3VuZC9iYWNrZ3JvdW5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBYTtBQUNiO0FBQ0E7QUFDQSxrQ0FBa0Msb0NBQW9DLGFBQWEsRUFBRSxF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O1lBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUM1QztJQUNILENBQUM7SUFFTyxhQUFhLENBQUMsSUFBcUI7UUFDekMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDeEMsT0FBTztTQUNSO1FBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDOUM7YUFBTTtZQUNMLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDNUM7SUFDSCxDQUFDO0lBRU8sS0FBSyxDQUFDLHNCQUFzQjtRQUNsQyxNQUFNLElBQUksR0FBRyxNQUFNLHlCQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVoRCxPQUFPLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUdPLGVBQWUsQ0FBQyxJQUFxQjtRQUMzQyxPQUFPLHNCQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5QyxDQUFDO0NBQ0Y7QUFFRCxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyIsImZpbGUiOiJqcy9iYWNrZ3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XHJcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KSk7XHJcbnZhciBfX2V4cG9ydFN0YXIgPSAodGhpcyAmJiB0aGlzLl9fZXhwb3J0U3RhcikgfHwgZnVuY3Rpb24obSwgZXhwb3J0cykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xyXG59O1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9vdy1nYW1lLWxpc3RlbmVyXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL293LWdhbWVzLWV2ZW50c1wiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9vdy1nYW1lc1wiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9vdy1ob3RrZXlzXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL293LWxpc3RlbmVyXCIpLCBleHBvcnRzKTtcclxuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL293LXdpbmRvd1wiKSwgZXhwb3J0cyk7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuT1dHYW1lTGlzdGVuZXIgPSB2b2lkIDA7XHJcbmNvbnN0IG93X2xpc3RlbmVyXzEgPSByZXF1aXJlKFwiLi9vdy1saXN0ZW5lclwiKTtcclxuY2xhc3MgT1dHYW1lTGlzdGVuZXIgZXh0ZW5kcyBvd19saXN0ZW5lcl8xLk9XTGlzdGVuZXIge1xyXG4gICAgY29uc3RydWN0b3IoZGVsZWdhdGUpIHtcclxuICAgICAgICBzdXBlcihkZWxlZ2F0ZSk7XHJcbiAgICAgICAgdGhpcy5vbkdhbWVJbmZvVXBkYXRlZCA9ICh1cGRhdGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF1cGRhdGUgfHwgIXVwZGF0ZS5nYW1lSW5mbykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdXBkYXRlLnJ1bm5pbmdDaGFuZ2VkICYmICF1cGRhdGUuZ2FtZUNoYW5nZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodXBkYXRlLmdhbWVJbmZvLmlzUnVubmluZykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RlbGVnYXRlLm9uR2FtZVN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWxlZ2F0ZS5vbkdhbWVTdGFydGVkKHVwZGF0ZS5nYW1lSW5mbyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZGVsZWdhdGUub25HYW1lRW5kZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWxlZ2F0ZS5vbkdhbWVFbmRlZCh1cGRhdGUuZ2FtZUluZm8pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm9uUnVubmluZ0dhbWVJbmZvID0gKGluZm8pID0+IHtcclxuICAgICAgICAgICAgaWYgKCFpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGluZm8uaXNSdW5uaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZGVsZWdhdGUub25HYW1lU3RhcnRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlbGVnYXRlLm9uR2FtZVN0YXJ0ZWQoaW5mbyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgc3VwZXIuc3RhcnQoKTtcclxuICAgICAgICBvdmVyd29sZi5nYW1lcy5vbkdhbWVJbmZvVXBkYXRlZC5hZGRMaXN0ZW5lcih0aGlzLm9uR2FtZUluZm9VcGRhdGVkKTtcclxuICAgICAgICBvdmVyd29sZi5nYW1lcy5nZXRSdW5uaW5nR2FtZUluZm8odGhpcy5vblJ1bm5pbmdHYW1lSW5mbyk7XHJcbiAgICB9XHJcbiAgICBzdG9wKCkge1xyXG4gICAgICAgIG92ZXJ3b2xmLmdhbWVzLm9uR2FtZUluZm9VcGRhdGVkLnJlbW92ZUxpc3RlbmVyKHRoaXMub25HYW1lSW5mb1VwZGF0ZWQpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuT1dHYW1lTGlzdGVuZXIgPSBPV0dhbWVMaXN0ZW5lcjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5PV0dhbWVzRXZlbnRzID0gdm9pZCAwO1xyXG5jb25zdCB0aW1lcl8xID0gcmVxdWlyZShcIi4vdGltZXJcIik7XHJcbmNsYXNzIE9XR2FtZXNFdmVudHMge1xyXG4gICAgY29uc3RydWN0b3IoZGVsZWdhdGUsIHJlcXVpcmVkRmVhdHVyZXMsIGZlYXR1cmVSZXRyaWVzID0gMTApIHtcclxuICAgICAgICB0aGlzLm9uSW5mb1VwZGF0ZXMgPSAoaW5mbykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9kZWxlZ2F0ZS5vbkluZm9VcGRhdGVzKGluZm8uaW5mbyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm9uTmV3RXZlbnRzID0gKGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fZGVsZWdhdGUub25OZXdFdmVudHMoZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLl9kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xyXG4gICAgICAgIHRoaXMuX3JlcXVpcmVkRmVhdHVyZXMgPSByZXF1aXJlZEZlYXR1cmVzO1xyXG4gICAgICAgIHRoaXMuX2ZlYXR1cmVSZXRyaWVzID0gZmVhdHVyZVJldHJpZXM7XHJcbiAgICB9XHJcbiAgICBhc3luYyBnZXRJbmZvKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBvdmVyd29sZi5nYW1lcy5ldmVudHMuZ2V0SW5mbyhyZXNvbHZlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIHNldFJlcXVpcmVkRmVhdHVyZXMoKSB7XHJcbiAgICAgICAgbGV0IHRyaWVzID0gMSwgcmVzdWx0O1xyXG4gICAgICAgIHdoaWxlICh0cmllcyA8PSB0aGlzLl9mZWF0dXJlUmV0cmllcykge1xyXG4gICAgICAgICAgICByZXN1bHQgPSBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgICAgIG92ZXJ3b2xmLmdhbWVzLmV2ZW50cy5zZXRSZXF1aXJlZEZlYXR1cmVzKHRoaXMuX3JlcXVpcmVkRmVhdHVyZXMsIHJlc29sdmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NldFJlcXVpcmVkRmVhdHVyZXMoKTogc3VjY2VzczogJyArIEpTT04uc3RyaW5naWZ5KHJlc3VsdCwgbnVsbCwgMikpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChyZXN1bHQuc3VwcG9ydGVkRmVhdHVyZXMubGVuZ3RoID4gMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXdhaXQgdGltZXJfMS5UaW1lci53YWl0KDMwMDApO1xyXG4gICAgICAgICAgICB0cmllcysrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLndhcm4oJ3NldFJlcXVpcmVkRmVhdHVyZXMoKTogZmFpbHVyZSBhZnRlciAnICsgdHJpZXMgKyAnIHRyaWVzJyArIEpTT04uc3RyaW5naWZ5KHJlc3VsdCwgbnVsbCwgMikpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJlZ2lzdGVyRXZlbnRzKCkge1xyXG4gICAgICAgIHRoaXMudW5SZWdpc3RlckV2ZW50cygpO1xyXG4gICAgICAgIG92ZXJ3b2xmLmdhbWVzLmV2ZW50cy5vbkluZm9VcGRhdGVzMi5hZGRMaXN0ZW5lcih0aGlzLm9uSW5mb1VwZGF0ZXMpO1xyXG4gICAgICAgIG92ZXJ3b2xmLmdhbWVzLmV2ZW50cy5vbk5ld0V2ZW50cy5hZGRMaXN0ZW5lcih0aGlzLm9uTmV3RXZlbnRzKTtcclxuICAgIH1cclxuICAgIHVuUmVnaXN0ZXJFdmVudHMoKSB7XHJcbiAgICAgICAgb3ZlcndvbGYuZ2FtZXMuZXZlbnRzLm9uSW5mb1VwZGF0ZXMyLnJlbW92ZUxpc3RlbmVyKHRoaXMub25JbmZvVXBkYXRlcyk7XHJcbiAgICAgICAgb3ZlcndvbGYuZ2FtZXMuZXZlbnRzLm9uTmV3RXZlbnRzLnJlbW92ZUxpc3RlbmVyKHRoaXMub25OZXdFdmVudHMpO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgc3RhcnQoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtvdy1nYW1lLWV2ZW50c10gU1RBUlRgKTtcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyRXZlbnRzKCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5zZXRSZXF1aXJlZEZlYXR1cmVzKCk7XHJcbiAgICAgICAgY29uc3QgeyByZXMsIHN0YXR1cyB9ID0gYXdhaXQgdGhpcy5nZXRJbmZvKCk7XHJcbiAgICAgICAgaWYgKHJlcyAmJiBzdGF0dXMgPT09ICdzdWNjZXNzJykge1xyXG4gICAgICAgICAgICB0aGlzLm9uSW5mb1VwZGF0ZXMoeyBpbmZvOiByZXMgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RvcCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgW293LWdhbWUtZXZlbnRzXSBTVE9QYCk7XHJcbiAgICAgICAgdGhpcy51blJlZ2lzdGVyRXZlbnRzKCk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5PV0dhbWVzRXZlbnRzID0gT1dHYW1lc0V2ZW50cztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5PV0dhbWVzID0gdm9pZCAwO1xyXG5jbGFzcyBPV0dhbWVzIHtcclxuICAgIHN0YXRpYyBnZXRSdW5uaW5nR2FtZUluZm8oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIG92ZXJ3b2xmLmdhbWVzLmdldFJ1bm5pbmdHYW1lSW5mbyhyZXNvbHZlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBjbGFzc0lkRnJvbUdhbWVJZChnYW1lSWQpIHtcclxuICAgICAgICBsZXQgY2xhc3NJZCA9IE1hdGguZmxvb3IoZ2FtZUlkIC8gMTApO1xyXG4gICAgICAgIHJldHVybiBjbGFzc0lkO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGFzeW5jIGdldFJlY2VudGx5UGxheWVkR2FtZXMobGltaXQgPSAzKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghb3ZlcndvbGYuZ2FtZXMuZ2V0UmVjZW50bHlQbGF5ZWRHYW1lcykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUobnVsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3ZlcndvbGYuZ2FtZXMuZ2V0UmVjZW50bHlQbGF5ZWRHYW1lcyhsaW1pdCwgcmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0LmdhbWVzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0R2FtZURCSW5mbyhnYW1lQ2xhc3NJZCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBvdmVyd29sZi5nYW1lcy5nZXRHYW1lREJJbmZvKGdhbWVDbGFzc0lkLCByZXNvbHZlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLk9XR2FtZXMgPSBPV0dhbWVzO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLk9XSG90a2V5cyA9IHZvaWQgMDtcclxuY2xhc3MgT1dIb3RrZXlzIHtcclxuICAgIGNvbnN0cnVjdG9yKCkgeyB9XHJcbiAgICBzdGF0aWMgZ2V0SG90a2V5VGV4dChob3RrZXlJZCwgZ2FtZUlkKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgICAgICBvdmVyd29sZi5zZXR0aW5ncy5ob3RrZXlzLmdldChyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3VjY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBob3RrZXk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGdhbWVJZCA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3RrZXkgPSByZXN1bHQuZ2xvYmFscy5maW5kKGggPT4gaC5uYW1lID09PSBob3RrZXlJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzdWx0LmdhbWVzICYmIHJlc3VsdC5nYW1lc1tnYW1lSWRdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3RrZXkgPSByZXN1bHQuZ2FtZXNbZ2FtZUlkXS5maW5kKGggPT4gaC5uYW1lID09PSBob3RrZXlJZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvdGtleSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoaG90a2V5LmJpbmRpbmcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgnVU5BU1NJR05FRCcpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBvbkhvdGtleURvd24oaG90a2V5SWQsIGFjdGlvbikge1xyXG4gICAgICAgIG92ZXJ3b2xmLnNldHRpbmdzLmhvdGtleXMub25QcmVzc2VkLmFkZExpc3RlbmVyKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQubmFtZSA9PT0gaG90a2V5SWQpXHJcbiAgICAgICAgICAgICAgICBhY3Rpb24ocmVzdWx0KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLk9XSG90a2V5cyA9IE9XSG90a2V5cztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5PV0xpc3RlbmVyID0gdm9pZCAwO1xyXG5jbGFzcyBPV0xpc3RlbmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKGRlbGVnYXRlKSB7XHJcbiAgICAgICAgdGhpcy5fZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuICAgIH1cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuT1dMaXN0ZW5lciA9IE9XTGlzdGVuZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuT1dXaW5kb3cgPSB2b2lkIDA7XHJcbmNsYXNzIE9XV2luZG93IHtcclxuICAgIGNvbnN0cnVjdG9yKG5hbWUgPSBudWxsKSB7XHJcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5faWQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgcmVzdG9yZSgpIHtcclxuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoYXQuYXNzdXJlT2J0YWluZWQoKTtcclxuICAgICAgICAgICAgbGV0IGlkID0gdGhhdC5faWQ7XHJcbiAgICAgICAgICAgIG92ZXJ3b2xmLndpbmRvd3MucmVzdG9yZShpZCwgcmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgW3Jlc3RvcmVdIC0gYW4gZXJyb3Igb2NjdXJyZWQsIHdpbmRvd0lkPSR7aWR9LCByZWFzb249JHtyZXN1bHQuZXJyb3J9YCk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgbWluaW1pemUoKSB7XHJcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGF0LmFzc3VyZU9idGFpbmVkKCk7XHJcbiAgICAgICAgICAgIGxldCBpZCA9IHRoYXQuX2lkO1xyXG4gICAgICAgICAgICBvdmVyd29sZi53aW5kb3dzLm1pbmltaXplKGlkLCAoKSA9PiB7IH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgbWF4aW1pemUoKSB7XHJcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGF0LmFzc3VyZU9idGFpbmVkKCk7XHJcbiAgICAgICAgICAgIGxldCBpZCA9IHRoYXQuX2lkO1xyXG4gICAgICAgICAgICBvdmVyd29sZi53aW5kb3dzLm1heGltaXplKGlkLCAoKSA9PiB7IH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgaGlkZSgpIHtcclxuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoYXQuYXNzdXJlT2J0YWluZWQoKTtcclxuICAgICAgICAgICAgbGV0IGlkID0gdGhhdC5faWQ7XHJcbiAgICAgICAgICAgIG92ZXJ3b2xmLndpbmRvd3MuaGlkZShpZCwgKCkgPT4geyB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIGNsb3NlKCkge1xyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgYXdhaXQgdGhhdC5hc3N1cmVPYnRhaW5lZCgpO1xyXG4gICAgICAgICAgICBsZXQgaWQgPSB0aGF0Ll9pZDtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5nZXRXaW5kb3dTdGF0ZSgpO1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MgJiZcclxuICAgICAgICAgICAgICAgIChyZXN1bHQud2luZG93X3N0YXRlICE9PSAnY2xvc2VkJykpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuaW50ZXJuYWxDbG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBkcmFnTW92ZShlbGVtKSB7XHJcbiAgICAgICAgZWxlbS5jbGFzc05hbWUgPSBlbGVtLmNsYXNzTmFtZSArICcgZHJhZ2dhYmxlJztcclxuICAgICAgICBlbGVtLm9ubW91c2Vkb3duID0gZSA9PiB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgb3ZlcndvbGYud2luZG93cy5kcmFnTW92ZSh0aGlzLl9uYW1lKTtcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgYXN5bmMgZ2V0V2luZG93U3RhdGUoKSB7XHJcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGF0LmFzc3VyZU9idGFpbmVkKCk7XHJcbiAgICAgICAgICAgIGxldCBpZCA9IHRoYXQuX2lkO1xyXG4gICAgICAgICAgICBvdmVyd29sZi53aW5kb3dzLmdldFdpbmRvd1N0YXRlKGlkLCByZXNvbHZlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBhc3luYyBnZXRDdXJyZW50SW5mbygpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgb3ZlcndvbGYud2luZG93cy5nZXRDdXJyZW50V2luZG93KHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdC53aW5kb3cpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIG9idGFpbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjYiA9IHJlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzICYmIHJlcy5zdGF0dXMgPT09IFwic3VjY2Vzc1wiICYmIHJlcy53aW5kb3cgJiYgcmVzLndpbmRvdy5pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lkID0gcmVzLndpbmRvdy5pZDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX25hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbmFtZSA9IHJlcy53aW5kb3cubmFtZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMud2luZG93KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBvdmVyd29sZi53aW5kb3dzLmdldEN1cnJlbnRXaW5kb3coY2IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb3ZlcndvbGYud2luZG93cy5vYnRhaW5EZWNsYXJlZFdpbmRvdyh0aGlzLl9uYW1lLCBjYik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIGFzc3VyZU9idGFpbmVkKCkge1xyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgYXdhaXQgdGhhdC5vYnRhaW4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIGludGVybmFsQ2xvc2UoKSB7XHJcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoYXQuYXNzdXJlT2J0YWluZWQoKTtcclxuICAgICAgICAgICAgbGV0IGlkID0gdGhhdC5faWQ7XHJcbiAgICAgICAgICAgIG92ZXJ3b2xmLndpbmRvd3MuY2xvc2UoaWQsIHJlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzICYmIHJlcy5zdWNjZXNzKVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5PV1dpbmRvdyA9IE9XV2luZG93O1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLlRpbWVyID0gdm9pZCAwO1xyXG5jbGFzcyBUaW1lciB7XHJcbiAgICBjb25zdHJ1Y3RvcihkZWxlZ2F0ZSwgaWQpIHtcclxuICAgICAgICB0aGlzLl90aW1lcklkID0gbnVsbDtcclxuICAgICAgICB0aGlzLmhhbmRsZVRpbWVyRXZlbnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3RpbWVySWQgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLl9kZWxlZ2F0ZS5vblRpbWVyKHRoaXMuX2lkKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuX2RlbGVnYXRlID0gZGVsZWdhdGU7XHJcbiAgICAgICAgdGhpcy5faWQgPSBpZDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBhc3luYyB3YWl0KGludGVydmFsSW5NUykge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCBpbnRlcnZhbEluTVMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc3RhcnQoaW50ZXJ2YWxJbk1TKSB7XHJcbiAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgdGhpcy5fdGltZXJJZCA9IHNldFRpbWVvdXQodGhpcy5oYW5kbGVUaW1lckV2ZW50LCBpbnRlcnZhbEluTVMpO1xyXG4gICAgfVxyXG4gICAgc3RvcCgpIHtcclxuICAgICAgICBpZiAodGhpcy5fdGltZXJJZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVySWQpO1xyXG4gICAgICAgIHRoaXMuX3RpbWVySWQgPSBudWxsO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuVGltZXIgPSBUaW1lcjtcclxuIiwiZXhwb3J0IGNvbnN0IGtHYW1lc0ZlYXR1cmVzID0gbmV3IE1hcDxudW1iZXIsIHN0cmluZ1tdPihbXG4gIC8vIExlYWd1ZSBvZiBMZWdlbmRzXG4gIFtcbiAgICA1NDI2LFxuICAgIFtcbiAgICAgICdsaXZlX2NsaWVudF9kYXRhJyxcbiAgICAgICdtYXRjaFN0YXRlJyxcbiAgICAgICdtYXRjaF9pbmZvJyxcbiAgICAgICdkZWF0aCcsXG4gICAgICAncmVzcGF3bicsXG4gICAgICAnYWJpbGl0aWVzJyxcbiAgICAgICdraWxsJyxcbiAgICAgICdhc3Npc3QnLFxuICAgICAgJ2dvbGQnLFxuICAgICAgJ21pbmlvbnMnLFxuICAgICAgJ3N1bW1vbmVyX2luZm8nLFxuICAgICAgJ2dhbWVNb2RlJyxcbiAgICAgICd0ZWFtcycsXG4gICAgICAnbGV2ZWwnLFxuICAgICAgJ2Fubm91bmNlcicsXG4gICAgICAnY291bnRlcnMnLFxuICAgICAgJ2RhbWFnZScsXG4gICAgICAnaGVhbCdcbiAgICBdXG4gIF1cbl0pO1xuXG5leHBvcnQgY29uc3Qga0dhbWVDbGFzc0lkcyA9IEFycmF5LmZyb20oa0dhbWVzRmVhdHVyZXMua2V5cygpKTtcblxuZXhwb3J0IGNvbnN0IGtXaW5kb3dOYW1lcyA9IHtcbiAgaW5HYW1lOiAnaW5fZ2FtZScsXG4gIGRlc2t0b3A6ICdkZXNrdG9wJ1xufTtcblxuZXhwb3J0IGNvbnN0IGtIb3RrZXlzID0ge1xuICB0b2dnbGU6ICdzYW1wbGVfYXBwX3RzX3Nob3doaWRlJ1xufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHtcbiAgT1dHYW1lcyxcbiAgT1dHYW1lTGlzdGVuZXIsXG4gIE9XV2luZG93XG59IGZyb20gJ0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMnO1xuXG5pbXBvcnQgeyBrV2luZG93TmFtZXMsIGtHYW1lQ2xhc3NJZHMgfSBmcm9tIFwiLi4vY29uc3RzXCI7XG5cbmltcG9ydCBSdW5uaW5nR2FtZUluZm8gPSBvdmVyd29sZi5nYW1lcy5SdW5uaW5nR2FtZUluZm87XG5pbXBvcnQgQXBwTGF1bmNoVHJpZ2dlcmVkRXZlbnQgPSBvdmVyd29sZi5leHRlbnNpb25zLkFwcExhdW5jaFRyaWdnZXJlZEV2ZW50O1xuXG4vLyBUaGUgYmFja2dyb3VuZCBjb250cm9sbGVyIGhvbGRzIGFsbCBvZiB0aGUgYXBwJ3MgYmFja2dyb3VuZCBsb2dpYyAtIGhlbmNlIGl0cyBuYW1lLiBpdCBoYXNcbi8vIG1hbnkgcG9zc2libGUgdXNlIGNhc2VzLCBmb3IgZXhhbXBsZSBzaGFyaW5nIGRhdGEgYmV0d2VlbiB3aW5kb3dzLCBvciwgaW4gb3VyIGNhc2UsXG4vLyBtYW5hZ2luZyB3aGljaCB3aW5kb3cgaXMgY3VycmVudGx5IHByZXNlbnRlZCB0byB0aGUgdXNlci4gVG8gdGhhdCBlbmQsIGl0IGhvbGRzIGEgZGljdGlvbmFyeVxuLy8gb2YgdGhlIHdpbmRvd3MgYXZhaWxhYmxlIGluIHRoZSBhcHAuXG4vLyBPdXIgYmFja2dyb3VuZCBjb250cm9sbGVyIGltcGxlbWVudHMgdGhlIFNpbmdsZXRvbiBkZXNpZ24gcGF0dGVybiwgc2luY2Ugb25seSBvbmVcbi8vIGluc3RhbmNlIG9mIGl0IHNob3VsZCBleGlzdC5cbmNsYXNzIEJhY2tncm91bmRDb250cm9sbGVyIHtcbiAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBCYWNrZ3JvdW5kQ29udHJvbGxlcjtcbiAgcHJpdmF0ZSBfd2luZG93czogUmVjb3JkPHN0cmluZywgT1dXaW5kb3c+ID0ge307XG4gIHByaXZhdGUgX2dhbWVMaXN0ZW5lcjogT1dHYW1lTGlzdGVuZXI7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAvLyBQb3B1bGF0aW5nIHRoZSBiYWNrZ3JvdW5kIGNvbnRyb2xsZXIncyB3aW5kb3cgZGljdGlvbmFyeVxuICAgIHRoaXMuX3dpbmRvd3Nba1dpbmRvd05hbWVzLmRlc2t0b3BdID0gbmV3IE9XV2luZG93KGtXaW5kb3dOYW1lcy5kZXNrdG9wKTtcbiAgICB0aGlzLl93aW5kb3dzW2tXaW5kb3dOYW1lcy5pbkdhbWVdID0gbmV3IE9XV2luZG93KGtXaW5kb3dOYW1lcy5pbkdhbWUpO1xuXG4gICAgLy8gV2hlbiBhIGEgc3VwcG9ydGVkIGdhbWUgZ2FtZSBpcyBzdGFydGVkIG9yIGlzIGVuZGVkLCB0b2dnbGUgdGhlIGFwcCdzIHdpbmRvd3NcbiAgICB0aGlzLl9nYW1lTGlzdGVuZXIgPSBuZXcgT1dHYW1lTGlzdGVuZXIoe1xuICAgICAgb25HYW1lU3RhcnRlZDogdGhpcy50b2dnbGVXaW5kb3dzLmJpbmQodGhpcyksXG4gICAgICBvbkdhbWVFbmRlZDogdGhpcy50b2dnbGVXaW5kb3dzLmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIG92ZXJ3b2xmLmV4dGVuc2lvbnMub25BcHBMYXVuY2hUcmlnZ2VyZWQuYWRkTGlzdGVuZXIoXG4gICAgICBlID0+IHRoaXMub25BcHBMYXVuY2hUcmlnZ2VyZWQoZSlcbiAgICApO1xuICB9O1xuXG4gIC8vIEltcGxlbWVudGluZyB0aGUgU2luZ2xldG9uIGRlc2lnbiBwYXR0ZXJuXG4gIHB1YmxpYyBzdGF0aWMgaW5zdGFuY2UoKTogQmFja2dyb3VuZENvbnRyb2xsZXIge1xuICAgIGlmICghQmFja2dyb3VuZENvbnRyb2xsZXIuX2luc3RhbmNlKSB7XG4gICAgICBCYWNrZ3JvdW5kQ29udHJvbGxlci5faW5zdGFuY2UgPSBuZXcgQmFja2dyb3VuZENvbnRyb2xsZXIoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gQmFja2dyb3VuZENvbnRyb2xsZXIuX2luc3RhbmNlO1xuICB9XG5cbiAgLy8gV2hlbiBydW5uaW5nIHRoZSBhcHAsIHN0YXJ0IGxpc3RlbmluZyB0byBnYW1lcycgc3RhdHVzIGFuZCBkZWNpZGUgd2hpY2ggd2luZG93IHNob3VsZFxuICAvLyBiZSBsYXVuY2hlZCBmaXJzdCwgYmFzZWQgb24gd2hldGhlciBhIHN1cHBvcnRlZCBnYW1lIGlzIGN1cnJlbnRseSBydW5uaW5nXG4gIHB1YmxpYyBhc3luYyBydW4oKSB7XG4gICAgdGhpcy5fZ2FtZUxpc3RlbmVyLnN0YXJ0KCk7XG5cbiAgICBjb25zdCBjdXJyV2luZG93TmFtZSA9IChhd2FpdCB0aGlzLmlzU3VwcG9ydGVkR2FtZVJ1bm5pbmcoKSlcbiAgICAgID8ga1dpbmRvd05hbWVzLmluR2FtZVxuICAgICAgOiBrV2luZG93TmFtZXMuZGVza3RvcDtcblxuICAgIHRoaXMuX3dpbmRvd3NbY3VycldpbmRvd05hbWVdLnJlc3RvcmUoKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb25BcHBMYXVuY2hUcmlnZ2VyZWQoZTogQXBwTGF1bmNoVHJpZ2dlcmVkRXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnb25BcHBMYXVuY2hUcmlnZ2VyZWQoKTonLCBlKTtcblxuICAgIGlmICghZSB8fCBlLm9yaWdpbi5pbmNsdWRlcygnZ2FtZWxhdW5jaGV2ZW50JykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoYXdhaXQgdGhpcy5pc1N1cHBvcnRlZEdhbWVSdW5uaW5nKCkpIHtcbiAgICAgIHRoaXMuX3dpbmRvd3Nba1dpbmRvd05hbWVzLmRlc2t0b3BdLmNsb3NlKCk7XG4gICAgICB0aGlzLl93aW5kb3dzW2tXaW5kb3dOYW1lcy5pbkdhbWVdLnJlc3RvcmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fd2luZG93c1trV2luZG93TmFtZXMuZGVza3RvcF0ucmVzdG9yZSgpO1xuICAgICAgdGhpcy5fd2luZG93c1trV2luZG93TmFtZXMuaW5HYW1lXS5jbG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdG9nZ2xlV2luZG93cyhpbmZvOiBSdW5uaW5nR2FtZUluZm8pIHtcbiAgICBpZiAoIWluZm8gfHwgIXRoaXMuaXNTdXBwb3J0ZWRHYW1lKGluZm8pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGluZm8uaXNSdW5uaW5nKSB7XG4gICAgICB0aGlzLl93aW5kb3dzW2tXaW5kb3dOYW1lcy5kZXNrdG9wXS5jbG9zZSgpO1xuICAgICAgdGhpcy5fd2luZG93c1trV2luZG93TmFtZXMuaW5HYW1lXS5yZXN0b3JlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3dpbmRvd3Nba1dpbmRvd05hbWVzLmRlc2t0b3BdLnJlc3RvcmUoKTtcbiAgICAgIHRoaXMuX3dpbmRvd3Nba1dpbmRvd05hbWVzLmluR2FtZV0uY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGlzU3VwcG9ydGVkR2FtZVJ1bm5pbmcoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaW5mbyA9IGF3YWl0IE9XR2FtZXMuZ2V0UnVubmluZ0dhbWVJbmZvKCk7XG5cbiAgICByZXR1cm4gaW5mbyAmJiBpbmZvLmlzUnVubmluZyAmJiB0aGlzLmlzU3VwcG9ydGVkR2FtZShpbmZvKTtcbiAgfVxuXG4gIC8vIElkZW50aWZ5IHdoZXRoZXIgdGhlIFJ1bm5pbmdHYW1lSW5mbyBvYmplY3Qgd2UgaGF2ZSByZWZlcmVuY2VzIGEgc3VwcG9ydGVkIGdhbWVcbiAgcHJpdmF0ZSBpc1N1cHBvcnRlZEdhbWUoaW5mbzogUnVubmluZ0dhbWVJbmZvKSB7XG4gICAgcmV0dXJuIGtHYW1lQ2xhc3NJZHMuaW5jbHVkZXMoaW5mby5jbGFzc0lkKTtcbiAgfVxufVxuXG5CYWNrZ3JvdW5kQ29udHJvbGxlci5pbnN0YW5jZSgpLnJ1bigpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==