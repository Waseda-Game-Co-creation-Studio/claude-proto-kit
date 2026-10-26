# claude-proto-kit

Claude Code で、Web / 3D プロトタイプ・スライド・PV を作って公開するまでを手早くするプラグイン。
一度インストールすれば、どのフォルダでも `/new` と打つだけで始められる（リポジトリごとの準備は自動）。

*A Claude Code plugin for fast prototyping: web / 3D toys (Vite + React + R3F), slides (Slidev) and promo videos
(Remotion), published to Cloudflare. Install once; any folder is set up automatically the first time you use it.*

## インストール（1回だけ）

**Windows（PowerShell）**

```powershell
irm https://raw.githubusercontent.com/Waseda-Game-Co-creation-Studio/claude-proto-kit/main/install.ps1 | iex
```

**Mac / Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/Waseda-Game-Co-creation-Studio/claude-proto-kit/main/install.sh | bash
```

足りなければ Node.js・Git・pnpm・Claude Code を入れ、`proto-kit` と Cloudflare 公式プラグインをユーザー単位で登録する。
Claude Code が入っているなら、次の 2 行でも同じ：

```text
/plugin marketplace add Waseda-Game-Co-creation-Studio/claude-proto-kit
/plugin install proto-kit@claude-proto-kit
```

そのあと一度だけログインする：`claude` と `npx wrangler login`（ブラウザが開いたら 2 分以内に許可）。

## 使い方

空のフォルダでも既存のリポジトリでも、Claude Code を開いて：

```text
/new web hello        Vite + React + R3F のプロトタイプ
/new slides talk      Slidev のスライド
/new pv teaser        Remotion の動画
/deploy               Cloudflare Workers に公開して URL を返す
/render <Composition> 動画を書き出して R2 にアップロードし、URL を返す
/capture <URL>        ブラウザの自動操作を録画し、カーソル付きのデモ動画にする
```

初めて使うフォルダでは、最初のコマンドの前に自動でセットアップされる（`/proto-init` で明示的にも実行できる）：

| 追加されるもの | 役割 |
| --- | --- |
| `CLAUDE.md` | パッケージの置き場所、Worker 名の接頭辞、Cloudflare の設定欄（最初のデプロイで埋まる） |
| `pnpm-workspace.yaml`、`package.json` | pnpm ワークスペース。許可するのは esbuild / workerd のビルドと Slidev のスキルだけ |
| `.claude/settings.json` | `wrangler deploy` や `delete` などの前に承認を求めるルール。共同作業者にもこのプラグインを案内する |
| `.gitignore`、`.gitattributes` | 動画や秘密情報を入れない、改行を LF に揃える |

Cloudflare のアカウントは最初の `/deploy` で聞かれる。複数のアカウント（個人・チーム）に所属していても、
リポジトリごとの `CLAUDE.md` と `wrangler.jsonc` の `account_id` で分けられる。

## 中身

| スキル | 内容 |
| --- | --- |
| `workflow` | 共通の約束ごと：Cloudflare のアカウント、命名、R2、秘密情報、プレビュー、git |
| `web-prototype` | Vite + React + R3F の作り方と公開 |
| `slides` | Slidev の作り方と公開（Slidev 公式スキルと併用） |
| `capture` | Playwright で操作を録画し、Remotion でカーソル・クリック・ズーム・字幕を付ける |
| `repo-setup` | 上記の自動セットアップ |

Remotion の公式スキルは `/new pv` のときにリポジトリへ入る。

## ランチャー（任意）

フォルダ名を打つだけで、そのフォルダで Claude Code を開く（候補はホーム直下の git リポジトリ）。

```bash
git clone https://github.com/Waseda-Game-Co-creation-Studio/claude-proto-kit.git ~/claude-proto-kit
```

- **Windows（PowerToys Run）**：PowerToys と .NET SDK 9 以上を入れてから
  `powershell -ExecutionPolicy Bypass -File ~/claude-proto-kit/launcher/powertoys/install.ps1`。
  `Alt+Space` → フォルダ名 → Enter
- **Mac（Raycast）**：`cd ~/claude-proto-kit/launcher/raycast && npm install && npm run dev` で読み込み、
  「Open in Claude Code」にホットキーを割り当てる

## 注意

- workers.dev / r2.dev の URL は、知っていれば誰でも見られる。API キーはフロントに置かない（Worker のシークレットへ）
- Remotion は、個人と 3 名以下の組織なら無料。4 名以上の営利組織は企業ライセンスが必要
- プラグインは自動更新されない設定が既定。更新は `/plugin` から（`/proto-init` したリポジトリでは自動更新が有効）

## 開発

- ブランチを切って PR。`plugin.json` に `version` は書かない
- 手元で試す：`claude --plugin-dir ./plugins/proto-kit`、検証：`claude plugin validate plugins/proto-kit`

## License

MIT
