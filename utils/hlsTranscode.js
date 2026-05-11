const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs/promises");
const ffmpegPath = require("ffmpeg-static");

/**
 * FFmpeg prints stream list to stderr for `ffmpeg -i <input>` (non-interactive).
 */
function probeInputHasAudio(input) {
  return new Promise((resolve) => {
    if (!ffmpegPath) {
      resolve(false);
      return;
    }
    const ff = spawn(ffmpegPath, ["-hide_banner", "-i", input], { windowsHide: true });
    let err = "";
    ff.stderr.on("data", (c) => {
      err += c.toString();
    });
    ff.on("close", () => {
      resolve(/\bAudio:\s/.test(err));
    });
  });
}

/**
 * Adaptive HLS (360p / 720p / 1080p) after MP4 upload.
 *
 * FFmpeg writes:
 *   streams/<videoId>/master.m3u8          ← load this in the player
 *   streams/<videoId>/stream_0/playlist.m3u8 + segment*.ts  (360p)
 *   streams/<videoId>/stream_1/playlist.m3u8 + segment*.ts  (720p)
 *   streams/<videoId>/stream_2/playlist.m3u8 + segment*.ts  (1080p)
 *
 * hls.js and Safari read master.m3u8 and switch variants by bandwidth (ABR).
 */
function transcodeVideoToHls(videoId, mp4Source) {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error("ffmpeg-static did not provide a binary path"));
      return;
    }

    const outDir = path.join(__dirname, "..", "streams", String(videoId));

    (async () => {
      await fs.mkdir(outDir, { recursive: true });

      const hasAudio = await probeInputHasAudio(mp4Source);

      const filterComplex = [
        "[0:v]scale=-2:360:flags=lanczos,setsar=1[v360];",
        "[0:v]scale=-2:720:flags=lanczos,setsar=1[v720];",
        "[0:v]scale=-2:1080:flags=lanczos,setsar=1[v1080]",
      ].join("");

      const videoCodec = [
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-g",
        "48",
        "-keyint_min",
        "48",
        "-sc_threshold",
        "0",
        "-b:v:0",
        "800k",
        "-maxrate:v:0",
        "900k",
        "-bufsize:v:0",
        "1200k",
        "-b:v:1",
        "2800k",
        "-maxrate:v:1",
        "3150k",
        "-bufsize:v:1",
        "4200k",
        "-b:v:2",
        "5000k",
        "-maxrate:v:2",
        "5350k",
        "-bufsize:v:2",
        "7500k",
      ];

      let maps;
      let varStreamMap;
      let audioCodec = [];

      if (hasAudio) {
        maps = [
          "-map",
          "[v360]",
          "-map",
          "0:a:0",
          "-map",
          "[v720]",
          "-map",
          "0:a:0",
          "-map",
          "[v1080]",
          "-map",
          "0:a:0",
        ];
        varStreamMap = "v:0,a:0 v:1,a:0 v:2,a:0";
        audioCodec = ["-c:a", "aac", "-b:a", "128k", "-ac", "2"];
      } else {
        maps = ["-map", "[v360]", "-map", "[v720]", "-map", "[v1080]"];
        varStreamMap = "v:0 v:1 v:2";
      }

      const args = [
        "-y",
        "-i",
        mp4Source,
        "-filter_complex",
        filterComplex,
        ...maps,
        ...videoCodec,
        ...audioCodec,
        "-f",
        "hls",
        "-hls_time",
        "10",
        "-hls_playlist_type",
        "vod",
        "-hls_flags",
        "independent_segments",
        "-hls_segment_type",
        "mpegts",
        "-master_pl_name",
        "master.m3u8",
        "-hls_segment_filename",
        "stream_%v/segment%03d.ts",
        "-var_stream_map",
        varStreamMap,
        "stream_%v/playlist.m3u8",
      ];

      const ff = spawn(ffmpegPath, args, {
        cwd: outDir,
        windowsHide: true,
      });

      let stderr = "";
      ff.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      ff.on("error", (err) => {
        reject(err);
      });

      ff.on("close", (code) => {
        if (code === 0) {
          resolve({
            outDir,
            master: path.join(outDir, "master.m3u8"),
          });
        } else {
          reject(new Error(`ffmpeg exited with ${code}: ${stderr.slice(-800)}`));
        }
      });
    })().catch(reject);
  });
}

module.exports = { transcodeVideoToHls };
