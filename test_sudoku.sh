#!/bin/bash

# 数独游戏 自动化测试脚本

SUDOKU="./sudoku"
PASS=0
FAIL=0

echo "========================================"
echo "         数独游戏 自动化测试"
echo "========================================"

# 测试1: 新游戏
echo -e "\n[测试1] 新游戏功能 (n)"
OUTPUT=$(echo -e "n\nq" | $SUDOKU 2>&1)
if echo "$OUTPUT" | grep -q "新游戏开始"; then
    echo "✓ 通过"
    ((PASS++))
else
    echo "✗ 失败"
    ((FAIL++))
fi

# 测试2: 提示功能
echo -e "\n[测试2] 提示功能 (h)"
OUTPUT=$(echo -e "h\nq" | $SUDOKU 2>&1)
if echo "$OUTPUT" | grep -q "提示"; then
    echo "✓ 通过"
    ((PASS++))
else
    echo "✗ 失败"
    ((FAIL++))
fi

# 测试3: 退出功能
echo -e "\n[测试3] 退出功能 (q)"
OUTPUT=$(echo -e "q" | $SUDOKU 2>&1)
if echo "$OUTPUT" | grep -q "再见"; then
    echo "✓ 通过"
    ((PASS++))
else
    echo "✗ 失败"
    ((FAIL++))
fi

# 测试4: 菜单显示
echo -e "\n[测试4] 菜单显示"
OUTPUT=$(echo -e "q" | $SUDOKU 2>&1)
if echo "$OUTPUT" | grep -q "输入格式"; then
    echo "✓ 通过"
    ((PASS++))
else
    echo "✗ 失败"
    ((FAIL++))
fi

# 测试5: 无效输入处理
echo -e "\n[测试5] 无效输入处理"
OUTPUT=$(echo -e "xyz\nq" | $SUDOKU 2>&1)
if echo "$OUTPUT" | grep -q "输入格式错误"; then
    echo "✓ 通过"
    ((PASS++))
else
    echo "✗ 失败"
    ((FAIL++))
fi

# 测试6: 颜色代码存在
echo -e "\n[测试6] 终端颜色效果"
OUTPUT=$(echo -e "q" | $SUDOKU 2>&1)
if echo "$OUTPUT" | grep -q "32m"; then
    echo "✓ 通过"
    ((PASS++))
else
    echo "✗ 失败"
    ((FAIL++))
fi

echo -e "\n========================================"
echo "         测试结果: $PASS 通过, $FAIL 失败"
echo "========================================"

if [ $FAIL -eq 0 ]; then
    echo "🎉 所有测试通过！"
    exit 0
else
    echo "⚠️  有测试失败"
    exit 1
fi
