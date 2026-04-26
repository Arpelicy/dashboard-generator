/**
 * 数据看板 - 数据中间层API模板
 * 
 * 功能：数据加载、筛选、排序、分页、统计、阈值判定
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// ==================== 配置区域（根据项目修改） ====================

// 数据文件路径
const DATA_PATH = path.join(__dirname, '..', 'data', 'data.json');

// 阈值配置（根据业务规则修改）
const THRESHOLDS = {
  // 示例：各指标的达标标准
  // metric1: 100,
  // metric2: 50,
  // ...
};

// 评级规则配置
const RATING_RULES = {
  // 示例：N项指标满足M项为某级别
  // excellent: { required: 7, total: 8 },
  // good: { required: 5, total: 8 },
};

// ==================== 数据加载 ====================

let dataCache = null;

function loadData() {
  if (dataCache) return dataCache;
  
  try {
    const rawData = fs.readFileSync(DATA_PATH, 'utf8');
    dataCache = JSON.parse(rawData);
    return dataCache;
  } catch (error) {
    console.error('数据加载失败:', error);
    return null;
  }
}

// ==================== 业务逻辑 ====================

/**
 * 计算评级
 * @param {Object} item - 数据项
 * @returns {string} - 评级结果
 */
function calculateRating(item) {
  // 根据阈值判定各项指标是否达标
  const passCount = Object.keys(THRESHOLDS).filter(key => {
    return item[key] >= THRESHOLDS[key];
  }).length;
  
  // 根据规则返回评级
  if (passCount >= RATING_RULES.excellent.required) return 'excellent';
  if (passCount >= RATING_RULES.good.required) return 'good';
  return 'normal';
}

/**
 * 筛选数据
 * @param {Array} data - 数据数组
 * @param {Object} filters - 筛选条件
 * @returns {Array} - 筛选后的数据
 */
function filterData(data, filters) {
  let result = [...data];
  
  // 按级别筛选
  if (filters.level && filters.level !== 'all') {
    result = result.filter(item => item.level === filters.level);
  }
  
  // 按关键词搜索
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(item => 
      item.name?.toLowerCase().includes(searchLower) ||
      item.id?.toLowerCase().includes(searchLower)
    );
  }
  
  // 按时间/周期筛选
  if (filters.period) {
    result = result.filter(item => item.period === filters.period);
  }
  
  return result;
}

/**
 * 排序数据
 * @param {Array} data - 数据数组
 * @param {string} sortField - 排序字段
 * @param {string} sortOrder - 排序方向 asc/desc
 * @returns {Array} - 排序后的数据
 */
function sortData(data, sortField, sortOrder = 'desc') {
  if (!sortField) return data;
  
  return [...data].sort((a, b) => {
    const aVal = a[sortField] || 0;
    const bVal = b[sortField] || 0;
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });
}

/**
 * 分页数据
 * @param {Array} data - 数据数组
 * @param {number} page - 页码
 * @param {number} pageSize - 每页条数
 * @returns {Object} - 分页结果
 */
function paginateData(data, page = 1, pageSize = 30) {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  const list = data.slice(offset, offset + pageSize);
  
  return {
    list,
    pagination: {
      page,
      pageSize,
      total,
      totalPages
    }
  };
}

/**
 * 计算统计数据
 * @param {Array} data - 数据数组
 * @returns {Object} - 统计结果
 */
function calculateStatistics(data) {
  const total = data.length;
  
  // 按级别统计
  const byLevel = {
    excellent: data.filter(item => item.level === 'excellent').length,
    good: data.filter(item => item.level === 'good').length,
    normal: data.filter(item => item.level === 'normal').length
  };
  
  // 计算占比
  const percentages = {
    excellent: ((byLevel.excellent / total) * 100).toFixed(1),
    good: ((byLevel.good / total) * 100).toFixed(1),
    normal: ((byLevel.normal / total) * 100).toFixed(1)
  };
  
  return {
    total,
    byLevel,
    percentages
  };
}

// ==================== API 路由 ====================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API服务运行正常' });
});

// 获取数据列表
app.get('/api/items', (req, res) => {
  try {
    const data = loadData();
    if (!data) {
      return res.status(500).json({ success: false, message: '数据加载失败' });
    }
    
    const { page = 1, pageSize = 30, level = 'all', search = '', sort = '' } = req.query;
    
    // 获取主数据
    let items = data.items || [];
    
    // 筛选
    items = filterData(items, { level, search });
    
    // 排序
    if (sort) {
      items = sortData(items, sort, 'desc');
    }
    
    // 分页
    const { list, pagination } = paginateData(items, parseInt(page), parseInt(pageSize));
    
    // 统计
    const stats = calculateStatistics(items);
    
    res.json({
      success: true,
      data: {
        list,
        pagination,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单项详情
app.get('/api/items/:id', (req, res) => {
  try {
    const data = loadData();
    if (!data) {
      return res.status(500).json({ success: false, message: '数据加载失败' });
    }
    
    const { id } = req.params;
    const item = (data.items || []).find(item => item.id === id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: '数据不存在' });
    }
    
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取统计数据
app.get('/api/statistics', (req, res) => {
  try {
    const data = loadData();
    if (!data) {
      return res.status(500).json({ success: false, message: '数据加载失败' });
    }
    
    const items = data.items || [];
    const stats = calculateStatistics(items);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取阈值配置
app.get('/api/thresholds', (req, res) => {
  res.json({ success: true, data: THRESHOLDS });
});

// 导出数据
app.get('/api/export', (req, res) => {
  try {
    const data = loadData();
    if (!data) {
      return res.status(500).json({ success: false, message: '数据加载失败' });
    }
    
    const { level = 'all', search = '' } = req.query;
    let items = filterData(data.items || [], { level, search });
    
    // 生成CSV
    const headers = Object.keys(items[0] || {});
    let csv = headers.join(',') + '\n';
    items.forEach(item => {
      csv += headers.map(h => item[h] || '').join(',') + '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=export_${Date.now()}.csv`);
    res.send('\ufeff' + csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 本地开发时启动服务器
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

// Vercel Serverless Handler
module.exports = app;
