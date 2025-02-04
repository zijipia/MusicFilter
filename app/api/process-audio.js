import fs from "fs";
import path from "path";
import { promisify } from "util";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import multer from "multer";

const unlinkAsync = promisify(fs.unlink);

// Cấu hình ffmpeg-static
ffmpeg.setFfmpegPath(ffmpegStatic);

// Cấu hình Multer để xử lý file upload
const upload = multer({ dest: "/tmp/" });

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method Not Allowed" });
	}

	upload.single("audio")(req, res, async (err) => {
		if (err) return res.status(500).json({ error: "File upload failed" });

		const filePath = req.file.path;
		const outputPath = path.join("/tmp/", `processed_${req.file.filename}.mp3`);
		const { filter, value } = req.body;

		let filterCommand = "";
		switch (filter) {
			case "volume":
				filterCommand = `volume=${value}`;
				break;
			case "pitch":
				filterCommand = `asetrate=44100*${1 + value / 100},aresample=44100`;
				break;
			case "tempo":
				filterCommand = `atempo=${1 + value / 100}`;
				break;
			default:
				filterCommand = "";
		}

		try {
			await new Promise((resolve, reject) => {
				ffmpeg(filePath)
					.audioFilters(filterCommand)
					.output(outputPath)
					.on("end", resolve)
					.on("error", reject)
					.run();
			});

			const processedAudio = fs.readFileSync(outputPath);
			await unlinkAsync(filePath);
			await unlinkAsync(outputPath);

			res.setHeader("Content-Type", "audio/mpeg");
			res.send(processedAudio);
		} catch (error) {
			console.error("FFmpeg error:", error);
			res.status(500).json({ error: "Audio processing failed" });
		}
	});
}
