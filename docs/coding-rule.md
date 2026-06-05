# G4 Tsumi-Tsumi プログラミング規約

## 1. 目的

本規約は、ソースコードの可読性、保守性、品質を高めることを目的とする。

チーム開発では、他のメンバーが作成したソースコードを読む場面があるため、誰が読んでも処理内容を理解しやすい書き方に統一する。

また、数か月後に自分が読み返しても内容を理解できるように、命名、インデント、コメント、ファイル構成などのルールを定める。

## 2. 対象範囲

本規約は、Tsumi-Tsumiの実装で作成する以下のファイルに適用する。

- HTMLファイル
- CSSファイル
- JavaScriptファイル
- Javaファイル
- SQLファイル

## 3. ファイル名の規約

### 3.1 HTMLファイル

HTMLファイル名は、画面の役割が分かる英単語を使用し、すべて小文字で記述する。

例：

- `task.html`
- `schedule.html`
- `diagnosis.html`
- `premium.html`
- `advertisement.html`

### 3.2 CSSファイル

CSSファイル名は、対象画面または共通部品が分かる名前にする。

例：

- `common.css`
- `task.css`
- `schedule.css`
- `diagnosis.css`

### 3.3 JavaScriptファイル

JavaScriptファイル名は、対象画面または機能が分かる名前にする。

例：

- `task.js`
- `schedule.js`
- `diagnosis.js`
- `premium.js`
- `advertisement.js`

### 3.4 Javaファイル

Javaファイル名は、クラス名と同じ名前にする。  
クラス名は原則として内部設計書のクラス名に合わせる。

ただし、明らかな綴り誤りはチーム内で統一して修正する。

例：

- `TaskManager.java`
- `ScheduleManager.java`
- `TsumiCalculator.java`
- `TsumiTsumiDao.java`

## 4. 命名規則

### 4.1 基本方針

変数名、関数名、クラス名は、役割が分かる説明的な名前にする。  
略称は必要以上に使わず、意味が分かる名前を使用する。

| 対象 | 規則 | 例 |
|---|---|---|
| クラス名 | UpperCamelCase | `TaskManager`, `ScheduleManager` |
| メソッド名 | lowerCamelCase | `addTask`, `calculateTsumiScore` |
| 変数名 | lowerCamelCase | `taskId`, `taskName` |
| 定数名 | UPPER_SNAKE_CASE | `MAX_TASK_COUNT` |
| DBテーブル名 | snake_case | `users`, `diagnosis_results` |
| DBカラム名 | snake_case | `user_id`, `created_at` |

### 4.2 クラス名

クラス名はUpperCamelCaseとし、役割に応じて以下の語尾を使用する。

| 種類 | 語尾 | 例 |
|---|---|---|
| 画面クラス | Screen | `TaskScreen`, `ScheduleScreen` |
| 管理クラス | Manager | `TaskManager`, `DiagnosisManager` |
| 計算クラス | Calculator | `TsumiCalculator` |
| データアクセス | Dao | `TsumiTsumiDao` |
| データクラス | なし、またはEntity名 | `Task`, `Schedule`, `DiagnosisResult` |

### 4.3 メソッド名

メソッド名はlowerCamelCaseとし、処理内容が分かるように動詞から始める。

例：

- `addTask()`
- `completeTask()`
- `calculateTsumiScore()`
- `getRecommendedTasks()`
- `saveTask()`
- `findTasksByUserId()`

### 4.4 変数名

変数名はlowerCamelCaseとし、変数の内容が分かる名詞を使用する。

例：

- `taskId`
- `userId`
- `taskName`
- `deadline`
- `estimatedTime`
- `tsumiScore`
- `achievementRate`

### 4.5 データベースの命名

テーブル名とカラム名はsnake_caseとする。  
内部設計書のテーブル一覧に合わせる。

例：

- `users`
- `tasks`
- `schedules`
- `diagnosis_results`
- `recommended_tasks`
- `tsumi_statuses`
- `premium_plans`
- `premium_contracts`

## 5. インデント・改行

### 5.1 インデント

インデントは半角スペース4つとする。  
タブは使用しない。

```java
if (taskName == null) {
    return false;
}
```

### 5.2 波括弧

if文、for文、while文では、処理が1行だけの場合でも波括弧を省略しない。

悪い例：

```java
if (isCompleted) return;
```

良い例：

```java
if (isCompleted) {
    return;
}
```

### 5.3 1行の長さ

1行が長くなりすぎる場合は、適切な位置で改行する。  
目安として、1行は80〜120文字程度に収める。

## 6. コメント規約

### 6.1 コメントを書く場所

以下の場所には、必要に応じてコメントを書く。

- クラスの先頭
- メソッドの先頭
- 重要な変数の宣言
- 処理の意味が分かりにくい部分
- 入力チェックや例外処理
- DB保存・取得処理
- つみ度計算など、システム固有の処理

### 6.2 コメントの書き方

コメントは「コードを読めば分かること」ではなく、「なぜその処理をしているのか」を書く。

悪い例：

```java
// userIdを取得する
int userId = task.getUserId();
```

良い例：

```java
// ユーザーごとにタスク一覧を取得するため、タスクからユーザーIDを取得する
int userId = task.getUserId();
```

### 6.3 クラスコメント

```java
/**
 * タスク登録、完了処理、タスク一覧取得を行う管理クラス。
 */
public class TaskManager {
}
```

### 6.4 メソッドコメント

```java
/**
 * タスクと予定の情報からつみ度を計算する。
 *
 * @param tasks ユーザーのタスク一覧
 * @param schedules ユーザーの予定一覧
 * @return 計算したつみ度スコア
 */
public int calculateTsumiScore(List<Task> tasks, List<Schedule> schedules) {
}
```

## 7. Javaの記述ルール

### 7.1 クラスの役割分担

クラスは内部設計書に従い、以下の役割で分ける。

| 種類 | 役割 | 例 |
|---|---|---|
| Screen | 画面操作を受け付ける | `TaskScreen` |
| Manager | 業務処理を行う | `TaskManager` |
| Entity | データを保持する | `Task` |
| Dao | データベースアクセスを行う | `TsumiTsumiDao` |
| Service | 外部処理や決済処理などを行う | `PaymentService` |

### 7.2 変数の使い回し禁止

一度使用した変数を、別の意味の処理に使い回さない。

悪い例：

```java
int count = tasks.size();
count = schedules.size();
```

良い例：

```java
int taskCount = tasks.size();
int scheduleCount = schedules.size();
```

### 7.3 入力チェック

入力チェックは、画面側だけでなく処理側でも確認する。

タスク登録では、タスク名、期限、所要時間を確認する。  
予定登録では、終了日時が開始日時より後であることを確認する。

```java
public boolean isValid() {
    return taskName != null && !taskName.isEmpty()
        && deadline != null
        && estimatedTime > 0;
}
```

## 8. JavaScriptの記述ルール

JavaScriptでは、原則として`let`または`const`を使用する。  
`var`は使用しない。

関数名はlowerCamelCaseとし、処理内容が分かる名前にする。

```javascript
const taskName = document.getElementById("task-name").value;
let estimatedTime = 0;

function validateTaskInput() {
    // 入力内容を確認する
}
```

## 9. HTML・CSSの記述ルール

HTMLの`id`と`class`、CSSのクラス名はkebab-caseを使用する。

複数画面で使うデザインは`common.css`にまとめる。

HTMLの例：

```html
<input id="task-name" class="task-input">
<button class="submit-button">登録</button>
```

CSSの例：

```css
.error-message {
    font-weight: bold;
}
```

## 10. SQLの記述ルール

SQLの予約語は大文字で書く。  
テーブル名とカラム名はsnake_caseとする。

```sql
CREATE TABLE tasks (
    task_id INT PRIMARY KEY,
    user_id INT,
    task_name VARCHAR(255),
    deadline DATETIME,
    estimated_time INT,
    status VARCHAR(50),
    created_at DATETIME,
    completed_at DATETIME
);
```

```sql
SELECT task_id, task_name
FROM tasks
WHERE user_id = 1;
```

## 11. エラー処理

エラーが発生した場合は、利用者に分かりやすいメッセージを表示する。

システム内部のエラー内容をそのまま表示しない。

| 場面 | エラーメッセージ例 |
|---|---|
| タスク登録 | タスク名、期限、所要時間を入力してください。 |
| 予定登録 | 終了日時は開始日時より後に設定してください。 |
| ログイン | メールアドレスまたはパスワードが正しくありません。 |
| プレミアム登録 | 決済に失敗しました。もう一度お試しください。 |
| 広告管理 | 表示終了日は表示開始日より後に設定してください。 |

## 12. ソースコードレビュー時の確認項目

| 確認項目 | 内容 |
|---|---|
| 命名 | クラス名、メソッド名、変数名が分かりやすいか |
| 役割分担 | Screen、Manager、Entity、Daoの役割が混ざっていないか |
| インデント | 半角スペース4つで統一されているか |
| コメント | 必要な箇所に意味のあるコメントがあるか |
| 入力チェック | 内部設計書の入力チェックが実装されているか |
| DB処理 | DAOにDBアクセス処理がまとめられているか |
| エラー処理 | 利用者向けのエラーメッセージがあるか |
| 可読性 | 他の人が読んでも処理の流れが分かるか |

## 13. 今回の実装で優先する範囲

今回のプログラミングでは、すべての機能を完全に実装するのではなく、発表でデモできる範囲を優先する。

1. タスク登録
2. 予定登録
3. つみ度計算
4. タスク一覧表示
5. 入力チェック
6. 簡単なエラーメッセージ表示