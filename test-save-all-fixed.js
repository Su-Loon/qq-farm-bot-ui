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
    
    // 获取账号列表
    const accountsResponse = await axios.get('http://localhost:3000/api/accounts', {
      headers: {
        'x-admin-token': token
      }
    });
    
    if (!accountsResponse.data.ok) {
      console.error('获取账号列表失败:', accountsResponse.data.error);
      return;
    }
    
    const accounts = accountsResponse.data.data.accounts;
    console.log('账号列表:', accounts);
    
    if (accounts.length < 2) {
      console.log('需要至少两个账号来测试保存到所有账号功能');
      return;
    }
    
    // 获取第一个账号的当前配置
    const firstAccountId = accounts[0].id;
    const firstAccountConfigResponse = await axios.get('http://localhost:3000/api/settings', {
      headers: {
        'x-admin-token': token,
        'x-account-id': firstAccountId
      }
    });
    
    if (!firstAccountConfigResponse.data.ok) {
      console.error('获取第一个账号配置失败:', firstAccountConfigResponse.data.error);
      return;
    }
    
    const firstAccountConfig = firstAccountConfigResponse.data.data;
    console.log('第一个账号当前配置:', firstAccountConfig);
    
    // 修改配置
    const newConfig = {
      ...firstAccountConfig,
      automation: {
        ...firstAccountConfig.automation,
        farm_water: !firstAccountConfig.automation.farm_water,
        farm_weed: !firstAccountConfig.automation.farm_weed,
        farm_bug: !firstAccountConfig.automation.farm_bug
      }
    };
    
    console.log('准备保存的新配置:', newConfig);
    
    // 保存配置到所有账号
    const saveAllResponse = await axios.post('http://localhost:3000/api/settings/save-all', newConfig, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token
      }
    });
    
    if (!saveAllResponse.data.ok) {
      console.error('保存到所有账号失败:', saveAllResponse.data.error);
      return;
    }
    
    console.log('保存到所有账号成功:', saveAllResponse.data);
    
    // 检查第二个账号的配置是否已更新
    const secondAccountId = accounts[1].id;
    const secondAccountConfigResponse = await axios.get('http://localhost:3000/api/settings', {
      headers: {
        'x-admin-token': token,
        'x-account-id': secondAccountId
      }
    });
    
    if (!secondAccountConfigResponse.data.ok) {
      console.error('获取第二个账号配置失败:', secondAccountConfigResponse.data.error);
      return;
    }
    
    const secondAccountConfig = secondAccountConfigResponse.data.data;
    console.log('第二个账号更新后的配置:', secondAccountConfig);
    
    // 验证配置是否一致
    const configsMatch = (
      newConfig.automation.farm_water === secondAccountConfig.automation.farm_water &&
      newConfig.automation.farm_weed === secondAccountConfig.automation.farm_weed &&
      newConfig.automation.farm_bug === secondAccountConfig.automation.farm_bug
    );
    
    if (configsMatch) {
      console.log('✅ 测试成功：第二个账号的配置已成功更新');
    } else {
      console.log('❌ 测试失败：第二个账号的配置未更新');
    }
    
  } catch (error) {
    console.error('测试失败:', error.response ? error.response.data : error.message);
  }
}

// 安装 axios 并运行测试
const { execSync } = require('child_process');
try {
  console.log('正在安装 axios...');
  execSync('npm install axios', { stdio: 'inherit' });
  console.log('axios 安装成功，开始测试...');
  testSaveAll();
} catch (error) {
  console.error('安装 axios 失败:', error.message);
}
