# G4-Tsumi-Tsumi

## 概要

Tsumi-Tsumiは、タスク管理と予定管理をもとに、ユーザーの「つみ度」を可視化するシステムです。

ユーザーが登録したタスクや予定の情報から、現在どの程度タスクが積み上がっているかを分かりやすく表示し、タスクの優先順位づけや行動のきっかけを作ることを目的とします。

## チーム名

G4 やわらか背骨チャンネル

## 主な機能

今回の実装では、発表でデモできる範囲を優先して開発します。

- タスク登録
- 予定登録
- つみ度計算
- タスク一覧表示
- 入力チェック
- 簡単なエラーメッセージ表示

## 使用技術

- HTML
- CSS
- JavaScript
- Java
- MySQL

## フォルダ構成

```text
G4-Tsumi-Tsumi/
├── README.md
├── docs/
│   ├── coding-rule.md
│   ├── meeting-log.md
│   └── internal-design.md
└── src/
```

## 各フォルダ・ファイルの説明

| 名前 | 内容 |
|---|---|
| `README.md` | プロジェクトの概要、使用技術、作業手順をまとめる |
| `docs/` | 設計書、規約、議事録などの文書を管理する |
| `docs/coding-rule.md` | プログラミング規約を記載する |
| `docs/meeting-log.md` | 会議メモや作業記録を記載する |
| `docs/internal-design.md` | 内部設計に関する内容を記載する |
| `src/` | ソースコードを配置する |

## ブランチ運用

| ブランチ | 用途 |
|---|---|
| `main` | 提出用・完成版 |
| `develop` | 開発中の最新版 |
| `feature/機能名` | 各機能の作業用ブランチ |

## 作業手順

作業を始める前に、必ず`develop`ブランチを最新にします。

```bash
git switch develop
git pull origin develop
```

新しい作業を始めるときは、`develop`から作業用ブランチを作成します。

```bash
git switch -c feature/作業名
```

作業後は、変更内容をコミットしてGitHubへ送信します。

```bash
git status
git add .
git commit -m "作業内容を書く"
git push -u origin feature/作業名
```

その後、GitHub上でPull Requestを作成し、`develop`ブランチへマージします。

## コミットメッセージ例

- READMEを更新
- プログラミング規約を追加
- タスク登録画面を追加
- 予定登録画面を追加
- つみ度計算処理を追加
- 入力チェック処理を修正
- エラーメッセージ表示を追加

## 開発時の注意

- `main`に直接pushしない
- 作業前に必ず`develop`を最新にする
- 作業内容ごとに`feature`ブランチを作成する
- 変更内容が分かるコミットメッセージを書く
- コードは`docs/coding-rule.md`のプログラミング規約に従う
- Pull Requestを作成してから`develop`に反映する

## プログラミング規約

本プロジェクトでは、以下の方針でコードを記述します。

- ファイル名は役割が分かる名前にする
- クラス名は`UpperCamelCase`で書く
- メソッド名、変数名は`lowerCamelCase`で書く
- 定数名は`UPPER_SNAKE_CASE`で書く
- DBのテーブル名、カラム名は`snake_case`で書く
- インデントは半角スペース4つで統一する
- 処理が1行でも波括弧は省略しない
- コメントは「何をしているか」だけでなく「なぜその処理が必要か」を書く

詳細は`docs/coding-rule.md`を参照してください。