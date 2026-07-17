# 現行実装で追加・変更された主な要素

この資料は、当初状態との厳密な比較ではなく、現在のコード、型定義、ファイルヘッダの変更履歴から確認できた追加・変更内容を整理したものです。当初設計資料そのものは確認していないため、当初の画面構成やデータ項目は断定していません。

| 変更・追加項目 | 現在の実装 | 目的・理由 | 影響した画面やファイル |
|---|---|---|---|
| タスクへのid追加 | `Task` に `id: string` が追加されています。 | タスクを一意に識別し、並び替えや絞り込み後でも正しい対象を操作するためです。 | `src/types/task.ts`, `src/data/sampleData.ts`, `src/context/AppDataContext.tsx`, `src/pages/Tasks.tsx`, `src/pages/Calendar.tsx` |
| index基準からid基準のタスク操作へ変更 | `updateTask(id, task)`, `deleteTask(id)`, `toggleTaskCompleted(id)` でid基準になっています。 | 表示順が変わっても別タスクを編集、削除、完了切り替えしないようにするためです。 | `src/context/DataContext.ts`, `src/context/AppDataContext.tsx`, `src/pages/Tasks.tsx` |
| localStorage保存 | タスク、予定、診断結果をlocalStorageに保存します。保存はState変更後の `useEffect` で行われます。 | 画面を閉じたり再読み込みしてもデータを保持するためです。 | `src/context/AppDataContext.tsx` |
| 旧形式タスクの移行処理 | `normalizeTask` でidなし、空id、旧 `priority` 形式を現在形式へそろえます。 | 以前の保存データが残っていてもアプリを開けるようにするためです。 | `src/context/AppDataContext.tsx`, `src/utils/taskId.ts` |
| データリセット機能 | Home画面から保存データを削除し、サンプルタスク、サンプル予定、未診断へ戻せます。 | 発表練習や開発中の入力を初期状態に戻せるようにするためです。 | `src/pages/Home.tsx`, `src/context/AppDataContext.tsx` |
| 未完了/完了タブ | Tasks画面で `incomplete` と `completed` のタブを切り替えます。 | 未完了タスクと完了タスクを分けて見やすくするためです。 | `src/pages/Tasks.tsx` |
| 自動優先度判定 | `judgeAutoPriority` が高、中、低と理由文を返します。 | 締切、重要度、見積時間、診断結果をもとに、次に取り組む優先度を示すためです。 | `src/utils/taskPriority.ts`, `src/pages/Tasks.tsx`, `src/utils/tsumiScore.ts` |
| 診断結果の保存と他画面への反映 | 診断結果をContextとlocalStorageに保存し、Home、Status、自動優先度で利用します。 | ユーザーの進め方タイプに合わせて表示や判定を変えるためです。 | `src/pages/Diagnosis.tsx`, `src/context/AppDataContext.tsx`, `src/pages/Home.tsx`, `src/pages/Status.tsx`, `src/utils/taskPriority.ts` |
| つみ度計算 | `calculateTsumiScore` が未完了タスクから点数、ラベル、理由、影響タスク、内訳を返します。 | タスクが積み上がっている危険度を数値と理由で見せるためです。 | `src/utils/tsumiScore.ts`, `src/pages/Home.tsx`, `src/pages/Status.tsx`, `src/pages/Calendar.tsx` |
| 推定つみ度 | Calendarで今日、1日後、3日後、7日後のつみ度を表示します。 | 未完了タスクが残った場合の将来の危険度を見通すためです。 | `src/pages/Calendar.tsx`, `src/utils/tsumiScore.ts`, `src/utils/taskPriority.ts` |
| Status画面の危険度表示 | 点数に応じて `危険`、`注意`、`少し積み気味`、`余裕あり` を表示します。 | つみ度の意味を直感的に理解できるようにするためです。 | `src/pages/Status.tsx` |
| 診断タイプ別アドバイス | Homeでは短い次の一手、Statusでは診断タイプ別の進め方を表示します。 | 診断結果を単なる表示で終わらせず、行動につなげるためです。 | `src/utils/homeAdvice.ts`, `src/pages/Home.tsx`, `src/pages/Status.tsx` |
| 週間カレンダー | Calendarで日曜始まりの7日分を表示し、前の週、今週、次の週に移動できます。 | 予定と締切を週単位で確認できるようにするためです。 | `src/pages/Calendar.tsx` |
| 予定と締切タスクの区別 | Calendarの各日で「予定」と「締切」を別セクションに表示します。 | 時間のある予定と締切タスクを混同しないようにするためです。 | `src/pages/Calendar.tsx` |
| 共通ナビゲーション | App内の `AppNavigation` が全画面へのリンクを表示します。 | 画面間を移動しやすくし、現在位置も分かるようにするためです。 | `src/App.tsx` |
| 画面遷移時のスクロール位置リセット | `ScrollToTop` がpathname変更時に `window.scrollTo(0, 0)` を実行します。 | 遷移後に前画面のスクロール位置が残らないようにするためです。 | `src/components/ScrollToTop.tsx`, `src/App.tsx` |
| 編集時のページ上部へのスクロール | タスク編集、予定編集で `window.scrollTo({ top: 0, behavior: "smooth" })` を実行します。 | 編集フォームがページ上部にあるため、編集開始時にフォームへ戻すためです。 | `src/pages/Tasks.tsx`, `src/pages/Calendar.tsx` |
| 入力チェック | タスク追加、タスク編集、予定追加、予定編集で必須項目や値の妥当性をチェックします。 | 不完全なデータや不自然な値を保存しないためです。 | `src/pages/Tasks.tsx`, `src/pages/Calendar.tsx` |
| 削除前確認 | 予定削除とデータリセットには確認ダイアログがあります。タスク削除には現在確認ダイアログはありません。 | 予定削除と全体リセットは誤操作の影響が大きいためです。タスク削除の確認追加は現在のコードでは未実装です。 | `src/pages/Calendar.tsx`, `src/pages/Home.tsx`, `src/pages/Tasks.tsx` |
| スマホ表示対応 | `@media (max-width: 760px)` で、ナビゲーションを2列グリッドに変更し、主要グリッドを1列表示に切り替えています。週移動ボタンは3列、フォームやタブなどのボタンは幅100%になり、長いタスク名や予定名は折り返す指定があります。 | スマホ幅でもナビゲーション、フォーム、一覧、週間カレンダーを読みやすく操作しやすくするためです。 | `src/App.css`, 各画面コンポーネント |

## 確認できた範囲

- 各ファイルのヘッダに、Issue番号や変更履歴が残っています。
- 現在の実装では、タスクはid基準、予定はindex基準です。
- タスク削除前の確認ダイアログは現在の実装では確認できませんでした。
- 当初設計資料そのものは確認していないため、当初状態との比較ではなく、現行実装で確認できる追加・変更要素として整理しています。
