/**
 * 得理 API 测试脚本 - 尝试不同的签名方式
 * 运行: node test-deli-api.mjs
 */

import crypto from 'crypto';

const DELI_API_BASE = 'https://openapi.delilegal.com';
const APPID = 'QthdBErlyaYvyXul';
const SECRET = 'EC5D455E6BD348CE8E18BE05926D2EBE';

// 签名方式1: appid + timestamp + secret + 参数
function generateSign1(params, appid, timestamp, secret) {
  let signStr = '';
  signStr += 'appid' + appid;
  signStr += 'timestamp' + timestamp;
  signStr += 'secret' + secret;
  
  const sortedKeys = Object.keys(params).filter(k => !['sign', 'appid', 'timestamp'].includes(k)).sort();
  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      signStr += key + value;
    }
  }
  
  console.log('方式1签名字符串:', signStr);
  return crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
}

// 签名方式2: 只拼接业务参数
function generateSign2(params, appid, timestamp, secret) {
  let signStr = appid + timestamp + secret;
  
  const sortedKeys = Object.keys(params).filter(k => !['sign', 'appid', 'timestamp'].includes(k)).sort();
  for (const key of sortedKeys) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      signStr += key + value;
    }
  }
  
  console.log('方式2签名字符串:', signStr);
  return crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
}

// 签名方式3: key=value&key=value 形式
function generateSign3(params, appid, timestamp, secret) {
  const allParams = { appid, timestamp, ...params };
  const sortedKeys = Object.keys(allParams).filter(k => k !== 'sign').sort();
  
  const paramStr = sortedKeys.map(k => `${k}=${allParams[k]}`).join('&');
  const signStr = paramStr + secret;
  
  console.log('方式3签名字符串:', signStr);
  return crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
}

// 测试请求
async function testRequest(signType, sign, requestBody) {
  console.log(`\n--- 测试签名方式${signType} ---`);
  console.log('请求体:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch(`${DELI_API_BASE}/api/qa/v3/search/queryListCase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();
    console.log('响应:', JSON.stringify(data, null, 2));
    
    if (data.success === true || data.code === 200) {
      console.log(`✅ 方式${signType} 成功！`);
      return true;
    }
  } catch (error) {
    console.error('请求失败:', error.message);
  }
  return false;
}

// 运行所有测试
async function runTests() {
  console.log('=== 得理 API 签名测试 ===\n');
  
  const timestamp = Date.now().toString();
  const keyword = '瑞幸咖啡 商标侵权';
  const businessParams = { keyword, page: 1, size: 3 };
  
  // 方式1
  const sign1 = generateSign1(businessParams, APPID, timestamp, SECRET);
  const success1 = await testRequest(1, sign1, {
    appid: APPID,
    timestamp,
    sign: sign1,
    ...businessParams
  });
  if (success1) return;
  
  // 方式2
  const sign2 = generateSign2(businessParams, APPID, timestamp, SECRET);
  const success2 = await testRequest(2, sign2, {
    appid: APPID,
    timestamp,
    sign: sign2,
    ...businessParams
  });
  if (success2) return;
  
  // 方式3
  const sign3 = generateSign3(businessParams, APPID, timestamp, SECRET);
  const success3 = await testRequest(3, sign3, {
    appid: APPID,
    timestamp,
    sign: sign3,
    ...businessParams
  });
  if (success3) return;
  
  console.log('\n❌ 所有签名方式都失败了');
  console.log('建议：联系得理客服获取正确的签名算法');
  console.log('电话：0755-26907610');
  console.log('邮箱：admin@delilegal.com');
}

runTests();
