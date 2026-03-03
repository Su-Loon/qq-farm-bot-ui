/**
 * 好友成熟时间管理
 */

const { getDataFile, ensureDataDir } = require('../config/runtime-paths');
const { readJsonFile, writeJsonFileAtomic } = require('../services/json-db');

const MATURITY_FILE = getDataFile('friend-maturity.json');

let maturityData = {};

// 加载成熟时间数据
function loadMaturityData() {
    ensureDataDir();
    try {
        const data = readJsonFile(MATURITY_FILE, () => ({}));
        if (data && typeof data === 'object') {
            maturityData = data;
        }
    } catch (e) {
        console.error('加载好友成熟时间数据失败:', e.message);
        maturityData = {};
    }
}

// 保存成熟时间数据
function saveMaturityData() {
    ensureDataDir();
    try {
        writeJsonFileAtomic(MATURITY_FILE, maturityData);
    } catch (e) {
        console.error('保存好友成熟时间数据失败:', e.message);
    }
}

// 获取好友的最早成熟时间
function getFriendEarliestMaturity(friendGid) {
    const gid = String(friendGid);
    return maturityData[gid] || 0;
}

// 更新好友的最早成熟时间
function updateFriendMaturity(friendGid, earliestMaturity) {
    const gid = String(friendGid);
    maturityData[gid] = earliestMaturity;
    saveMaturityData();
}

// 清除好友的成熟时间记录
function clearFriendMaturity(friendGid) {
    const gid = String(friendGid);
    delete maturityData[gid];
    saveMaturityData();
}

// 清除所有好友的成熟时间记录
function clearAllMaturityData() {
    maturityData = {};
    saveMaturityData();
}

// 初始化加载
loadMaturityData();

module.exports = {
    getFriendEarliestMaturity,
    updateFriendMaturity,
    clearFriendMaturity,
    clearAllMaturityData,
};