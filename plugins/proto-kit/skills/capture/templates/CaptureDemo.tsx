import {
  AbsoluteFill,
  type CalculateMetadataFunction,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// capture/*.mjs が書き出した録画と操作ログから、カーソル付きのデモ動画を作る。
// 録画にはカーソルが映っていないので、ログの座標からここで描く。

type CaptureEvent = {
  t: number;
  type: "ready" | "move" | "down" | "up" | "wheel" | "end";
  x: number;
  y: number;
  deltaY?: number;
};

export type CaptureLog = {
  width: number;
  height: number;
  ready: number;
  end: number;
  events: CaptureEvent[];
};

export type CaptureProps = {
  name: string;
  log: CaptureLog | null;
};

const FPS = 30;
// 操作が始まる少し前から映す（秒）
const LEAD = 0.4;

export const calculateCaptureMetadata: CalculateMetadataFunction<
  CaptureProps
> = async ({ props }) => {
  const log: CaptureLog = await fetch(
    staticFile(`capture/${props.name}.json`),
  ).then((r) => r.json());
  return {
    durationInFrames: Math.ceil((log.end - log.ready + LEAD) * FPS),
    width: log.width,
    height: log.height,
    props: { ...props, log },
  };
};

const cursorAt = (events: CaptureEvent[], t: number) => {
  let prev = events[0];
  for (const e of events) {
    if (e.t > t) {
      const span = e.t - prev.t;
      const p = span > 0 ? (t - prev.t) / span : 1;
      return { x: prev.x + (e.x - prev.x) * p, y: prev.y + (e.y - prev.y) * p };
    }
    prev = e;
  }
  return { x: prev.x, y: prev.y };
};

const dragsOf = (events: CaptureEvent[]) => {
  const drags: { start: number; end: number; x: number; y: number }[] = [];
  for (const e of events) {
    if (e.type === "down") drags.push({ start: e.t, end: Infinity, x: e.x, y: e.y });
    if (e.type === "up" && drags.length > 0) drags[drags.length - 1].end = e.t;
  }
  return drags;
};

const Cursor: React.FC<{ x: number; y: number; pressed: boolean }> = ({
  x,
  y,
  pressed,
}) => (
  <svg
    width={36}
    height={36}
    viewBox="0 0 24 24"
    style={{
      position: "absolute",
      left: x - 4,
      top: y - 2,
      transform: `scale(${pressed ? 0.88 : 1})`,
      transformOrigin: "4px 2px",
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
    }}
  >
    <path
      d="M4 2 L4 19 L8.5 14.8 L11.6 21.6 L14.4 20.4 L11.3 13.7 L17.5 13.4 Z"
      fill="#ffffff"
      stroke="#1c1b1a"
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  </svg>
);

export const CaptureDemo: React.FC<CaptureProps> = ({ name, log }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!log) return null;

  // 録画の中での時刻
  const t = log.ready - LEAD + frame / fps;
  const events = log.events;
  const pos = cursorAt(events, t);
  const drags = dragsOf(events);
  const drag = drags.find((d) => t >= d.start && t <= d.end);
  const wheel = [...events]
    .reverse()
    .find((e) => e.type === "wheel" && e.t <= t && t - e.t < 0.45);

  // ドラッグ中は、ドラッグを始めた点に向けて少し寄る
  let zoom = 1;
  let origin = { x: log.width / 2, y: log.height / 2 };
  for (const d of drags) {
    const k = interpolate(t, [d.start - 0.3, d.start + 0.25, d.end, d.end + 0.5], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    if (k > 0) {
      zoom = 1 + 0.12 * k;
      origin = { x: d.x, y: d.y };
    }
  }

  // クリックした瞬間の波紋
  const lastDown = [...events].reverse().find((e) => e.type === "down" && e.t <= t);
  const ripple = lastDown ? (t - lastDown.t) / 0.5 : 1;

  const caption = drag
    ? "ドラッグで回転"
    : wheel
      ? wheel.deltaY! < 0
        ? "ホイールでズームイン"
        : "ホイールでズームアウト"
      : null;

  const titleOpacity = interpolate(frame, [0, 6, 30, 42], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1c1b1a" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: `${origin.x}px ${origin.y}px`,
        }}
      >
        <OffthreadVideo
          src={staticFile(`capture/${name}.webm`)}
          trimBefore={Math.max(0, Math.round((log.ready - LEAD) * fps))}
          muted
        />
        {ripple < 1 && lastDown ? (
          <div
            style={{
              position: "absolute",
              left: lastDown.x - 40 * ripple,
              top: lastDown.y - 40 * ripple,
              width: 80 * ripple,
              height: 80 * ripple,
              borderRadius: "50%",
              border: "3px solid #d97757",
              opacity: 1 - ripple,
            }}
          />
        ) : null}
        <Cursor x={pos.x} y={pos.y} pressed={Boolean(drag)} />
      </AbsoluteFill>

      {caption ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 48 }}>
          <div
            style={{
              padding: "12px 28px",
              borderRadius: 999,
              background: "rgba(28,27,26,0.82)",
              color: "#f5f0e8",
              fontFamily: "system-ui, sans-serif",
              fontSize: 30,
              fontWeight: 600,
            }}
          >
            {caption}
          </div>
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(28,27,26,0.6)",
          opacity: titleOpacity,
          color: "#f5f0e8",
          fontFamily: "system-ui, sans-serif",
          fontSize: 60,
          fontWeight: 600,
        }}
      >
        hello-r3f をさわってみる
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
