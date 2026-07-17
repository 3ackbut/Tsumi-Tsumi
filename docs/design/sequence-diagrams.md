# シーケンス図

この資料では、現在の実装にある主な処理の流れをMermaidのシーケンス図で整理します。実装に存在しない処理は追加せず、コードで確認できた動きに合わせています。タスク、予定、診断結果の永続化は、Context操作関数の中で直接保存するのではなく、React State変更後に `useEffect` がlocalStorageへ保存します。

## 1. アプリ起動時のデータ読み込み

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant App as App
  participant Provider as AppDataProvider
  participant Storage as localStorage
  participant Sample as sampleData
  participant Id as createTaskId
  participant Context as AppDataContext
  participant Screens as 各画面

  User->>App: アプリを開く
  App->>Provider: AppDataProviderで全体を包む
  Provider->>Storage: tasksキーを読み込む
  alt 保存タスクあり
    Storage-->>Provider: JSON文字列
    Provider->>Provider: JSON.parse()
  else 保存タスクなしまたは壊れたJSON
    Provider->>Sample: sampleTasksを使う
  end
  Provider->>Provider: normalizeTask()
  alt idがない旧形式タスク
    Provider->>Id: createTaskId()
    Id-->>Provider: 新しいid
  end
  Provider->>Storage: schedulesキーを読み込む
  alt 保存予定あり
    Storage-->>Provider: JSON文字列
    Provider->>Provider: JSON.parse()
  else 保存予定なしまたは壊れたJSON
    Provider->>Sample: sampleSchedulesを使う
  end
  Provider->>Storage: diagnosisキーを読み込む
  alt 診断結果あり
    Storage-->>Provider: JSON文字列
    Provider->>Provider: JSON.parse()
  else 診断結果なしまたは壊れたJSON
    Provider-->>Provider: null
  end
  Provider->>Context: tasks, schedules, diagnosisResult, 操作関数を提供
  Screens->>Context: useAppData()
  Context-->>Screens: 共通データを返す
```

初回表示では `AppDataProvider` の `useState` 初期化関数が実行されます。保存データがない場合は `sampleTasks` と `sampleSchedules` を使い、診断結果は `null` になります。タスクは `normalizeTask` を通るため、古い保存形式で `id` がない場合も `createTaskId` で補完されます。

## 2. タスク追加

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant Tasks as Tasks画面
  participant Id as createTaskId
  participant Provider as AppDataProvider
  participant Effect as 保存用useEffect
  participant Storage as localStorage
  participant Screens as 各画面

  User->>Tasks: タスク名、締切、見積時間、重要度を入力
  User->>Tasks: タスク追加ボタン
  Tasks->>Tasks: saveTask()
  Tasks->>Tasks: 入力チェック
  alt 入力エラーあり
    Tasks-->>User: エラーメッセージを表示
  else 入力OK
    Tasks->>Id: createTaskId()
    Id-->>Tasks: id
    Tasks->>Provider: addTask(task)
    Provider->>Provider: setTasksでReact Stateを更新
    Provider-->>Screens: Context更新により関連画面を再描画
    Provider-->>Effect: tasks変更後にuseEffectが実行される
    Effect->>Storage: localStorageへ保存（tsumi-tsumi-tasks）
  end
```

タスク追加では、空欄や見積時間が1分未満の入力を保存しません。保存時に `Task` オブジェクトを作り、`createTaskId` でidを設定してから `addTask` を呼び出します。localStorage保存は `tasks` 変更後の `useEffect` が行います。

## 3. タスク編集

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant Tasks as Tasks画面
  participant Window as window
  participant Provider as AppDataProvider
  participant Effect as 保存用useEffect
  participant Storage as localStorage
  participant Screens as 各画面

  User->>Tasks: 編集ボタン
  Tasks->>Tasks: startEditTask(task)
  Tasks->>Tasks: editingTaskIdへtask.idを保存
  Tasks->>Tasks: フォームへ既存値を反映
  Tasks->>Window: scrollTo({ top: 0, behavior: "smooth" })
  User->>Tasks: 入力を修正
  User->>Tasks: 変更を保存
  Tasks->>Tasks: saveTask()
  Tasks->>Tasks: 入力チェック
  alt 入力エラーあり
    Tasks-->>User: エラーメッセージを表示
  else 入力OK
    Tasks->>Tasks: 既存idと完了状態を引き継ぐ
    Tasks->>Provider: updateTask(editingTaskId, task)
    Provider->>Provider: setTasksでid一致タスクだけ差し替え
    Tasks->>Tasks: フォームをリセット
    Provider-->>Screens: Context更新により関連画面を再描画
    Provider-->>Effect: tasks変更後にuseEffectが実行される
    Effect->>Storage: localStorageへ保存（tsumi-tsumi-tasks）
  end
```

編集対象は `editingTaskId` に保存されます。更新時は配列のindexではなくidで対象を特定するため、表示順が変わっても別タスクを更新しにくい設計です。

## 4. タスク削除

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant Tasks as Tasks画面
  participant Provider as AppDataProvider
  participant Effect as 保存用useEffect
  participant Storage as localStorage
  participant Screens as 各画面

  User->>Tasks: 削除ボタン
  Tasks->>Provider: deleteTask(id)
  Provider->>Provider: setTasksでidが一致しないタスクだけ残す
  Tasks->>Tasks: フォームをリセット
  Provider-->>Screens: Context更新により関連画面を再描画
  Provider-->>Effect: tasks変更後にuseEffectが実行される
  Effect->>Storage: localStorageへ保存（tsumi-tsumi-tasks）
```

現在の実装では、タスク削除前の確認ダイアログはありません。削除ボタンから直接 `deleteTask(id)` が呼ばれ、対象id以外のタスクを残す形でStateが更新されます。

## 5. タスク完了・未完了切り替え

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant Tasks as Tasks画面
  participant Provider as AppDataProvider
  participant Effect as 保存用useEffect
  participant Storage as localStorage
  participant Home as Home
  participant Status as Status
  participant Calendar as Calendar

  User->>Tasks: チェックボタンまたは完了切り替えボタン
  Tasks->>Provider: toggleTaskCompleted(id)
  Provider->>Provider: setTasksでid一致タスクのcompletedを反転
  Provider-->>Tasks: 未完了/完了タブの件数と一覧に反映
  Provider-->>Home: 今日のタスク、未完了数、完了数、つみ度に反映
  Provider-->>Status: 達成率、残り見積、つみ度に反映
  Provider-->>Calendar: 締切タスクの完了表示に反映
  Provider-->>Effect: tasks変更後にuseEffectが実行される
  Effect->>Storage: localStorageへ保存（tsumi-tsumi-tasks）
```

完了状態だけを反転し、タスク名や締切などの他の項目はそのまま引き継ぎます。つみ度計算は未完了タスクを対象にするため、HomeとStatusの点数にも影響します。

## 6. 予定追加

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant Calendar as Calendar画面
  participant Provider as AppDataProvider
  participant Effect as 保存用useEffect
  participant Storage as localStorage
  participant Home as Home

  User->>Calendar: 予定名、日付、開始時刻、終了時刻を入力
  User->>Calendar: 予定追加ボタン
  Calendar->>Calendar: saveSchedule()
  Calendar->>Calendar: 入力チェック
  alt 入力エラーあり
    Calendar-->>User: エラーメッセージを表示
  else 入力OK
    Calendar->>Provider: addSchedule(schedule)
    Provider->>Provider: setSchedulesでReact Stateを更新
    Provider-->>Calendar: 週間カレンダーへ反映
    Provider-->>Home: 今日の予定へ反映
    Provider-->>Effect: schedules変更後にuseEffectが実行される
    Effect->>Storage: localStorageへ保存（tsumi-tsumi-schedules）
  end
```

予定追加では、予定名、日付、開始時刻、終了時刻が必須です。終了時刻が開始時刻以下の場合も保存しません。

## 7. 予定編集

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant Calendar as Calendar画面
  participant Window as window
  participant Provider as AppDataProvider
  participant Effect as 保存用useEffect
  participant Storage as localStorage
  participant Home as Home

  User->>Calendar: 編集ボタン
  Calendar->>Calendar: startEditSchedule(index)
  Calendar->>Calendar: editingScheduleIndexへindexを保存
  Calendar->>Calendar: フォームへ既存値を反映
  Calendar->>Window: scrollTo({ top: 0, behavior: "smooth" })
  User->>Calendar: 入力を修正
  User->>Calendar: 変更を保存
  Calendar->>Calendar: saveSchedule()
  Calendar->>Calendar: 入力チェック
  alt 入力エラーあり
    Calendar-->>User: エラーメッセージを表示
  else 入力OK
    Calendar->>Provider: updateSchedule(editingScheduleIndex, schedule)
    Provider->>Provider: setSchedulesでindex一致予定だけ差し替え
    Calendar->>Calendar: フォームをリセット
    Provider-->>Calendar: 週間カレンダーへ反映
    Provider-->>Home: 今日の予定へ反映
    Provider-->>Effect: schedules変更後にuseEffectが実行される
    Effect->>Storage: localStorageへ保存（tsumi-tsumi-schedules）
  end
```

予定は現在、タスクのようなidを持っていません。そのため、編集対象は `editingScheduleIndex` で管理されています。

## 8. 予定削除

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant Calendar as Calendar画面
  participant Dialog as 確認ダイアログ
  participant Provider as AppDataProvider
  participant Effect as 保存用useEffect
  participant Storage as localStorage
  participant Home as Home

  User->>Calendar: 削除ボタン
  Calendar->>Dialog: confirm("この予定を削除しますか？")
  alt キャンセル
    Dialog-->>Calendar: false
    Calendar-->>User: 何もしない
  else OK
    Dialog-->>Calendar: true
    Calendar->>Provider: deleteSchedule(index)
    Provider->>Provider: setSchedulesでindexが一致しない予定だけ残す
    Calendar->>Calendar: フォームをリセット
    Provider-->>Calendar: 週間カレンダーへ反映
    Provider-->>Home: 今日の予定へ反映
    Provider-->>Effect: schedules変更後にuseEffectが実行される
    Effect->>Storage: localStorageへ保存（tsumi-tsumi-schedules）
  end
```

予定削除には確認ダイアログがあります。キャンセル時は何も更新せず、OK時だけ `deleteSchedule(index)` を実行します。

## 9. 診断実行と結果保存

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant Diagnosis as Diagnosis画面
  participant Provider as AppDataProvider
  participant Effect as 保存用useEffect
  participant Storage as localStorage
  participant Home as Home
  participant Status as Status
  participant Tasks as Tasks画面
  participant Priority as judgeAutoPriority

  Diagnosis-->>User: 7つの質問を表示
  User->>Diagnosis: 回答を選択
  Diagnosis->>Diagnosis: answersへ保存
  Diagnosis->>Diagnosis: answeredCountを計算
  alt 未回答の質問あり
    Diagnosis-->>User: 保存ボタンを無効化
  else 全問回答済み
    User->>Diagnosis: 診断結果を保存
    Diagnosis->>Diagnosis: buildDiagnosisResult(answers)
    Diagnosis->>Diagnosis: タイプ別スコアを集計
    Diagnosis->>Diagnosis: 最多タイプを決定
    Diagnosis->>Provider: saveDiagnosisResult(result)
    Provider->>Provider: setDiagnosisResultでReact Stateを更新
    Provider-->>Home: アドバイスに反映
    Provider-->>Status: 診断タイプ別アドバイスに反映
    Provider-->>Tasks: Context更新により再描画
    Tasks->>Priority: 新しい診断結果を使って自動優先度を再判定
    Provider-->>Effect: diagnosisResult変更後にuseEffectが実行される
    Effect->>Storage: localStorageへ保存（tsumi-tsumi-diagnosis-result）
  end
```

診断は7問すべてに回答すると保存できます。診断結果にはタイプ名、説明、特徴、おすすめの進め方、診断日時が保存されます。

## 10. つみ度計算と表示

```mermaid
sequenceDiagram
  participant Screen as HomeまたはStatus
  participant Context as AppDataContext
  participant Score as calculateTsumiScore
  participant Priority as judgeAutoPriority
  participant ScreenView as 画面表示

  Screen->>Context: tasksとdiagnosisResultを取得
  Context-->>Screen: 共有データ
  Screen->>Score: calculateTsumiScore(tasks, diagnosisResult)
  Score->>Score: 未完了タスクを抽出
  loop 未完了タスクごと
    Score->>Priority: judgeAutoPriority(task, diagnosisResult, baseDate)
    Priority-->>Score: 高/中/低
    Score->>Score: 締切までの日数を計算
    Score->>Score: 重要度、見積時間、締切、自動優先度を点数化
  end
  Score->>Score: 合計点を0から100に変換
  Score->>Score: ラベル、メッセージ、理由、影響タスクを作成
  Score-->>Screen: TsumiScoreResult
  Screen->>ScreenView: 点数、状態、理由、影響タスクを表示
```

つみ度は未完了タスクだけを対象にします。締切、重要度、見積時間、自動優先度を使い、点数、ラベル、メッセージ、理由、影響タスク、内訳を返します。

## 11. Calendarの推定つみ度

```mermaid
sequenceDiagram
  participant Calendar as Calendar画面
  participant Score as calculateTsumiScore
  participant Priority as judgeAutoPriority
  participant View as 推定つみ度表示

  Calendar->>Calendar: 今日を基準にする
  Calendar->>Calendar: 今日、1日後、3日後、7日後を作る
  loop 各基準日
    Calendar->>Score: calculateTsumiScore(tasks, diagnosisResult, targetDate)
    Score->>Score: 未完了タスクを抽出
    Score->>Priority: judgeAutoPriority(task, diagnosisResult, targetDate)
    Score->>Score: targetDate基準で締切までの日数を再計算
    Score->>Score: 推定つみ度を計算
    Score-->>Calendar: score, label, breakdown
  end
  Calendar->>Calendar: buildForecastReason()
  Calendar->>View: 今日、1日後、3日後、7日後のカードを表示
```

Calendarでは `calculateTsumiScore` に未来の日付を渡します。そのため、同じ未完了タスクでも基準日が進むほど締切超過や締切接近が反映されます。

## 12. データリセット

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant Home as Home画面
  participant Dialog as 確認ダイアログ
  participant Provider as AppDataProvider
  participant Storage as localStorage
  participant Sample as sampleData
  participant Effect as 保存用useEffect
  participant Screens as 各画面

  User->>Home: データをリセットボタン
  Home->>Dialog: confirm("保存されているタスク・予定・診断結果を初期状態に戻します。よろしいですか？")
  alt キャンセル
    Dialog-->>Home: false
    Home-->>User: 何もしない
  else OK
    Dialog-->>Home: true
    Home->>Provider: resetAppData()
    Provider->>Storage: tasksキーを削除
    Provider->>Storage: schedulesキーを削除
    Provider->>Storage: diagnosisキーを削除
    Provider->>Sample: sampleTasksとsampleSchedulesを取得
    Provider->>Provider: setTasksでsampleTasksへ戻す
    Provider->>Provider: setSchedulesでsampleSchedulesへ戻す
    Provider->>Provider: setDiagnosisResult(null)で未診断へ戻す
    Provider-->>Screens: Context更新により各画面を再描画
    Provider-->>Effect: tasks変更後にuseEffectが実行される
    Effect->>Storage: localStorageへ保存（tsumi-tsumi-tasksにsampleTasks）
    Provider-->>Effect: schedules変更後にuseEffectが実行される
    Effect->>Storage: localStorageへ保存（tsumi-tsumi-schedulesにsampleSchedules）
    Provider-->>Effect: diagnosisResult変更後にuseEffectが実行される
    Effect->>Storage: tsumi-tsumi-diagnosis-resultをlocalStorageから削除
  end
```

データリセットはHome画面から実行します。`resetAppData` は先にlocalStorageの3キーを削除し、その後Stateを初期状態へ戻します。State変更後、`useEffect` によりサンプルタスクとサンプル予定は再保存され、診断結果キーは `diagnosisResult === null` のため削除状態になります。

## 13. 画面遷移

```mermaid
sequenceDiagram
  actor User as ユーザー
  participant Nav as AppNavigation
  participant Router as React Router
  participant Scroll as ScrollToTop
  participant Window as window
  participant Screen as 遷移先画面

  User->>Nav: ナビゲーションを選択
  Nav->>Router: NavLinkでpathを変更
  Router->>Scroll: pathnameが変わる
  Scroll->>Window: scrollTo(0, 0)
  Router->>Screen: Routeに対応する画面を表示
  Router-->>Nav: isActiveを更新
  Nav-->>User: activeナビゲーション表示
```

画面遷移はReact Routerで行います。`ScrollToTop` が `pathname` の変化を監視し、遷移時にページ上部へ戻します。ナビゲーションの選択状態は `NavLink` の `isActive` で更新されます。
