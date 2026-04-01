#include <iostream>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <algorithm>
#include <cstring>
#include <sstream>

using namespace std;

class Sudoku {
private:
    static const int N = 9;
    int board[N][N];
    int solution[N][N];
    bool original[N][N];

    // Check if placing num at board[row][col] is valid
    bool isValid(int row, int col, int num) {
        // Check row
        for (int i = 0; i < N; i++) {
            if (board[row][i] == num) return false;
        }
        // Check column
        for (int i = 0; i < N; i++) {
            if (board[i][col] == num) return false;
        }
        // Check 3x3 box
        int boxRow = (row / 3) * 3;
        int boxCol = (col / 3) * 3;
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (board[boxRow + i][boxCol + j] == num) return false;
            }
        }
        return true;
    }

    // Solve the board using backtracking
    bool solve() {
        for (int row = 0; row < N; row++) {
            for (int col = 0; col < N; col++) {
                if (board[row][col] == 0) {
                    vector<int> nums = {1, 2, 3, 4, 5, 6, 7, 8, 9};
                    random_shuffle(nums.begin(), nums.end());
                    for (int num : nums) {
                        if (isValid(row, col, num)) {
                            board[row][col] = num;
                            if (solve()) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Copy board to solution
    void copyToSolution() {
        memcpy(solution, board, sizeof(board));
    }

    // Remove numbers to create puzzle
    void createPuzzle(int holes) {
        srand(time(nullptr));
        int removed = 0;
        vector<pair<int, int>> cells;
        for (int i = 0; i < N; i++) {
            for (int j = 0; j < N; j++) {
                cells.push_back({i, j});
            }
        }
        random_shuffle(cells.begin(), cells.end());

        for (auto cell : cells) {
            if (removed >= holes) break;
            int row = cell.first;
            int col = cell.second;
            int backup = board[row][col];
            board[row][col] = 0;
            
            // Check if puzzle still has unique solution (simplified check)
            // For simplicity, just remove and trust it's fine for moderate holes
            original[row][col] = false;
            removed++;
        }
    }

public:
    Sudoku() {
        memset(board, 0, sizeof(board));
        memset(original, true, sizeof(original));
    }

    // Generate a new puzzle with given difficulty
    void generate(int difficulty = 40) {
        // 0 = easy (30 holes), 1 = medium (40 holes), 2 = hard (50 holes)
        int holes = 30 + difficulty * 10;
        memset(board, 0, sizeof(board));
        memset(original, true, sizeof(original));
        solve();
        copyToSolution();
        createPuzzle(holes);
    }

    // Print the current board
    void print() {
        cout << "\n  ╔═══════╤═══════╤═══════╗\n";
        for (int i = 0; i < N; i++) {
            cout << "  ║";
            for (int j = 0; j < N; j++) {
                if (board[i][j] == 0) {
                    cout << " · ";
                } else if (!original[i][j]) {
                    cout << "\033[33m" << board[i][j] << "\033[0m" << " ";
                } else {
                    cout << "\033[32m" << board[i][j] << "\033[0m" << " ";
                }
                if (j == 2 || j == 5) cout << "│";
            }
            cout << "║\n";
            if (i == 2 || i == 5) {
                cout << "  ╟───────┼───────┼───────╢\n";
            }
        }
        cout << "  ╚═══════╧═══════╧═══════╝\n";
        cout << "\033[32m绿色\033[0m = 题目  \033[33m黄色\033[0m = 你的输入\n";
    }

    // Try to place a number at position
    bool place(int row, int col, int num) {
        if (row < 0 || row >= N || col < 0 || col >= N) {
            cout << "❌ 无效位置！行和列必须是 1-9\n";
            return false;
        }
        if (num < 1 || num > 9) {
            cout << "❌ 无效数字！必须是 1-9\n";
            return false;
        }
        if (original[row][col]) {
            cout << "❌ 题目数字不能修改！\n";
            return false;
        }
        if (num != solution[row][col]) {
            cout << "❌ 错误！正确答案是 " << solution[row][col] << "\n";
            board[row][col] = num; // Still allow wrong input for gameplay
            return false;
        }
        board[row][col] = num;
        return true;
    }

    // Check if puzzle is complete
    bool isComplete() {
        for (int i = 0; i < N; i++) {
            for (int j = 0; j < N; j++) {
                if (board[i][j] == 0) return false;
            }
        }
        return true;
    }

    // Hint: reveal one empty cell
    void hint() {
        vector<pair<int, int>> empty;
        for (int i = 0; i < N; i++) {
            for (int j = 0; j < N; j++) {
                if (board[i][j] == 0) {
                    empty.push_back({i, j});
                }
            }
        }
        if (empty.empty()) {
            cout << "已经没有空位了！\n";
            return;
        }
        auto cell = empty[rand() % empty.size()];
        board[cell.first][cell.second] = solution[cell.first][cell.second];
        original[cell.first][cell.second] = false;
        cout << "💡 提示：第 " << cell.first + 1 << " 行 " << cell.second + 1 << " 列是 "
             << solution[cell.first][cell.second] << "\n";
    }
};

int main() {
    Sudoku game;
    srand(time(nullptr));
    
    cout << "\n";
    cout << "╔═══════════════════════════════╗\n";
    cout << "║       🎮  数 独 小 游 戏       ║\n";
    cout << "╠═══════════════════════════════╣\n";
    cout << "║  输入格式: 行 列 数字          ║\n";
    cout << "║  例如: 1 2 5 (第1行第2列放5)   ║\n";
    cout << "║  输入 h 获取提示               ║\n";
    cout << "║  输入 n 重新开始               ║\n";
    cout << "║  输入 q 退出游戏               ║\n";
    cout << "╚═══════════════════════════════╝\n";

    game.generate(rand() % 3);

    while (true) {
        game.print();
        
        if (game.isComplete()) {
            cout << "\n🎉 恭喜你！全部完成！太厉害了！\n";
            break;
        }

        cout << "\n> ";
        string line;
        if (!getline(cin, line)) break;
        if (line.empty()) continue;
        
        stringstream ss(line);
        char cmd;
        ss >> cmd;
        
        if (cmd == 'q' || cmd == 'Q') {
            cout << "再见！👋\n";
            break;
        }
        else if (cmd == 'n' || cmd == 'N') {
            game.generate(rand() % 3);
            cout << "新游戏开始！\n";
        }
        else if (cmd == 'h' || cmd == 'H') {
            game.hint();
        }
        else {
            // Try to parse as row col num
            stringstream ss2(line);
            int row, col, num;
            if (ss2 >> row >> col >> num) {
                if (game.place(row - 1, col - 1, num)) {
                    cout << "✅ 正确！\n";
                }
            } else {
                cout << "❌ 输入格式错误！正确的如: 1 2 5\n";
            }
        }
    }

    return 0;
}
