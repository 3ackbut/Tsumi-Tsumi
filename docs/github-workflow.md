# GitHub運用ルール

このドキュメントは、Tsumi-Tsumi / つみつみをチームで開発するときのGitHub運用ルールをまとめたものです。作業の流れをそろえることで、変更内容を確認しやすくし、他の人の作業と混ざることを防ぎます。

## 基本方針

- `develop` ブランチを開発の基準にします。
- 作業ごとに新しいブランチを作ります。
- `develop` に直接pushしません。
- Issueごとに作業内容を分けます。
- 作業が終わったらPull Requestを作り、確認してからマージします。

## ブランチ名の例

ブランチ名は、作業の種類が分かるように付けます。

- `feature/〇〇`: 新しい機能を追加するとき
- `fix/〇〇`: 不具合を修正するとき
- `improve/〇〇`: 既存機能を改善するとき
- `docs/〇〇`: READMEやdocsを更新するとき
- `refactor/〇〇`: 動きは変えずにコードを整理するとき

例:

- `fix/calendar-input-validation`
- `improve/status-tsumi-display`
- `docs/update-readme`
- `refactor/add-task-id`

## 作業の流れ

作業を始める前に、まず `develop` を最新の状態にします。

```bash
git switch develop
git pull origin develop
git switch -c ブランチ名
```

作業が終わったら、変更内容を確認してコミットします。

```bash
git status
git add 変更ファイル
git commit -m "コミットメッセージ"
git push -u origin ブランチ名
```

pushした後は、GitHub上でPull Requestを作成します。Pull Requestでは、何を変更したのか、どのように確認したのかを説明します。

## Issueの使い方

Issueは、やることを1つずつ管理するために使います。

実装、修正、docs作成、コード理解などは、できるだけ別々のIssueに分けます。1つのIssueに作業を詰め込みすぎると、何が終わったのか分かりにくくなるためです。

Issueには、次の内容を書くと確認しやすくなります。

- 概要
- 目的
- やること
- 完了条件

Pull Requestの本文に `Closes #番号` と書くと、そのPull Requestがマージされたときに対応するIssueが自動で閉じます。

例:

```md
Closes #44
```

## Pull Requestの使い方

Pull Requestは、作業内容を確認してから `develop` に取り込むために作ります。

PRには、次の内容を書きます。

- 概要
- 変更内容
- 動作確認
- `npm run build` の結果
- `npm run lint` の結果

docsのみの変更など、アプリの動作に影響しない場合は、build/lintを実行しないこともあります。その場合は、PR本文に「docsのみの変更のため未実行」のように理由を書きます。

マージ前には、GitHub上の差分を確認し、関係ないファイルや不要な変更が入っていないかを見ます。

## コミットメッセージの例

コミットメッセージは、何をしたかが分かるように短く書きます。

- `追加: タスク編集機能を追加`
- `修正: カレンダーの入力チェックを修正`
- `改善: つみ度表示を改善`
- `整理: タスクidの処理を整理`
- `docs: READMEを更新`

## 注意点

- 他の人の作業と混ざらないように、Issueごとにブランチを分けます。
- 作業前に必ず `develop` を最新化します。
- 関係ないファイルをコミットしません。
- 不要な変更が混ざっていないか、`git status` と `git diff` で確認します。
- `develop` への直接pushはしません。
- 強制pushは基本的にしません。
- 判断に迷う変更は勝手に削除せず、チームに確認します。

## このプロジェクトでの運用例

このプロジェクトでは、次のような流れで作業します。

1. GitHubでIssueを作ります。
2. `develop` を最新化します。
3. Issueに対応するブランチを作ります。
4. Codexや人力で修正します。
5. 必要に応じて `npm run build` と `npm run lint` を確認します。
6. 変更内容をコミットします。
7. ブランチをGitHubへpushします。
8. Pull Requestを作ります。
9. レビューで差分や動作確認内容を確認します。
10. 問題がなければ `develop` へマージします。
