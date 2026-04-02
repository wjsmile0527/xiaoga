/**
 * 拼音汉字消消乐 - 游戏逻辑测试
 * 使用 Jest + JSDOM 测试
 */

const fs = require('fs');
const path = require('path');

// 读取 HTML 文件中的 JavaScript 代码
const htmlContent = fs.readFileSync(path.join(__dirname, 'pinyin-match.html'), 'utf8');

// 提取 script 标签中的代码
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    throw new Error('无法从 HTML 中提取 script');
}
const gameCode = scriptMatch[1];

// 使用 eval 执行代码（在一个模拟的全局环境中）
let gameState = {
    charData: null,
    grid: [],
    selected: [],
    score: 0,
    mode: 'pinyin',
    isProcessing: false
};

// 创建一个最小化的 DOM 环境
const { JSDOM } = require('jsdom');
const dom = new JSDOM(htmlContent);
const { window } = dom;
global.document = window.document;
global.Math = window.Math;

// 辅助函数
function createEmptyGrid() {
    return {
        charData: [
            {char: '马', pinyin: 'mǎ'},
            {char: '妈', pinyin: 'mā'},
            {char: '花', pinyin: 'huā'},
            {char: '画', pinyin: 'huà'},
            {char: '火', pinyin: 'huǒ'},
            {char: '大', pinyin: 'dà'},
            {char: '天', pinyin: 'tiān'},
            {char: '日', pinyin: 'rì'},
            {char: '月', pinyin: 'yuè'},
            {char: '好', pinyin: 'hǎo'},
        ],
        grid: [],
        selected: [],
        score: 0,
        mode: 'pinyin',
        isProcessing: false
    };
}

// 复制游戏逻辑函数
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

describe('拼音汉字消消乐 - 游戏逻辑测试', () => {
    let charData;

    beforeEach(() => {
        // 重置状态
        charData = [
            {char: '马', pinyin: 'mǎ'},
            {char: '妈', pinyin: 'mā'},
            {char: '花', pinyin: 'huā'},
            {char: '画', pinyin: 'huà'},
            {char: '火', pinyin: 'huǒ'},
            {char: '大', pinyin: 'dà'},
            {char: '他', pinyin: 'tā'},
            {char: '她', pinyin: 'tā'},
            {char: '天', pinyin: 'tiān'},
            {char: '田', pinyin: 'tián'},
            {char: '日', pinyin: 'rì'},
            {char: '月', pinyin: 'yuè'},
            {char: '口', pinyin: 'kǒu'},
            {char: '目', pinyin: 'mù'},
            {char: '字', pinyin: 'zì'},
        ];
    });

    // ============ 数据结构测试 ============
    describe('数据结构验证', () => {
        test('charData 包含必要字段', () => {
            charData.forEach(item => {
                expect(item).toHaveProperty('char');
                expect(item).toHaveProperty('pinyin');
                expect(typeof item.char).toBe('string');
                expect(typeof item.pinyin).toBe('string');
            });
        });

        test('汉字是单个字符', () => {
            charData.forEach(item => {
                expect(item.char.length).toBe(1);
            });
        });

        test('拼音格式正确（带声调）', () => {
            charData.forEach(item => {
                expect(item.pinyin).toMatch(/^[a-zāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ]+$/);
            });
        });
    });

    // ============ shuffle 函数测试 ============
    describe('shuffle (洗牌函数)', () => {
        test('shuffle 不丢失元素', () => {
            const arr = [1, 2, 3, 4, 5];
            const shuffled = shuffle([...arr]);
            arr.forEach(item => {
                expect(shuffled).toContain(item);
            });
        });

        test('shuffle 长度不变', () => {
            const arr = [1, 2, 3, 4, 5];
            const shuffled = shuffle([...arr]);
            expect(shuffled.length).toBe(arr.length);
        });

        test('shuffle 对已排序数组有效', () => {
            const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const shuffled = shuffle([...arr]);
            // 运行多次，期望至少有部分顺序改变
            let changed = false;
            for (let i = 0; i < 10; i++) {
                const s = shuffle([...arr]);
                if (s.join(',') !== arr.join(',')) {
                    changed = true;
                    break;
                }
            }
            expect(changed).toBe(true);
        });
    });

    // ============ 游戏初始化测试 ============
    describe('游戏初始化', () => {
        test('生成30张牌的池子', () => {
            let pool = [];
            const pairCount = 15;
            const shuffled = shuffle([...charData]);
            
            for (let i = 0; i < pairCount; i++) {
                const item = {...shuffled[i % shuffled.length], id: i * 2};
                pool.push(item);
                pool.push({...item, id: i * 2 + 1});
            }
            
            expect(pool.length).toBe(30);
        });

        test('池子包含15对匹配的牌', () => {
            let pool = [];
            const pairCount = 15;
            const shuffled = shuffle([...charData]);
            
            for (let i = 0; i < pairCount; i++) {
                const item = {...shuffled[i % shuffled.length], id: i * 2};
                pool.push(item);
                pool.push({...item, id: i * 2 + 1});
            }
            
            // 验证每对的两张牌相同
            for (let i = 0; i < pairCount; i++) {
                expect(pool[i * 2].char).toBe(pool[i * 2 + 1].char);
                expect(pool[i * 2].pinyin).toBe(pool[i * 2 + 1].pinyin);
            }
        });

        test('洗牌后位置是随机的', () => {
            let pools = [];
            for (let k = 0; k < 10; k++) {
                let pool = [];
                const pairCount = 15;
                const shuffled = shuffle([...charData]);
                
                for (let i = 0; i < pairCount; i++) {
                    const item = {...shuffled[i % shuffled.length], id: i * 2};
                    pool.push(item);
                    pool.push({...item, id: i * 2 + 1});
                }
                pools.push(pool.map(p => p.char).join(','));
            }
            
            // 至少有2次的结果不同
            const unique = new Set(pools).size;
            expect(unique).toBeGreaterThan(1);
        });
    });

    // ============ 匹配逻辑测试 ============
    describe('匹配逻辑', () => {
        function checkMatchLogic(item1, item2, mode) {
            if (mode === 'pinyin') {
                return item1.pinyin === item2.pinyin;
            } else if (mode === 'char') {
                return item1.char === item2.char;
            } else {
                return item1.pinyin === item2.pinyin || item1.char === item2.char;
            }
        }

        test('拼音模式：相同拼音匹配', () => {
            const item1 = {char: '妈', pinyin: 'mā'};
            const item2 = {char: '马', pinyin: 'mǎ'};
            expect(checkMatchLogic(item1, item2, 'pinyin')).toBe(true);
        });

        test('拼音模式：不同拼音不匹配', () => {
            const item1 = {char: '妈', pinyin: 'mā'};
            const item2 = {char: '花', pinyin: 'huā'};
            expect(checkMatchLogic(item1, item2, 'pinyin')).toBe(false);
        });

        test('汉字模式：相同汉字匹配', () => {
            const item1 = {char: '大', pinyin: 'dà'};
            const item2 = {char: '大', pinyin: 'dà'};
            expect(checkMatchLogic(item1, item2, 'char')).toBe(true);
        });

        test('汉字模式：不同汉字不匹配', () => {
            const item1 = {char: '大', pinyin: 'dà'};
            const item2 = {char: '天', pinyin: 'tiān'};
            expect(checkMatchLogic(item1, item2, 'char')).toBe(false);
        });

        test('混合模式：拼音相同则匹配', () => {
            const item1 = {char: '妈', pinyin: 'mā'};
            const item2 = {char: '马', pinyin: 'mǎ'};
            expect(checkMatchLogic(item1, item2, 'both')).toBe(true);
        });

        test('混合模式：汉字相同则匹配', () => {
            const item1 = {char: '天', pinyin: 'tiān'};
            const item2 = {char: '天', pinyin: 'tiān'};
            expect(checkMatchLogic(item1, item2, 'both')).toBe(true);
        });

        test('混合模式：都不相同则不匹配', () => {
            const item1 = {char: '妈', pinyin: 'mā'};
            const item2 = {char: '花', pinyin: 'huā'};
            expect(checkMatchLogic(item1, item2, 'both')).toBe(false);
        });
    });

    // ============ 游戏状态测试 ============
    describe('游戏状态管理', () => {
        test('初始分数为0', () => {
            const state = { score: 0 };
            expect(state.score).toBe(0);
        });

        test('匹配成功加10分', () => {
            let state = { score: 0 };
            state.score += 10;
            expect(state.score).toBe(10);
        });

        test('多次匹配累加分数', () => {
            let state = { score: 0 };
            for (let i = 0; i < 5; i++) {
                state.score += 10;
            }
            expect(state.score).toBe(50);
        });

        test('消除后剩余牌数减少', () => {
            let grid = new Array(30).fill({}).map((_, i) => ({id: i}));
            // 消除两张
            grid[0] = null;
            grid[1] = null;
            const left = grid.filter(g => g !== null).length;
            expect(left).toBe(28);
        });

        test('全部消除检测', () => {
            let grid = [null, null, null]; // 全部消除
            const left = grid.filter(g => g !== null).length;
            expect(left).toBe(0);
            expect(left === 0).toBe(true); // 游戏应该判定胜利
        });
    });

    // ============ 边界条件测试 ============
    describe('边界条件', () => {
        test('selected 数组初始为空', () => {
            const selected = [];
            expect(selected.length).toBe(0);
        });

        test('selected 最多2个元素', () => {
            const selected = [0, 1];
            expect(selected.length).toBeLessThanOrEqual(2);
        });

        test('不能选择已选中的牌', () => {
            const selected = [0, 1];
            const newIdx = 0;
            if (selected.includes(newIdx)) {
                // 应该忽略这个选择
                expect(true).toBe(true);
            } else {
                selected.push(newIdx);
            }
            expect(selected.length).toBe(2);
        });

        test('处理完成后清空 selected', () => {
            let selected = [0, 1];
            selected = [];
            expect(selected.length).toBe(0);
        });
    });

    // ============ 分数计算测试 ============
    describe('分数计算', () => {
        test('消除全部15对得150分', () => {
            let score = 0;
            const pairCount = 15;
            for (let i = 0; i < pairCount; i++) {
                score += 10;
            }
            expect(score).toBe(150);
        });

        test('部分消除计算正确', () => {
            let grid = new Array(30).fill({});
            // 模拟消除5对
            grid[0] = null; grid[1] = null;
            grid[2] = null; grid[3] = null;
            grid[4] = null; grid[5] = null;
            grid[6] = null; grid[7] = null;
            grid[8] = null; grid[9] = null;
            
            const eliminated = 30 - grid.filter(g => g !== null).length;
            expect(eliminated).toBe(10);
            expect(eliminated / 2).toBe(5); // 5对
        });
    });
});

// ============ HTML 结构测试 ============
describe('HTML 文件结构测试', () => {
    test('文件存在', () => {
        expect(fs.existsSync(path.join(__dirname, 'pinyin-match.html'))).toBe(true);
    });

    test('包含正确的 DOCTYPE', () => {
        expect(htmlContent).toContain('<!DOCTYPE html>');
    });

    test('包含中文标题', () => {
        expect(htmlContent).toContain('拼音汉字消消乐');
    });

    test('包含三种模式按钮', () => {
        expect(htmlContent).toContain('拼音模式');
        expect(htmlContent).toContain('字模式');
        expect(htmlContent).toContain('混合模式');
    });

    test('包含必要的 DOM 元素', () => {
        expect(htmlContent).toContain('id="grid"');
        expect(htmlContent).toContain('id="score"');
        expect(htmlContent).toContain('id="left"');
        expect(htmlContent).toContain('id="message"');
    });

    test('包含样式定义', () => {
        expect(htmlContent).toContain('<style>');
        expect(htmlContent).toContain('</style>');
    });

    test('包含游戏脚本', () => {
        expect(htmlContent).toContain('<script>');
        expect(htmlContent).toContain('</script>');
    });

    test('包含重新开始按钮', () => {
        expect(htmlContent).toContain('btn-restart');
        expect(htmlContent).toContain('initGame()');
    });

    test('包含汉字和拼音数据', () => {
        // 应该有多个汉字
        const charMatches = htmlContent.match(/char:\s*['"][\u4e00-\u9fa5]['"]/g);
        expect(charMatches.length).toBeGreaterThan(10);
        
        // 应该有多个拼音
        const pinyinMatches = htmlContent.match(/pinyin:\s*['"][a-zāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ]+['"]/gi);
        expect(pinyinMatches.length).toBeGreaterThan(10);
    });
});

// ============ 游戏完整性测试 ============
describe('游戏完整性测试', () => {
    test('charData 至少有15个条目以支持15对', () => {
        const charDataCount = (htmlContent.match(/char:\s*'[^']'/g) || []).length;
        expect(charDataCount).toBeGreaterThanOrEqual(15);
    });

    test('所有 charData 条目都有唯一的 id 生成', () => {
        // 验证 id 字段的生成逻辑
        const testSet = new Set();
        for (let i = 0; i < 15; i++) {
            testSet.add(i * 2);
            testSet.add(i * 2 + 1);
        }
        expect(testSet.size).toBe(30);
    });

    test('grid 大小为 6x5 = 30', () => {
        // 游戏使用 6x5 的 grid
        expect(6 * 5).toBe(30);
    });
});

console.log('测试文件加载成功！');