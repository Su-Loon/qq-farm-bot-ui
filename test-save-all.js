const axios = require('axios');

async function testSaveAll() {
  try {
    // 先登录获取 token
    const loginResponse = await axios.post('http://localhost:3000/api/login', {
      password: 'admin'
    });
    
    if (!loginResponse.data.ok) {
      console.error('登录失败:', loginResponse.data.error);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('登录成功，获取到 token:', token);
    
    // 测试 save-all 端点
    const saveAllResponse = await axios.post('http://localhost:3000/api/settings/save-all', {
      plantingStrategy: 'preferred',
      preferredSeedId: 0,
      intervals: {
        farmMin: 2,
        farmMax: 2,
        friendMin: 10,
        friendMax: 10
      },
      friendQuietHours: {
        enabled: false,
        start: '23:00',
        end: '07:00'
      },
      automation: {
        farm: true,
        task: true,
        sell: true,
        friend: true,
        farm_push: true,
        land_upgrade: true,
        email: true,
        free_gifts: true,
        share_reward: true,
        vip_gift: true,
        month_card: true,
        open_server_gift: true,
        fertilizer_gift: false,
        fertilizer_buy: false,
        fertilizer: 'none',
        farm_water: true,
        farm_weed: true,
        farm_bug: true
      },
      fertilizerBuyReserveTickets: 0
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token
      }
    });
    
    console.log('保存到所有账号成功:', saveAllResponse.data);
  } catch (error) {
    console.error('测试失败:', error.response ? error.response.data : error.message);
  }
}

testSaveAll();
