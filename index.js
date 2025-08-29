/**
 * @fileoverview i-Repo DirectGateway API モック Express版
 * Express.js を使用したシンプルなREST API実装
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.API_TOKEN || 'gateway-pass';

// multerの設定（メモリストレージを使用）
const upload = multer({ storage: multer.memoryStorage() });

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// リクエストログミドルウェア
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

/**
 * 認証ミドルウェア
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            result: {
                code: -1,
                description: "認証が必要です"
            }
        });
    }

    const token = authHeader.substring(7);
    if (token !== API_TOKEN) {
        return res.status(403).json({
            result: {
                code: -1,
                description: "無効なトークンです"
            }
        });
    }

    next();
}

// すべてのエンドポイントに認証を適用
app.use(authenticate);

/**
 * 通常の値取得エンドポイント
 * GET /api/getValue または POST /api/getValue
 */
app.all('/api/getValue', (req, res) => {
    const queryParams = req.query;
    const body = req.body;

    console.log('getValue - Query:', queryParams);
    console.log('getValue - Body:', body);

    res.json({
        result: {
            code: 0,
            description: "データ取得成功"
        },
        apply: [
            {
                sheet: 1,
                cluster: 1,
                type: "SetFocus"
            },
            {
                sheet: 1,
                cluster: 1,
                type: "string",
                value: "クラスター１の値（固定値文字）"
            },
            {
                sheet: 1,
                cluster: 2,
                type: "string",
                value: "クラスター２の値（固定値文字）"
            },
            {
                sheet: 1,
                cluster: 3,
                type: "string",
                value: "クラスター３の値（固定値文字）"
            },
            {
                sheet: 1,
                cluster: 5,
                type: "image",
                value: "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVQYV2P8z8Dwn4EIwDiqkL4KAcmkBAKY7K7RAAAAAElFTkSuQmCC"
            },
            {
                sheet: 1,
                cluster: 6,
                type: "SetItemsToSelect",
                value: "PLCA",
                selectItems: [
                    {
                        item: "PLCA",
                        label: "設備 PLC-A",
                        selected: true
                    },
                    {
                        item: "PLCB",
                        label: "設備 PLC-B",
                        selected: false
                    }
                ]
            }
        ]
    });
});

/**
 * カスタムマスターのフィールド取得
 * GET /api/master/fields
 */
app.get('/api/master/fields', (req, res) => {
    console.log('getFields - Query:', req.query);

    res.json({
        result: {
            code: 0,
            remarks: ["商品フィールド取得成功"]
        },
        fields: [
            {
                no: 1,
                name: "product_id",
                type: "text",
                item: "product_id"
            },
            {
                no: 2,
                name: "product_name",
                type: "text",
                item: "product_name"
            },
            {
                no: 3,
                name: "category",
                type: "text",
                item: "category"
            },
            {
                no: 4,
                name: "price",
                type: "numeric",
                item: "price"
            },
            {
                no: 5,
                name: "stock_quantity",
                type: "numeric",
                item: "stock_quantity"
            },
            {
                no: 6,
                name: "is_active",
                type: "bool",
                item: "is_active"
            },
            {
                no: 7,
                name: "created_date",
                type: "date",
                item: "created_date"
            }
        ]
    });
});

/**
 * カスタムマスターのパラメータ取得
 * GET /api/master/params
 */
app.get('/api/master/params', (req, res) => {
    console.log('getParams - Query:', req.query);

    res.json({
        result: {
            code: 0,
            remarks: ["パラメータ取得成功"]
        },
        params: [
            {
                name: "product_id",
                type: "string"
            }
        ]
    });
});

/**
 * カスタムマスターのレコード取得
 * POST /api/master/getrecords
 */
app.post('/api/master/getrecords', upload.any(), (req, res) => {
    console.log('getRecords - Body:', req.body);

    // リクエストボディからproduct_idを取得
    let productId = null;
    
    // req.body.dataがJSON文字列として来る場合はパース
    if (req.body && req.body.data) {
        try {
            const parsedData = JSON.parse(req.body.data);
            // clustersの中からproduct_idを探す
            if (parsedData.clusters && Array.isArray(parsedData.clusters)) {
                const productIdCluster = parsedData.clusters.find(c => c.parameter === 'product_id');
                if (productIdCluster) {
                    productId = productIdCluster.value;
                }
            }
        } catch (e) {
            console.error('Failed to parse data:', e);
        }
    }
    console.log('Extracted productId:', productId);

    // サンプルデータ
    let records = [
        {
            product_id: '1001',
            product_name: '製品A',
            category: '電子部品',
            price: '15000',
            stock_quantity: '150',
            is_active: 'true',
            created_date: '2024/01/15'
        },
        {
            product_id: '1002',
            product_name: '製品B',
            category: '電子部品',
            price: '12000',
            stock_quantity: '80',
            is_active: 'true',
            created_date: '2024/02/10'
        },
        {
            product_id: '1003',
            product_name: '製品C',
            category: '機械部品',
            price: '5000',
            stock_quantity: '300',
            is_active: 'false',
            created_date: '2024/03/05'
        },
        {
            product_id: '1004',
            product_name: '製品D',
            category: 'テストカテゴリ',
            price: '0',
            stock_quantity: '0',
            is_active: 'true',
            created_date: '2025/01/01'
        },
        {
            product_id: '1005',
            product_name: '製品E',
            category: '消耗品',
            price: '200',
            stock_quantity: '5000',
            is_active: 'true',
            created_date: '2024/04/01'
        }
    ];

    // product_idでフィルタリング
    if (productId) {
        //一致しなければすべて返す
        if (records.some(r => r.product_id === productId)) {
            records = records.filter(r => r.product_id === productId);
        } else {
            records = records;
        }
    }
    console.log('Filtered records count:', records.length);

    // カスタムマスター返却形式に整形
    const customMasterRecords = records.map(r => ({
        fields: [
            { no: 1, value: r.product_id },
            { no: 2, value: r.product_name },
            { no: 3, value: r.category },
            { no: 4, value: r.price },
            { no: 5, value: r.stock_quantity },
            { no: 6, value: r.is_active },
            { no: 7, value: r.created_date }
        ]
    }));

    const response = {
        result: {
            code: 0,
            remarks: [
                'レコード取得成功',
                `${records.length}件のレコードを取得`
            ]
        },
        fields: [
            { no: 1, name: 'product_id',     type: 'text',    item: 'product_id' },
            { no: 2, name: 'product_name',   type: 'text',    item: 'product_name' },
            { no: 3, name: 'category',       type: 'text',    item: 'category' },
            { no: 4, name: 'price',          type: 'numeric', item: 'price' },
            { no: 5, name: 'stock_quantity', type: 'numeric', item: 'stock_quantity' },
            { no: 6, name: 'is_active',      type: 'bool',    item: 'is_active' },
            { no: 7, name: 'created_date',   type: 'date',    item: 'created_date' }
        ],
        defaultRecord: {
            fields: [
                { no: 1, value: '1001' },
                { no: 2, value: '製品A' },
                { no: 3, value: '電子部品' },
                { no: 4, value: '15000' },
                { no: 5, value: '150' },
                { no: 6, value: 'true' },
                { no: 7, value: '2024/01/15' }
            ]
        },
        records: customMasterRecords
    };

    console.log('Response records count:', response.records.length);
    res.json(response);
});


/**
 * 404エラーハンドラー
 */
app.use((req, res) => {
    res.status(404).json({
        result: {
            code: -1,
            description: `エンドポイントが見つかりません: ${req.path}`
        }
    });
});

/**
 * エラーハンドラー
 */
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        result: {
            code: -1,
            description: 'サーバーエラーが発生しました',
            error: err.message
        }
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`i-Repo DirectGateway API Mock Server`);
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API Token: ${API_TOKEN}`);
    console.log('\nAvailable endpoints:');
    console.log('  GET/POST /api/getValue - 通常の値取得');
    console.log('  GET      /api/master/fields - フィールド取得');
    console.log('  GET      /api/master/params - パラメータ取得');
    console.log('  POST     /api/master/getrecords - レコード取得');
});
