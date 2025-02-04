"use client";

import { useEffect, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import UI from "./UI";
import Loading from "./Loading";

export default function AudioProcessor() {
	const [ffmpeg, setFfmpeg] = useState(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const loadFFmpeg = async () => {
			const ffmpegInstance = new FFmpeg();
			const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/esm";

			ffmpegInstance.on("log", ({ message }) => {
				console.log(`[ FFMPEG LOG ] ${message}`);
			});

			await ffmpegInstance.load({
				coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
				wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
			});

			setFfmpeg(ffmpegInstance);
			setLoaded(true);
		};

		loadFFmpeg();
	}, []);

	if (!loaded) return <Loading />;

	return <UI ffmpeg={ffmpeg} />;
}
