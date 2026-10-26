# claude-proto-kit

Claude に日本語で頼むだけで、さわれる試作品（Web ページ・3D・スライド・動画）を作り、URL で人に見せられるようにする道具セットです。
プログラミングの知識がなくても始められます。

## はじめかた

### 1. インストールする（最初の 1 回だけ）

パソコンに合わせて、どちらか 1 行をコピーして貼り付け、Enter を押します。必要なソフトはすべて自動で入ります。

**Windows**：スタートメニューで「PowerShell」を開いて貼り付ける

```powershell
irm https://raw.githubusercontent.com/Waseda-Game-Co-creation-Studio/claude-proto-kit/main/install.ps1 | iex
```

**Mac**：「ターミナル」アプリを開いて貼り付ける

```bash
curl -fsSL https://raw.githubusercontent.com/Waseda-Game-Co-creation-Studio/claude-proto-kit/main/install.sh | bash
```

### 2. Claude を起動する

新しく PowerShell（Mac はターミナル）を開き、`claude` と入力して Enter。初回はブラウザでログインします。
Claude の有料プラン（Pro 以上）か、Anthropic Console のアカウントが必要です。

Claude のデスクトップアプリを使う場合は、「Code」タブでフォルダを選ぶだけで同じように使えます。

### 3. 作りたいものを頼む

ふつうの言葉で話しかけます。たとえば：

- 「マウスで回せる 3D の地球儀を作って」
- 「この企画を説明するスライドを 5 枚で作って」
- 「さっきの 3D を使って、10 秒の紹介動画を作って」
- 「できたものを公開して、URL を教えて」

フォルダの準備や、必要なログインの案内は Claude が自動でやります。

## 公開について

初めて公開するときは、Cloudflare（無料で使えます）のアカウントが必要です。手順は Claude が案内します。
公開した URL は、知っている人なら誰でも見られます。パスワードや個人情報は入れないでください。

## 近道コマンド（使わなくても大丈夫）

言葉で頼む代わりに、`/` で始まるコマンドでも同じことができます。

| コマンド | すること |
| --- | --- |
| `/new web 名前` | Web ページ・3D の試作品を作る |
| `/new slides 名前` | スライドを作る |
| `/new pv 名前` | 動画を作る |
| `/deploy` | 公開して URL を返す |
| `/render` | 動画を書き出して、見られる URL を返す |
| `/capture URL` | Web ページを自動で操作する様子を録画し、デモ動画にする |
| `/proto-init` | フォルダの準備だけを先にする（ふだんは自動） |

## もっと詳しく

仕組み、Cloudflare の複数アカウントの使い分け、ランチャー、開発者向けの情報は [docs/guide.md](docs/guide.md) にあります。

## License

MIT
