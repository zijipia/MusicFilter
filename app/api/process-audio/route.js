import fs from "fs";
import path from "path";
import { promisify } from "util";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import multer from "multer";
import { NextResponse } from "next/server";

const unlinkAsync = promisify(fs.unlink);
ffmpeg.setFfmpegPath(ffmpegStatic);

// Cấu hình Multer
const upload = multer({ dest: "/tmp/" });

// API Route xử lý POST request
export async function POST(req) {
	const formData = await req.formData();
	const file = formData.get("audio");
	const filter = formData.get("filter");
	const value = formData.get("value");

	if (!file) {
		return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
	}

	const filePath = path.join("/tmp/", file.name);
	const outputPath = path.join("/tmp/", `processed_${file.name}`);

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
		fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

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

		return new NextResponse(processedAudio, { headers: { "Content-Type": "audio/mpeg" } });
	} catch (error) {
		console.error("FFmpeg error:", error);
		return NextResponse.json({ error: "Audio processing failed" }, { status: 500 });
	}
}
