import { Action, ActionPanel, closeMainWindow, Icon, List } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { useMemo } from "react";

// フォルダ名を入力すると、そのフォルダで Claude Code を開く。
// 候補はホーム直下の git リポジトリと ~/sandbox/packages/* で、開くたびにその場で集める。

type Candidate = { label: string; path: string };

function subdirectories(root: string): string[] {
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("."))
      .map((d) => join(root, d.name));
  } catch {
    return [];
  }
}

function candidates(): Candidate[] {
  const home = homedir();
  // .git はディレクトリ（通常）でもファイル（worktree）でもよい
  const repos = subdirectories(home)
    .filter((dir) => existsSync(join(dir, ".git")))
    .map((dir) => ({ label: basename(dir), path: dir }));
  const experiments = subdirectories(join(home, "sandbox", "packages")).map((dir) => ({
    label: `sandbox/${basename(dir)}`,
    path: dir,
  }));
  return [...repos, ...experiments];
}

async function openInClaude(dir: string) {
  // JSON.stringify のエスケープ（\" と \\）はシェルと AppleScript の両方でそのまま通る
  const command = `cd ${JSON.stringify(dir)} && claude`;
  await closeMainWindow();
  await runAppleScript(`tell application "Terminal"
  activate
  do script ${JSON.stringify(command)}
end tell`);
}

export default function Command() {
  const items = useMemo(candidates, []);

  return (
    <List searchBarPlaceholder="フォルダ名">
      {items.map((item) => (
        <List.Item
          key={item.path}
          icon={Icon.Terminal}
          title={item.label}
          subtitle={item.path}
          actions={
            <ActionPanel>
              <Action title="Open in Claude Code" icon={Icon.Terminal} onAction={() => openInClaude(item.path)} />
              <Action.ShowInFinder path={item.path} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
