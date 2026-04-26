# Dashboard Generator Skill

A skill for automatically generating data dashboards with API layer and visualization.

输入数据 + 业务规则，自动生成可交互的数据看板网站，一键部署到云端

适合人群


产品/运营/分析师/销售：有数据，需要快速出可视化界面给老板或客户看

创业者：需要快速验证数据产品的原型

学生：毕业设计、课程作业需要数据可视化展示

典型场景

"我有5000条供应商数据，想做个评级看板"

"我想做一个销售数据大屏，支持按月份筛选"

"这堆Excel数据想变成网页给别人看"

## Features

- **Data Middle Layer**: Automatically builds API layer with filtering, sorting, pagination
- **Frontend Dashboard**: Interactive visualization with charts, tables, and statistics
- **One-Click Deploy**: Deploy to Vercel with zero configuration
- **Multi-Dimension Analysis**: Support for multiple periods, categories, and metrics

## Trigger Words

数据看板、可视化看板、数据大屏、dashboard、看板生成、数据中间层、评级系统、分层看板

## Use Cases

1. **Business Data Dashboard**: Sales, operations, finance data visualization
2. **Rating/Classification System**: Customer grading, supplier evaluation, risk scoring
3. **Period Comparison**: YoY/MoM data analysis
4. **Rapid Prototyping**: Quick visualization for existing data

## Installation

Copy the skill folder to your  skills directory:

```
{Skill install directory}/dashboard-generator/
```

Or install via skill marketplace (coming soon).

## Usage

Simply describe your dashboard requirements:

> 帮我生成一个供应商评级看板，数据在 data/suppliers.json，有5000条记录。需要根据6项指标评级，满足5项为A级，满足4项为B级，其他为C级。主题色用蓝色，部署到Vercel。

The skill will:
1. Analyze your data structure
2. Generate API layer with business logic
3. Create interactive frontend dashboard
4. Deploy to cloud and return URL

## Templates

| File | Description |
|------|-------------|
| `api-template.js` | Express API with filtering, sorting, pagination, statistics |
| `dashboard-template.html` | Frontend dashboard with charts and tables |
| `vercel.json` | Vercel deployment configuration |
| `package.json` | Node.js dependencies |

## Output Structure

```
{project-name}/
├── api/
│   └── index.js          # Data middle layer API
├── data/
│   └── data.json         # Data file
├── public/
│   └── index.html        # Frontend dashboard
├── package.json          # Dependencies
├── vercel.json           # Vercel config
└── README.md             # Project documentation
```

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JS + Chart.js
- **Deploy**: Vercel Serverless
- **Data Storage**: JSON file

## License

MIT License

