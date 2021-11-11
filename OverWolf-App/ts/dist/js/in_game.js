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

/***/ "./src/AppWindow.ts":
/*!**************************!*\
  !*** ./src/AppWindow.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppWindow = void 0;
const overwolf_api_ts_1 = __webpack_require__(/*! @overwolf/overwolf-api-ts */ "./node_modules/@overwolf/overwolf-api-ts/dist/index.js");
class AppWindow {
    constructor(windowName) {
        this.maximized = false;
        this.mainWindow = new overwolf_api_ts_1.OWWindow('background');
        this.currWindow = new overwolf_api_ts_1.OWWindow(windowName);
        const closeButton = document.getElementById('closeButton');
        const maximizeButton = document.getElementById('maximizeButton');
        const minimizeButton = document.getElementById('minimizeButton');
        const header = document.getElementById('header');
        this.setDrag(header);
        closeButton.addEventListener('click', () => {
            this.mainWindow.close();
        });
        minimizeButton.addEventListener('click', () => {
            this.currWindow.minimize();
        });
        maximizeButton.addEventListener('click', () => {
            if (!this.maximized) {
                this.currWindow.maximize();
            }
            else {
                this.currWindow.restore();
            }
            this.maximized = !this.maximized;
        });
    }
    async getWindowState() {
        return await this.currWindow.getWindowState();
    }
    async setDrag(elem) {
        this.currWindow.dragMove(elem);
    }
}
exports.AppWindow = AppWindow;


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
/*!********************************!*\
  !*** ./src/in_game/in_game.ts ***!
  \********************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const overwolf_api_ts_1 = __webpack_require__(/*! @overwolf/overwolf-api-ts */ "./node_modules/@overwolf/overwolf-api-ts/dist/index.js");
const AppWindow_1 = __webpack_require__(/*! ../AppWindow */ "./src/AppWindow.ts");
const consts_1 = __webpack_require__(/*! ../consts */ "./src/consts.ts");
class InGame extends AppWindow_1.AppWindow {
    constructor() {
        super(consts_1.kWindowNames.inGame);
        this._eventsLog = document.getElementById('eventsLog');
        this._infoLog = document.getElementById('infoLog');
        this.setToggleHotkeyBehavior();
        this.setToggleHotkeyText();
    }
    static instance() {
        if (!this._instance) {
            this._instance = new InGame();
        }
        return this._instance;
    }
    async run() {
        const gameClassId = await this.getCurrentGameClassId();
        const gameFeatures = consts_1.kGamesFeatures.get(gameClassId);
        if (gameFeatures && gameFeatures.length) {
            this._gameEventsListener = new overwolf_api_ts_1.OWGamesEvents({
                onInfoUpdates: this.onInfoUpdates.bind(this),
                onNewEvents: this.onNewEvents.bind(this)
            }, gameFeatures);
            this._gameEventsListener.start();
        }
    }
    onInfoUpdates(info) {
        this.logLine(this._infoLog, info, false);
    }
    onNewEvents(e) {
        const shouldHighlight = e.events.some(event => {
            switch (event.name) {
                case 'kill':
                case 'death':
                case 'assist':
                case 'level':
                case 'matchStart':
                case 'match_start':
                case 'matchEnd':
                case 'match_end':
                    return true;
            }
            return false;
        });
        this.logLine(this._eventsLog, e, shouldHighlight);
    }
    async setToggleHotkeyText() {
        const gameClassId = await this.getCurrentGameClassId();
        const hotkeyText = await overwolf_api_ts_1.OWHotkeys.getHotkeyText(consts_1.kHotkeys.toggle, gameClassId);
        const hotkeyElem = document.getElementById('hotkey');
        hotkeyElem.textContent = hotkeyText;
    }
    async setToggleHotkeyBehavior() {
        const toggleInGameWindow = async (hotkeyResult) => {
            console.log(`pressed hotkey for ${hotkeyResult.name}`);
            const inGameState = await this.getWindowState();
            if (inGameState.window_state === "normal" ||
                inGameState.window_state === "maximized") {
                this.currWindow.minimize();
            }
            else if (inGameState.window_state === "minimized" ||
                inGameState.window_state === "closed") {
                this.currWindow.restore();
            }
        };
        overwolf_api_ts_1.OWHotkeys.onHotkeyDown(consts_1.kHotkeys.toggle, toggleInGameWindow);
    }
    logLine(log, data, highlight) {
        const line = document.createElement('pre');
        line.textContent = JSON.stringify(data);
        if (highlight) {
            line.className = 'highlight';
        }
        const shouldAutoScroll = log.scrollTop + log.offsetHeight >= log.scrollHeight - 10;
        log.appendChild(line);
        if (shouldAutoScroll) {
            log.scrollTop = log.scrollHeight;
        }
    }
    async getCurrentGameClassId() {
        const info = await overwolf_api_ts_1.OWGames.getRunningGameInfo();
        return (info && info.isRunning && info.classId) ? info.classId : null;
    }
}
InGame.instance().run();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vbm9kZV9tb2R1bGVzL0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vbm9kZV9tb2R1bGVzL0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMvZGlzdC9vdy1nYW1lLWxpc3RlbmVyLmpzIiwid2VicGFjazovL2V4YW1wbGUtdHMvLi9ub2RlX21vZHVsZXMvQG92ZXJ3b2xmL292ZXJ3b2xmLWFwaS10cy9kaXN0L293LWdhbWVzLWV2ZW50cy5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vbm9kZV9tb2R1bGVzL0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMvZGlzdC9vdy1nYW1lcy5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vbm9kZV9tb2R1bGVzL0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMvZGlzdC9vdy1ob3RrZXlzLmpzIiwid2VicGFjazovL2V4YW1wbGUtdHMvLi9ub2RlX21vZHVsZXMvQG92ZXJ3b2xmL292ZXJ3b2xmLWFwaS10cy9kaXN0L293LWxpc3RlbmVyLmpzIiwid2VicGFjazovL2V4YW1wbGUtdHMvLi9ub2RlX21vZHVsZXMvQG92ZXJ3b2xmL292ZXJ3b2xmLWFwaS10cy9kaXN0L293LXdpbmRvdy5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vbm9kZV9tb2R1bGVzL0BvdmVyd29sZi9vdmVyd29sZi1hcGktdHMvZGlzdC90aW1lci5qcyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vc3JjL0FwcFdpbmRvdy50cyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzLy4vc3JjL2NvbnN0cy50cyIsIndlYnBhY2s6Ly9leGFtcGxlLXRzL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4YW1wbGUtdHMvLi9zcmMvaW5fZ2FtZS9pbl9nYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBYTtBQUNi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X19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH0pO1xyXG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufSkpO1xyXG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZXhwb3J0cywgcCkpIF9fY3JlYXRlQmluZGluZyhleHBvcnRzLCBtLCBwKTtcclxufTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vb3ctZ2FtZS1saXN0ZW5lclwiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9vdy1nYW1lcy1ldmVudHNcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vb3ctZ2FtZXNcIiksIGV4cG9ydHMpO1xyXG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vb3ctaG90a2V5c1wiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9vdy1saXN0ZW5lclwiKSwgZXhwb3J0cyk7XHJcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9vdy13aW5kb3dcIiksIGV4cG9ydHMpO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLk9XR2FtZUxpc3RlbmVyID0gdm9pZCAwO1xyXG5jb25zdCBvd19saXN0ZW5lcl8xID0gcmVxdWlyZShcIi4vb3ctbGlzdGVuZXJcIik7XHJcbmNsYXNzIE9XR2FtZUxpc3RlbmVyIGV4dGVuZHMgb3dfbGlzdGVuZXJfMS5PV0xpc3RlbmVyIHtcclxuICAgIGNvbnN0cnVjdG9yKGRlbGVnYXRlKSB7XHJcbiAgICAgICAgc3VwZXIoZGVsZWdhdGUpO1xyXG4gICAgICAgIHRoaXMub25HYW1lSW5mb1VwZGF0ZWQgPSAodXBkYXRlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghdXBkYXRlIHx8ICF1cGRhdGUuZ2FtZUluZm8pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIXVwZGF0ZS5ydW5uaW5nQ2hhbmdlZCAmJiAhdXBkYXRlLmdhbWVDaGFuZ2VkKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHVwZGF0ZS5nYW1lSW5mby5pc1J1bm5pbmcpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kZWxlZ2F0ZS5vbkdhbWVTdGFydGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVsZWdhdGUub25HYW1lU3RhcnRlZCh1cGRhdGUuZ2FtZUluZm8pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RlbGVnYXRlLm9uR2FtZUVuZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVsZWdhdGUub25HYW1lRW5kZWQodXBkYXRlLmdhbWVJbmZvKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5vblJ1bm5pbmdHYW1lSW5mbyA9IChpbmZvKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghaW5mbykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpbmZvLmlzUnVubmluZykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RlbGVnYXRlLm9uR2FtZVN0YXJ0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWxlZ2F0ZS5vbkdhbWVTdGFydGVkKGluZm8pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIHN0YXJ0KCkge1xyXG4gICAgICAgIHN1cGVyLnN0YXJ0KCk7XHJcbiAgICAgICAgb3ZlcndvbGYuZ2FtZXMub25HYW1lSW5mb1VwZGF0ZWQuYWRkTGlzdGVuZXIodGhpcy5vbkdhbWVJbmZvVXBkYXRlZCk7XHJcbiAgICAgICAgb3ZlcndvbGYuZ2FtZXMuZ2V0UnVubmluZ0dhbWVJbmZvKHRoaXMub25SdW5uaW5nR2FtZUluZm8pO1xyXG4gICAgfVxyXG4gICAgc3RvcCgpIHtcclxuICAgICAgICBvdmVyd29sZi5nYW1lcy5vbkdhbWVJbmZvVXBkYXRlZC5yZW1vdmVMaXN0ZW5lcih0aGlzLm9uR2FtZUluZm9VcGRhdGVkKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLk9XR2FtZUxpc3RlbmVyID0gT1dHYW1lTGlzdGVuZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuT1dHYW1lc0V2ZW50cyA9IHZvaWQgMDtcclxuY29uc3QgdGltZXJfMSA9IHJlcXVpcmUoXCIuL3RpbWVyXCIpO1xyXG5jbGFzcyBPV0dhbWVzRXZlbnRzIHtcclxuICAgIGNvbnN0cnVjdG9yKGRlbGVnYXRlLCByZXF1aXJlZEZlYXR1cmVzLCBmZWF0dXJlUmV0cmllcyA9IDEwKSB7XHJcbiAgICAgICAgdGhpcy5vbkluZm9VcGRhdGVzID0gKGluZm8pID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fZGVsZWdhdGUub25JbmZvVXBkYXRlcyhpbmZvLmluZm8pO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5vbk5ld0V2ZW50cyA9IChlKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2RlbGVnYXRlLm9uTmV3RXZlbnRzKGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5fZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuICAgICAgICB0aGlzLl9yZXF1aXJlZEZlYXR1cmVzID0gcmVxdWlyZWRGZWF0dXJlcztcclxuICAgICAgICB0aGlzLl9mZWF0dXJlUmV0cmllcyA9IGZlYXR1cmVSZXRyaWVzO1xyXG4gICAgfVxyXG4gICAgYXN5bmMgZ2V0SW5mbygpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgb3ZlcndvbGYuZ2FtZXMuZXZlbnRzLmdldEluZm8ocmVzb2x2ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBzZXRSZXF1aXJlZEZlYXR1cmVzKCkge1xyXG4gICAgICAgIGxldCB0cmllcyA9IDEsIHJlc3VsdDtcclxuICAgICAgICB3aGlsZSAodHJpZXMgPD0gdGhpcy5fZmVhdHVyZVJldHJpZXMpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBvdmVyd29sZi5nYW1lcy5ldmVudHMuc2V0UmVxdWlyZWRGZWF0dXJlcyh0aGlzLl9yZXF1aXJlZEZlYXR1cmVzLCByZXNvbHZlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzZXRSZXF1aXJlZEZlYXR1cmVzKCk6IHN1Y2Nlc3M6ICcgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwsIDIpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAocmVzdWx0LnN1cHBvcnRlZEZlYXR1cmVzLmxlbmd0aCA+IDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF3YWl0IHRpbWVyXzEuVGltZXIud2FpdCgzMDAwKTtcclxuICAgICAgICAgICAgdHJpZXMrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdzZXRSZXF1aXJlZEZlYXR1cmVzKCk6IGZhaWx1cmUgYWZ0ZXIgJyArIHRyaWVzICsgJyB0cmllcycgKyBKU09OLnN0cmluZ2lmeShyZXN1bHQsIG51bGwsIDIpKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZWdpc3RlckV2ZW50cygpIHtcclxuICAgICAgICB0aGlzLnVuUmVnaXN0ZXJFdmVudHMoKTtcclxuICAgICAgICBvdmVyd29sZi5nYW1lcy5ldmVudHMub25JbmZvVXBkYXRlczIuYWRkTGlzdGVuZXIodGhpcy5vbkluZm9VcGRhdGVzKTtcclxuICAgICAgICBvdmVyd29sZi5nYW1lcy5ldmVudHMub25OZXdFdmVudHMuYWRkTGlzdGVuZXIodGhpcy5vbk5ld0V2ZW50cyk7XHJcbiAgICB9XHJcbiAgICB1blJlZ2lzdGVyRXZlbnRzKCkge1xyXG4gICAgICAgIG92ZXJ3b2xmLmdhbWVzLmV2ZW50cy5vbkluZm9VcGRhdGVzMi5yZW1vdmVMaXN0ZW5lcih0aGlzLm9uSW5mb1VwZGF0ZXMpO1xyXG4gICAgICAgIG92ZXJ3b2xmLmdhbWVzLmV2ZW50cy5vbk5ld0V2ZW50cy5yZW1vdmVMaXN0ZW5lcih0aGlzLm9uTmV3RXZlbnRzKTtcclxuICAgIH1cclxuICAgIGFzeW5jIHN0YXJ0KCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBbb3ctZ2FtZS1ldmVudHNdIFNUQVJUYCk7XHJcbiAgICAgICAgdGhpcy5yZWdpc3RlckV2ZW50cygpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMuc2V0UmVxdWlyZWRGZWF0dXJlcygpO1xyXG4gICAgICAgIGNvbnN0IHsgcmVzLCBzdGF0dXMgfSA9IGF3YWl0IHRoaXMuZ2V0SW5mbygpO1xyXG4gICAgICAgIGlmIChyZXMgJiYgc3RhdHVzID09PSAnc3VjY2VzcycpIHtcclxuICAgICAgICAgICAgdGhpcy5vbkluZm9VcGRhdGVzKHsgaW5mbzogcmVzIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0b3AoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtvdy1nYW1lLWV2ZW50c10gU1RPUGApO1xyXG4gICAgICAgIHRoaXMudW5SZWdpc3RlckV2ZW50cygpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuT1dHYW1lc0V2ZW50cyA9IE9XR2FtZXNFdmVudHM7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuT1dHYW1lcyA9IHZvaWQgMDtcclxuY2xhc3MgT1dHYW1lcyB7XHJcbiAgICBzdGF0aWMgZ2V0UnVubmluZ0dhbWVJbmZvKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBvdmVyd29sZi5nYW1lcy5nZXRSdW5uaW5nR2FtZUluZm8ocmVzb2x2ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgY2xhc3NJZEZyb21HYW1lSWQoZ2FtZUlkKSB7XHJcbiAgICAgICAgbGV0IGNsYXNzSWQgPSBNYXRoLmZsb29yKGdhbWVJZCAvIDEwKTtcclxuICAgICAgICByZXR1cm4gY2xhc3NJZDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBhc3luYyBnZXRSZWNlbnRseVBsYXllZEdhbWVzKGxpbWl0ID0gMykge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIW92ZXJ3b2xmLmdhbWVzLmdldFJlY2VudGx5UGxheWVkR2FtZXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKG51bGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG92ZXJ3b2xmLmdhbWVzLmdldFJlY2VudGx5UGxheWVkR2FtZXMobGltaXQsIHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdC5nYW1lcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGFzeW5jIGdldEdhbWVEQkluZm8oZ2FtZUNsYXNzSWQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgb3ZlcndvbGYuZ2FtZXMuZ2V0R2FtZURCSW5mbyhnYW1lQ2xhc3NJZCwgcmVzb2x2ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5PV0dhbWVzID0gT1dHYW1lcztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5PV0hvdGtleXMgPSB2b2lkIDA7XHJcbmNsYXNzIE9XSG90a2V5cyB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxyXG4gICAgc3RhdGljIGdldEhvdGtleVRleHQoaG90a2V5SWQsIGdhbWVJZCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuICAgICAgICAgICAgb3ZlcndvbGYuc2V0dGluZ3MuaG90a2V5cy5nZXQocmVzdWx0ID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaG90a2V5O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChnYW1lSWQgPT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG90a2V5ID0gcmVzdWx0Lmdsb2JhbHMuZmluZChoID0+IGgubmFtZSA9PT0gaG90a2V5SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc3VsdC5nYW1lcyAmJiByZXN1bHQuZ2FtZXNbZ2FtZUlkXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG90a2V5ID0gcmVzdWx0LmdhbWVzW2dhbWVJZF0uZmluZChoID0+IGgubmFtZSA9PT0gaG90a2V5SWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChob3RrZXkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGhvdGtleS5iaW5kaW5nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc29sdmUoJ1VOQVNTSUdORUQnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgb25Ib3RrZXlEb3duKGhvdGtleUlkLCBhY3Rpb24pIHtcclxuICAgICAgICBvdmVyd29sZi5zZXR0aW5ncy5ob3RrZXlzLm9uUHJlc3NlZC5hZGRMaXN0ZW5lcigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lm5hbWUgPT09IGhvdGtleUlkKVxyXG4gICAgICAgICAgICAgICAgYWN0aW9uKHJlc3VsdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0cy5PV0hvdGtleXMgPSBPV0hvdGtleXM7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuT1dMaXN0ZW5lciA9IHZvaWQgMDtcclxuY2xhc3MgT1dMaXN0ZW5lciB7XHJcbiAgICBjb25zdHJ1Y3RvcihkZWxlZ2F0ZSkge1xyXG4gICAgICAgIHRoaXMuX2RlbGVnYXRlID0gZGVsZWdhdGU7XHJcbiAgICB9XHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLk9XTGlzdGVuZXIgPSBPV0xpc3RlbmVyO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLk9XV2luZG93ID0gdm9pZCAwO1xyXG5jbGFzcyBPV1dpbmRvdyB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lID0gbnVsbCkge1xyXG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuX2lkID0gbnVsbDtcclxuICAgIH1cclxuICAgIGFzeW5jIHJlc3RvcmUoKSB7XHJcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGF0LmFzc3VyZU9idGFpbmVkKCk7XHJcbiAgICAgICAgICAgIGxldCBpZCA9IHRoYXQuX2lkO1xyXG4gICAgICAgICAgICBvdmVyd29sZi53aW5kb3dzLnJlc3RvcmUoaWQsIHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtyZXN0b3JlXSAtIGFuIGVycm9yIG9jY3VycmVkLCB3aW5kb3dJZD0ke2lkfSwgcmVhc29uPSR7cmVzdWx0LmVycm9yfWApO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIG1pbmltaXplKCkge1xyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgYXdhaXQgdGhhdC5hc3N1cmVPYnRhaW5lZCgpO1xyXG4gICAgICAgICAgICBsZXQgaWQgPSB0aGF0Ll9pZDtcclxuICAgICAgICAgICAgb3ZlcndvbGYud2luZG93cy5taW5pbWl6ZShpZCwgKCkgPT4geyB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIG1heGltaXplKCkge1xyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgYXdhaXQgdGhhdC5hc3N1cmVPYnRhaW5lZCgpO1xyXG4gICAgICAgICAgICBsZXQgaWQgPSB0aGF0Ll9pZDtcclxuICAgICAgICAgICAgb3ZlcndvbGYud2luZG93cy5tYXhpbWl6ZShpZCwgKCkgPT4geyB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGFzeW5jIGhpZGUoKSB7XHJcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGF0LmFzc3VyZU9idGFpbmVkKCk7XHJcbiAgICAgICAgICAgIGxldCBpZCA9IHRoYXQuX2lkO1xyXG4gICAgICAgICAgICBvdmVyd29sZi53aW5kb3dzLmhpZGUoaWQsICgpID0+IHsgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBjbG9zZSgpIHtcclxuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoYXQuYXNzdXJlT2J0YWluZWQoKTtcclxuICAgICAgICAgICAgbGV0IGlkID0gdGhhdC5faWQ7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2V0V2luZG93U3RhdGUoKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdC5zdWNjZXNzICYmXHJcbiAgICAgICAgICAgICAgICAocmVzdWx0LndpbmRvd19zdGF0ZSAhPT0gJ2Nsb3NlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmludGVybmFsQ2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZHJhZ01vdmUoZWxlbSkge1xyXG4gICAgICAgIGVsZW0uY2xhc3NOYW1lID0gZWxlbS5jbGFzc05hbWUgKyAnIGRyYWdnYWJsZSc7XHJcbiAgICAgICAgZWxlbS5vbm1vdXNlZG93biA9IGUgPT4ge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIG92ZXJ3b2xmLndpbmRvd3MuZHJhZ01vdmUodGhpcy5fbmFtZSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGFzeW5jIGdldFdpbmRvd1N0YXRlKCkge1xyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgYXdhaXQgdGhhdC5hc3N1cmVPYnRhaW5lZCgpO1xyXG4gICAgICAgICAgICBsZXQgaWQgPSB0aGF0Ll9pZDtcclxuICAgICAgICAgICAgb3ZlcndvbGYud2luZG93cy5nZXRXaW5kb3dTdGF0ZShpZCwgcmVzb2x2ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0Q3VycmVudEluZm8oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIG92ZXJ3b2xmLndpbmRvd3MuZ2V0Q3VycmVudFdpbmRvdyhyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQud2luZG93KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBvYnRhaW4oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY2IgPSByZXMgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcyAmJiByZXMuc3RhdHVzID09PSBcInN1Y2Nlc3NcIiAmJiByZXMud2luZG93ICYmIHJlcy53aW5kb3cuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pZCA9IHJlcy53aW5kb3cuaWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9uYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX25hbWUgPSByZXMud2luZG93Lm5hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLndpbmRvdyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pZCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fbmFtZSkge1xyXG4gICAgICAgICAgICAgICAgb3ZlcndvbGYud2luZG93cy5nZXRDdXJyZW50V2luZG93KGNiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG92ZXJ3b2xmLndpbmRvd3Mub2J0YWluRGVjbGFyZWRXaW5kb3codGhpcy5fbmFtZSwgY2IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBhc3N1cmVPYnRhaW5lZCgpIHtcclxuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoYXQub2J0YWluKCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBhc3luYyBpbnRlcm5hbENsb3NlKCkge1xyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBhd2FpdCB0aGF0LmFzc3VyZU9idGFpbmVkKCk7XHJcbiAgICAgICAgICAgIGxldCBpZCA9IHRoYXQuX2lkO1xyXG4gICAgICAgICAgICBvdmVyd29sZi53aW5kb3dzLmNsb3NlKGlkLCByZXMgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcyAmJiByZXMuc3VjY2VzcylcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlcyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydHMuT1dXaW5kb3cgPSBPV1dpbmRvdztcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5UaW1lciA9IHZvaWQgMDtcclxuY2xhc3MgVGltZXIge1xyXG4gICAgY29uc3RydWN0b3IoZGVsZWdhdGUsIGlkKSB7XHJcbiAgICAgICAgdGhpcy5fdGltZXJJZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVUaW1lckV2ZW50ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl90aW1lcklkID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5fZGVsZWdhdGUub25UaW1lcih0aGlzLl9pZCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLl9kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xyXG4gICAgICAgIHRoaXMuX2lkID0gaWQ7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgYXN5bmMgd2FpdChpbnRlcnZhbEluTVMpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgaW50ZXJ2YWxJbk1TKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHN0YXJ0KGludGVydmFsSW5NUykge1xyXG4gICAgICAgIHRoaXMuc3RvcCgpO1xyXG4gICAgICAgIHRoaXMuX3RpbWVySWQgPSBzZXRUaW1lb3V0KHRoaXMuaGFuZGxlVGltZXJFdmVudCwgaW50ZXJ2YWxJbk1TKTtcclxuICAgIH1cclxuICAgIHN0b3AoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3RpbWVySWQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcklkKTtcclxuICAgICAgICB0aGlzLl90aW1lcklkID0gbnVsbDtcclxuICAgIH1cclxufVxyXG5leHBvcnRzLlRpbWVyID0gVGltZXI7XHJcbiIsImltcG9ydCB7IE9XV2luZG93IH0gZnJvbSBcIkBvdmVyd29sZi9vdmVyd29sZi1hcGktdHNcIjtcblxuLy8gQSBiYXNlIGNsYXNzIGZvciB0aGUgYXBwJ3MgZm9yZWdyb3VuZCB3aW5kb3dzLlxuLy8gU2V0cyB0aGUgbW9kYWwgYW5kIGRyYWcgYmVoYXZpb3JzLCB3aGljaCBhcmUgc2hhcmVkIGFjY3Jvc3MgdGhlIGRlc2t0b3AgYW5kIGluLWdhbWUgd2luZG93cy5cbmV4cG9ydCBjbGFzcyBBcHBXaW5kb3cge1xuICBwcm90ZWN0ZWQgY3VycldpbmRvdzogT1dXaW5kb3c7XG4gIHByb3RlY3RlZCBtYWluV2luZG93OiBPV1dpbmRvdztcbiAgcHJvdGVjdGVkIG1heGltaXplZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHdpbmRvd05hbWUpIHtcbiAgICB0aGlzLm1haW5XaW5kb3cgPSBuZXcgT1dXaW5kb3coJ2JhY2tncm91bmQnKTtcbiAgICB0aGlzLmN1cnJXaW5kb3cgPSBuZXcgT1dXaW5kb3cod2luZG93TmFtZSk7XG5cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG9zZUJ1dHRvbicpO1xuICAgIGNvbnN0IG1heGltaXplQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21heGltaXplQnV0dG9uJyk7XG4gICAgY29uc3QgbWluaW1pemVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWluaW1pemVCdXR0b24nKTtcblxuICAgIGNvbnN0IGhlYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoZWFkZXInKTtcblxuICAgIHRoaXMuc2V0RHJhZyhoZWFkZXIpO1xuXG4gICAgY2xvc2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICB0aGlzLm1haW5XaW5kb3cuY2xvc2UoKTtcbiAgICB9KTtcblxuICAgIG1pbmltaXplQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGhpcy5jdXJyV2luZG93Lm1pbmltaXplKCk7XG4gICAgfSk7XG5cbiAgICBtYXhpbWl6ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5tYXhpbWl6ZWQpIHtcbiAgICAgICAgdGhpcy5jdXJyV2luZG93Lm1heGltaXplKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmN1cnJXaW5kb3cucmVzdG9yZSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1heGltaXplZCA9ICF0aGlzLm1heGltaXplZDtcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRXaW5kb3dTdGF0ZSgpIHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jdXJyV2luZG93LmdldFdpbmRvd1N0YXRlKCk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNldERyYWcoZWxlbSkge1xuICAgIHRoaXMuY3VycldpbmRvdy5kcmFnTW92ZShlbGVtKTtcbiAgfVxufVxuIiwiZXhwb3J0IGNvbnN0IGtHYW1lc0ZlYXR1cmVzID0gbmV3IE1hcDxudW1iZXIsIHN0cmluZ1tdPihbXG4gIC8vIExlYWd1ZSBvZiBMZWdlbmRzXG4gIFtcbiAgICA1NDI2LFxuICAgIFtcbiAgICAgICdsaXZlX2NsaWVudF9kYXRhJyxcbiAgICAgICdtYXRjaFN0YXRlJyxcbiAgICAgICdtYXRjaF9pbmZvJyxcbiAgICAgICdkZWF0aCcsXG4gICAgICAncmVzcGF3bicsXG4gICAgICAnYWJpbGl0aWVzJyxcbiAgICAgICdraWxsJyxcbiAgICAgICdhc3Npc3QnLFxuICAgICAgJ2dvbGQnLFxuICAgICAgJ21pbmlvbnMnLFxuICAgICAgJ3N1bW1vbmVyX2luZm8nLFxuICAgICAgJ2dhbWVNb2RlJyxcbiAgICAgICd0ZWFtcycsXG4gICAgICAnbGV2ZWwnLFxuICAgICAgJ2Fubm91bmNlcicsXG4gICAgICAnY291bnRlcnMnLFxuICAgICAgJ2RhbWFnZScsXG4gICAgICAnaGVhbCdcbiAgICBdXG4gIF1cbl0pO1xuXG5leHBvcnQgY29uc3Qga0dhbWVDbGFzc0lkcyA9IEFycmF5LmZyb20oa0dhbWVzRmVhdHVyZXMua2V5cygpKTtcblxuZXhwb3J0IGNvbnN0IGtXaW5kb3dOYW1lcyA9IHtcbiAgaW5HYW1lOiAnaW5fZ2FtZScsXG4gIGRlc2t0b3A6ICdkZXNrdG9wJ1xufTtcblxuZXhwb3J0IGNvbnN0IGtIb3RrZXlzID0ge1xuICB0b2dnbGU6ICdzYW1wbGVfYXBwX3RzX3Nob3doaWRlJ1xufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGlmKF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0pIHtcblx0XHRyZXR1cm4gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiaW1wb3J0IHtcbiAgT1dHYW1lcyxcbiAgT1dHYW1lc0V2ZW50cyxcbiAgT1dIb3RrZXlzXG59IGZyb20gXCJAb3ZlcndvbGYvb3ZlcndvbGYtYXBpLXRzXCI7XG5cbmltcG9ydCB7IEFwcFdpbmRvdyB9IGZyb20gXCIuLi9BcHBXaW5kb3dcIjtcbmltcG9ydCB7IGtIb3RrZXlzLCBrV2luZG93TmFtZXMsIGtHYW1lc0ZlYXR1cmVzIH0gZnJvbSBcIi4uL2NvbnN0c1wiO1xuXG5pbXBvcnQgV2luZG93U3RhdGUgPSBvdmVyd29sZi53aW5kb3dzLldpbmRvd1N0YXRlRXg7XG5cbi8vIFRoZSB3aW5kb3cgZGlzcGxheWVkIGluLWdhbWUgd2hpbGUgYSBnYW1lIGlzIHJ1bm5pbmcuXG4vLyBJdCBsaXN0ZW5zIHRvIGFsbCBpbmZvIGV2ZW50cyBhbmQgdG8gdGhlIGdhbWUgZXZlbnRzIGxpc3RlZCBpbiB0aGUgY29uc3RzLnRzIGZpbGVcbi8vIGFuZCB3cml0ZXMgdGhlbSB0byB0aGUgcmVsZXZhbnQgbG9nIHVzaW5nIDxwcmU+IHRhZ3MuXG4vLyBUaGUgd2luZG93IGFsc28gc2V0cyB1cCBDdHJsK0YgYXMgdGhlIG1pbmltaXplL3Jlc3RvcmUgaG90a2V5LlxuLy8gTGlrZSB0aGUgYmFja2dyb3VuZCB3aW5kb3csIGl0IGFsc28gaW1wbGVtZW50cyB0aGUgU2luZ2xldG9uIGRlc2lnbiBwYXR0ZXJuLlxuY2xhc3MgSW5HYW1lIGV4dGVuZHMgQXBwV2luZG93IHtcbiAgcHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlOiBJbkdhbWU7XG4gIHByaXZhdGUgX2dhbWVFdmVudHNMaXN0ZW5lcjogT1dHYW1lc0V2ZW50cztcbiAgcHJpdmF0ZSBfZXZlbnRzTG9nOiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBfaW5mb0xvZzogSFRNTEVsZW1lbnQ7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihrV2luZG93TmFtZXMuaW5HYW1lKTtcblxuICAgIHRoaXMuX2V2ZW50c0xvZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdldmVudHNMb2cnKTtcbiAgICB0aGlzLl9pbmZvTG9nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm9Mb2cnKTtcblxuICAgIHRoaXMuc2V0VG9nZ2xlSG90a2V5QmVoYXZpb3IoKTtcbiAgICB0aGlzLnNldFRvZ2dsZUhvdGtleVRleHQoKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaW5zdGFuY2UoKSB7XG4gICAgaWYgKCF0aGlzLl9pbnN0YW5jZSkge1xuICAgICAgdGhpcy5faW5zdGFuY2UgPSBuZXcgSW5HYW1lKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIHJ1bigpIHtcbiAgICBjb25zdCBnYW1lQ2xhc3NJZCA9IGF3YWl0IHRoaXMuZ2V0Q3VycmVudEdhbWVDbGFzc0lkKCk7XG5cbiAgICBjb25zdCBnYW1lRmVhdHVyZXMgPSBrR2FtZXNGZWF0dXJlcy5nZXQoZ2FtZUNsYXNzSWQpO1xuXG4gICAgaWYgKGdhbWVGZWF0dXJlcyAmJiBnYW1lRmVhdHVyZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9nYW1lRXZlbnRzTGlzdGVuZXIgPSBuZXcgT1dHYW1lc0V2ZW50cyhcbiAgICAgICAge1xuICAgICAgICAgIG9uSW5mb1VwZGF0ZXM6IHRoaXMub25JbmZvVXBkYXRlcy5iaW5kKHRoaXMpLFxuICAgICAgICAgIG9uTmV3RXZlbnRzOiB0aGlzLm9uTmV3RXZlbnRzLmJpbmQodGhpcylcbiAgICAgICAgfSxcbiAgICAgICAgZ2FtZUZlYXR1cmVzXG4gICAgICApO1xuXG4gICAgICB0aGlzLl9nYW1lRXZlbnRzTGlzdGVuZXIuc3RhcnQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uSW5mb1VwZGF0ZXMoaW5mbykge1xuICAgIHRoaXMubG9nTGluZSh0aGlzLl9pbmZvTG9nLCBpbmZvLCBmYWxzZSk7XG4gIH1cblxuICAvLyBTcGVjaWFsIGV2ZW50cyB3aWxsIGJlIGhpZ2hsaWdodGVkIGluIHRoZSBldmVudCBsb2dcbiAgcHJpdmF0ZSBvbk5ld0V2ZW50cyhlKSB7XG4gICAgY29uc3Qgc2hvdWxkSGlnaGxpZ2h0ID0gZS5ldmVudHMuc29tZShldmVudCA9PiB7XG4gICAgICBzd2l0Y2ggKGV2ZW50Lm5hbWUpIHtcbiAgICAgICAgY2FzZSAna2lsbCc6XG4gICAgICAgIGNhc2UgJ2RlYXRoJzpcbiAgICAgICAgY2FzZSAnYXNzaXN0JzpcbiAgICAgICAgY2FzZSAnbGV2ZWwnOlxuICAgICAgICBjYXNlICdtYXRjaFN0YXJ0JzpcbiAgICAgICAgY2FzZSAnbWF0Y2hfc3RhcnQnOlxuICAgICAgICBjYXNlICdtYXRjaEVuZCc6XG4gICAgICAgIGNhc2UgJ21hdGNoX2VuZCc6XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0pO1xuICAgIHRoaXMubG9nTGluZSh0aGlzLl9ldmVudHNMb2csIGUsIHNob3VsZEhpZ2hsaWdodCk7XG4gIH1cblxuICAvLyBEaXNwbGF5cyB0aGUgdG9nZ2xlIG1pbmltaXplL3Jlc3RvcmUgaG90a2V5IGluIHRoZSB3aW5kb3cgaGVhZGVyXG4gIHByaXZhdGUgYXN5bmMgc2V0VG9nZ2xlSG90a2V5VGV4dCgpIHtcbiAgICBjb25zdCBnYW1lQ2xhc3NJZCA9IGF3YWl0IHRoaXMuZ2V0Q3VycmVudEdhbWVDbGFzc0lkKCk7XG4gICAgY29uc3QgaG90a2V5VGV4dCA9IGF3YWl0IE9XSG90a2V5cy5nZXRIb3RrZXlUZXh0KGtIb3RrZXlzLnRvZ2dsZSwgZ2FtZUNsYXNzSWQpO1xuICAgIGNvbnN0IGhvdGtleUVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaG90a2V5Jyk7XG4gICAgaG90a2V5RWxlbS50ZXh0Q29udGVudCA9IGhvdGtleVRleHQ7XG4gIH1cblxuICAvLyBTZXRzIHRvZ2dsZUluR2FtZVdpbmRvdyBhcyB0aGUgYmVoYXZpb3IgZm9yIHRoZSBDdHJsK0YgaG90a2V5XG4gIHByaXZhdGUgYXN5bmMgc2V0VG9nZ2xlSG90a2V5QmVoYXZpb3IoKSB7XG4gICAgY29uc3QgdG9nZ2xlSW5HYW1lV2luZG93ID0gYXN5bmMgKFxuICAgICAgaG90a2V5UmVzdWx0OiBvdmVyd29sZi5zZXR0aW5ncy5ob3RrZXlzLk9uUHJlc3NlZEV2ZW50XG4gICAgKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgcHJlc3NlZCBob3RrZXkgZm9yICR7aG90a2V5UmVzdWx0Lm5hbWV9YCk7XG4gICAgICBjb25zdCBpbkdhbWVTdGF0ZSA9IGF3YWl0IHRoaXMuZ2V0V2luZG93U3RhdGUoKTtcblxuICAgICAgaWYgKGluR2FtZVN0YXRlLndpbmRvd19zdGF0ZSA9PT0gV2luZG93U3RhdGUuTk9STUFMIHx8XG4gICAgICAgIGluR2FtZVN0YXRlLndpbmRvd19zdGF0ZSA9PT0gV2luZG93U3RhdGUuTUFYSU1JWkVEKSB7XG4gICAgICAgIHRoaXMuY3VycldpbmRvdy5taW5pbWl6ZSgpO1xuICAgICAgfSBlbHNlIGlmIChpbkdhbWVTdGF0ZS53aW5kb3dfc3RhdGUgPT09IFdpbmRvd1N0YXRlLk1JTklNSVpFRCB8fFxuICAgICAgICBpbkdhbWVTdGF0ZS53aW5kb3dfc3RhdGUgPT09IFdpbmRvd1N0YXRlLkNMT1NFRCkge1xuICAgICAgICB0aGlzLmN1cnJXaW5kb3cucmVzdG9yZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIE9XSG90a2V5cy5vbkhvdGtleURvd24oa0hvdGtleXMudG9nZ2xlLCB0b2dnbGVJbkdhbWVXaW5kb3cpO1xuICB9XG5cbiAgLy8gQXBwZW5kcyBhIG5ldyBsaW5lIHRvIHRoZSBzcGVjaWZpZWQgbG9nXG4gIHByaXZhdGUgbG9nTGluZShsb2c6IEhUTUxFbGVtZW50LCBkYXRhLCBoaWdobGlnaHQpIHtcbiAgICBjb25zdCBsaW5lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncHJlJyk7XG4gICAgbGluZS50ZXh0Q29udGVudCA9IEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuXG4gICAgaWYgKGhpZ2hsaWdodCkge1xuICAgICAgbGluZS5jbGFzc05hbWUgPSAnaGlnaGxpZ2h0JztcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBzY3JvbGwgaXMgbmVhciBib3R0b21cbiAgICBjb25zdCBzaG91bGRBdXRvU2Nyb2xsID1cbiAgICAgIGxvZy5zY3JvbGxUb3AgKyBsb2cub2Zmc2V0SGVpZ2h0ID49IGxvZy5zY3JvbGxIZWlnaHQgLSAxMDtcblxuICAgIGxvZy5hcHBlbmRDaGlsZChsaW5lKTtcblxuICAgIGlmIChzaG91bGRBdXRvU2Nyb2xsKSB7XG4gICAgICBsb2cuc2Nyb2xsVG9wID0gbG9nLnNjcm9sbEhlaWdodDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldEN1cnJlbnRHYW1lQ2xhc3NJZCgpOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgICBjb25zdCBpbmZvID0gYXdhaXQgT1dHYW1lcy5nZXRSdW5uaW5nR2FtZUluZm8oKTtcblxuICAgIHJldHVybiAoaW5mbyAmJiBpbmZvLmlzUnVubmluZyAmJiBpbmZvLmNsYXNzSWQpID8gaW5mby5jbGFzc0lkIDogbnVsbDtcbiAgfVxufVxuXG5JbkdhbWUuaW5zdGFuY2UoKS5ydW4oKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=