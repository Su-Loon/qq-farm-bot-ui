/**
 * 好友访问日志管理
 */

const { getDataFile, ensureDataDir } = require('../config/runtime-paths');
const { readJsonFile, writeJsonFileAtomic } = require('../services/json-db');

const LOG_FILE = getDataFile('friend-log.json');
const MAX_LOGS = 10000; // 最大日志数量

let logData = [];

// 加载日志数据
function loadLogData() {
    ensureDataDir();
    try {
        const data = readJsonFile(LOG_FILE, () => []);
        if (Array.isArray(data)) {
            logData = data;
        }
    } catch (e) {
        console.error('加载好友访问日志失败:', e.message);
        logData = [];
    }
}

// 保存日志数据
function saveLogData() {
    ensureDataDir();
    try {
        // 限制日志数量
        if (logData.length > MAX_LOGS) {
            logData = logData.slice(-MAX_LOGS);
        }
        writeJsonFileAtomic(LOG_FILE, logData);
    } catch (e) {
        console.error('保存好友访问日志失败:', e.message);
    }
}

// 记录好友访问日志
function recordFriendLog(friendGid, friendName, actions, timestamp = Date.now()) {
    const logEntry = {
        timestamp,
        friendGid: String(friendGid),
        friendName,
        actions,
    };
    logData.unshift(logEntry); // 最新的日志放在前面
    saveLogData();
}

// 获取好友访问日志
function getFriendLogs(limit = 100) {
    return logData.slice(0, limit);
}

// 清除好友访问日志
function clearFriendLogs() {
    logData = [];
    saveLogData();
}

// 初始化加载
loadLogData();

module.exports = {
    recordFriendLog,
    getFriendLogs,
    clearFriendLogs,
};