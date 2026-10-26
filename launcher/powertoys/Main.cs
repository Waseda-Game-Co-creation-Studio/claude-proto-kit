using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using Wox.Plugin;

namespace Community.PowerToys.Run.Plugin.ClaudeLauncher
{
    // フォルダ名を入力すると、そのフォルダで Claude Code を開く。
    // 候補はホーム直下の git リポジトリと ~/sandbox/packages/* で、検索のたびにその場で集める。
    public class Main : IPlugin
    {
        private const string IconPath = "Images\\claude.png";
        private const int MaxResults = 8;
        private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

        private static readonly string Home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);

        private List<Candidate> _cache = new();
        private DateTime _cachedAt = DateTime.MinValue;

        // PowerToys Run が plugin.json の ID と照合する
        public static string PluginID => "C1A0DE5E7B2F4E8A9D3C6B1F0E4A2D7C";

        public string Name => "Claude Launcher";

        public string Description => "フォルダ名を入力して Claude Code を開く";

        public void Init(PluginInitContext context)
        {
        }

        public List<Result> Query(Query query)
        {
            var search = query.Search?.Trim() ?? string.Empty;
            if (search.Length == 0)
            {
                return new List<Result>();
            }

            return Candidates()
                .Select(c => (Candidate: c, Score: Match(c.Name, search)))
                .Where(x => x.Score > 0)
                .OrderByDescending(x => x.Score)
                .ThenBy(x => x.Candidate.Label, StringComparer.OrdinalIgnoreCase)
                .Take(MaxResults)
                .Select(x => new Result
                {
                    Title = $"Claude: {x.Candidate.Label}",
                    SubTitle = x.Candidate.Path,
                    IcoPath = IconPath,
                    Score = x.Score,
                    Action = _ => Launch(x.Candidate.Path),
                })
                .ToList();
        }

        private List<Candidate> Candidates()
        {
            // 入力のたびに走査すると重いので、短時間だけ結果を使い回す
            if (DateTime.UtcNow - _cachedAt < CacheTtl)
            {
                return _cache;
            }

            var list = new List<Candidate>();
            foreach (var dir in SafeDirectories(Home))
            {
                var name = Path.GetFileName(dir);
                if (!name.StartsWith('.') && IsGitRepo(dir))
                {
                    list.Add(new Candidate(name, name, dir));
                }
            }

            foreach (var dir in SafeDirectories(Path.Combine(Home, "sandbox", "packages")))
            {
                var name = Path.GetFileName(dir);
                list.Add(new Candidate(name, $"sandbox/{name}", dir));
            }

            _cache = list;
            _cachedAt = DateTime.UtcNow;
            return list;
        }

        private static IEnumerable<string> SafeDirectories(string root)
        {
            try
            {
                return Directory.Exists(root) ? Directory.GetDirectories(root) : Array.Empty<string>();
            }
            catch (Exception)
            {
                return Array.Empty<string>();
            }
        }

        // .git はディレクトリ（通常）でもファイル（worktree）でもよい
        private static bool IsGitRepo(string dir)
        {
            var git = Path.Combine(dir, ".git");
            return Directory.Exists(git) || File.Exists(git);
        }

        // 完全一致 > 前方一致 > 部分一致 > 文字順の一致（例: "tdp" → "Team-Development-Practice"）
        private static int Match(string name, string search)
        {
            if (name.Equals(search, StringComparison.OrdinalIgnoreCase))
            {
                return 300;
            }

            if (name.StartsWith(search, StringComparison.OrdinalIgnoreCase))
            {
                return 250;
            }

            if (name.Contains(search, StringComparison.OrdinalIgnoreCase))
            {
                return 200;
            }

            var i = 0;
            foreach (var ch in name)
            {
                if (i < search.Length && char.ToLowerInvariant(ch) == char.ToLowerInvariant(search[i]))
                {
                    i++;
                }
            }

            return i == search.Length ? 100 : 0;
        }

        private static bool Launch(string dir)
        {
            try
            {
                Process.Start(new ProcessStartInfo("wt.exe")
                {
                    Arguments = $"-d \"{dir}\" powershell -NoExit -Command claude",
                    UseShellExecute = true,
                });
            }
            catch (Exception)
            {
                // Windows Terminal が無い環境では PowerShell のウィンドウで開く
                Process.Start(new ProcessStartInfo("powershell.exe")
                {
                    Arguments = "-NoExit -Command claude",
                    WorkingDirectory = dir,
                    UseShellExecute = true,
                });
            }

            return true;
        }

        private sealed record Candidate(string Name, string Label, string Path);
    }
}
