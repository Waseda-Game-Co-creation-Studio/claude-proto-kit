# claude-proto-kit 詳細ガイド

README の「はじめかた」より詳しい情報をまとめたページ。

- [何をしているか](#何をしているか)
- [インストール](#インストール)
- [コマンド](#コマンド)
- [フォルダの自動セットアップ](#フォルダの自動セットアップ)
- [Cloudflare への公開](#cloudflare-への公開)
- [スキル](#スキル)
- [ランチャー（任意）](#ランチャー任意)
- [更新](#更新)
- [注意](#注意)
- [開発](#開発)

## 何をしているか

Claude Code のプラグイン `proto-kit` を提供する。Claude はプラグインのスキル（手順書）に従って、次のものを作って公開する。

| 種類 | 使う技術 | 公開先 |
| --- | --- | --- |
| ゲームの試作品（2D / 3D）。主な用途 | Vite + React + React Three Fiber | Cloudflare Workers |
| スライド（企画説明など） | Slidev | Cloudflare Workers |
| 動画（PV） | Remotion（試作品の 3D シーンをそのまま動画にできる） | Cloudflare R2 |
| 操作デモ動画 | Playwright で録画 → Remotion でカーソル・クリック・ズーム・字幕を付ける | Cloudflare R2 |

ビルドや動画の書き出しは手元の PC で行い、できたものを Cloudflare に置いて URL で共有する。

### スキルと「何を作るか」の関係

スキルは**作り方**（構成、ビルド、公開の手順、守るルール）だけを持ち、**何を作るか**は持たない。中身は次から決まる：

1. 頼んだときの言葉（`/new web dodge 岩をよけるミニゲーム` の「岩をよけるミニゲーム」も同じ）
2. それまでの会話
3. 渡したファイルや URL（企画書、メモ、リポジトリ内の既存の試作品）

足りなければ、作り始める前に Claude が 1 回だけ、最大 3 つまで質問する（デフォルト案つき）。

| 種類 | 確認すること | 何も指定がないとき |
| --- | --- | --- |
| ゲーム（web） | どんなゲームか、操作方法、クリア / ゲームオーバーの条件 | キーボード操作の 1 画面で遊べるもの |
| スライド | テーマと元の資料、誰向けか、枚数 | 8 枚前後。6 枚以上なら先に構成案を見せる |
| 動画（pv） | 何を見せるか、長さ、雰囲気 | 15 秒 |

「おまかせ」と言えば Claude が決めて、何を選んだかを伝える。スライドでは資料にない数字や名前を作らず、`TODO` として残す。
Claude がどのスキルを使うかは、頼んだ内容とスキルの説明文の一致で自動的に決まる（コマンドを使えば明示的に選べる）。

### ゲーム試作で Claude が守ること

- まず遊べる状態にする：操作できる、目標と失敗がある、`R` でやり直せる。見た目やメニューは後回し
- 速さやジャンプの高さなど調整したい数値は `src/lib/tuning.ts` にまとめる（「もっと速く」がすぐ反映できる）
- 画面に遊び方（操作方法）を表示する
- 作ったら実際にキー入力やクリックを送って遊び、スクリーンショットで確認する

## インストール

インストーラ（README の 1 行）は、足りないものを入れてから、プラグインをユーザー単位で登録する。何度実行しても安全。

| | Windows（`install.ps1`） | Mac / Linux（`install.sh`） |
| --- | --- | --- |
| Node.js | winget で LTS を入れる | 22.x を `~/.local/node` に入れる（Homebrew・管理者権限は不要） |
| Git | winget で入れる | Mac は Apple のコマンドラインツールのダイアログが開く。完了後にもう一度実行する。Linux は apt / dnf |
| pnpm | `npm install -g pnpm` | 同左（失敗したら pnpm 公式のインストーラ） |
| Claude Code | 公式インストーラ | 同左 |
| プラグイン | `proto-kit@claude-proto-kit` と Cloudflare 公式 | 同左 |

Windows で winget（アプリ インストーラー）が無い場合は、Microsoft Store から入れてからもう一度実行する。
Windows の PowerShell で Mac 用の `curl -fsSL …` を実行すると、`curl` が別のコマンドのためエラーになる。

Claude Code が入っているなら、プラグインだけ次で入れてもよい：

```text
/plugin marketplace add https://github.com/Waseda-Game-Co-creation-Studio/claude-proto-kit.git
/plugin install proto-kit@claude-proto-kit
```

## コマンド

言葉で頼んでも同じことができる。コマンドは近道。

| コマンド | 内容 |
| --- | --- |
| `/new web <name>` | Vite + React + R3F の試作品を作り、ビルドと画面の確認までする |
| `/new slides <name>` | Slidev のスライドを作る |
| `/new pv <name>` | Remotion の動画プロジェクトを作る（Remotion 公式スキルも入れる） |
| `/deploy [folder]` | Cloudflare Workers に公開して URL を返す |
| `/render <Composition>` | 動画を書き出して R2 にアップロードし、URL を返す |
| `/capture <URL>` | ブラウザの自動操作を録画し、カーソル付きのデモ動画にする |
| `/proto-init` | フォルダの準備だけをする（ふだんは上のコマンドが自動でやる） |

## フォルダの自動セットアップ

準備されていないフォルダで `/new` `/deploy` `/render` `/capture` を使うと、先に次のものが作られる（`repo-setup` スキル）。
空のフォルダなら質問なし。すでに別の構成があるリポジトリでは、pnpm ワークスペースを足してよいか確認する。

| ファイル | 役割 |
| --- | --- |
| `CLAUDE.md` | パッケージの置き場所（`packages/<日付>-<名前>/`）、Worker 名の接頭辞（フォルダ名）、Cloudflare の設定欄 |
| `pnpm-workspace.yaml`、`package.json` | pnpm ワークスペース。許可するのは esbuild / workerd のビルドと Slidev の公式スキルだけ |
| `.claude/settings.json` | `wrangler deploy` `delete` `secret` などの前に承認を求めるルール。共同作業者にもこのプラグインを案内する（書き込み時に 1 回承認が必要） |
| `.gitignore`、`.gitattributes` | 動画や秘密情報を git に入れない、改行を LF に揃える |

既存のファイルは上書きせず、足りない部分だけを足す。

## Cloudflare への公開

- 最初の `/deploy` で、`npx wrangler login`（ブラウザで許可）と、使うアカウントの選択を求められる。選んだアカウント ID と
  workers.dev のサブドメインは `CLAUDE.md` に記録される
- 個人とチームなど複数のアカウントに所属していても、リポジトリごとの `CLAUDE.md` と `wrangler.jsonc` の `account_id` で分かれる
- 動画を公開するには、Cloudflare のダッシュボードで R2 を一度有効にする（規約への同意や支払い情報を求められることがあるので本人が行う）。
  バケットと公開 URL（r2.dev）は Claude が作る
- workers.dev のサブドメインはアカウントに 1 つ。最初のデプロイで自動で付くので、分かりやすい名前に変えておくとよい

## スキル

| スキル | 内容 |
| --- | --- |
| `workflow` | 共通の約束ごと：Cloudflare のアカウント、命名、R2、秘密情報、プレビュー、git |
| `web-prototype` | Vite + React + R3F の作り方と公開 |
| `slides` | Slidev の作り方と公開（Slidev 公式スキルと併用） |
| `capture` | 操作デモ動画の作り方 |
| `repo-setup` | フォルダの自動セットアップ |

あわせて使う公式スキル：

- Cloudflare 公式プラグイン（インストーラが入れる）
- Remotion 公式スキル（`/new pv` のときにリポジトリの `.claude/skills/` に入る）
- Slidev 公式スキル（`@slidev/cli` に同梱。pnpm が `.claude/skills/pnpm-*` に入れる）

## ランチャー（任意）

フォルダ名を打つだけで、そのフォルダで Claude Code を開く。候補はホーム直下の git リポジトリ。

```bash
git clone https://github.com/Waseda-Game-Co-creation-Studio/claude-proto-kit.git ~/claude-proto-kit
```

- **Windows（PowerToys Run）**：PowerToys と .NET SDK 9 以上を入れてから
  `powershell -ExecutionPolicy Bypass -File ~/claude-proto-kit/launcher/powertoys/install.ps1`。
  PowerToys が一度再起動する。使い方は `Alt+Space` → フォルダ名 → Enter
- **Mac（Raycast）**：`cd ~/claude-proto-kit/launcher/raycast && npm install && npm run dev` で読み込み、
  「Open in Claude Code」にホットキーを割り当てる

## 更新

- `/proto-init` 済み（自動セットアップ済み）のリポジトリでは、プラグインの自動更新が有効
- 手動で更新するときは Claude Code の `/plugin` から

## 注意

- workers.dev / r2.dev の URL は、知っていれば誰でも見られる。API キーはフロントに置かず、Worker のシークレットに入れる
- 有料の API を呼ぶ Worker を公開するときは、レート制限を付ける
- Remotion は、個人と 3 名以下の組織なら無料。4 名以上の営利組織は企業ライセンスが必要
- Playwright の録画は約 25fps

## 開発

- ブランチを切って PR。`plugin.json` に `version` は書かない（書くと番号を上げない限り更新されない）
- 手元で試す：`claude --plugin-dir ./plugins/proto-kit`
- 検証：`claude plugin validate plugins/proto-kit`
- インストーラは `irm … | iex` で流し込むため、`install.ps1` は BOM なし・ASCII だけで書く
