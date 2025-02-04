"use client";

import { useRef, useState } from "react";
import { fetchFile } from "@ffmpeg/util";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const bass = (g) => `bass=g=${g}:f=110:w=0.3`;

const object = {
	Bassboost_Low: bass(15),
	Bassboost: bass(20),
	Bassboost_High: bass(30),
	"8D": "apulsator=hz=0.09",
	Daycore: "aresample=48000,asetrate=48000*0.8",
	Nightcore: "aresample=48000,asetrate=48000*1.25",
	Lofi: "aresample=48000,asetrate=48000*0.9,extrastereo=m=2.5:c=disabled",
	Phaser: "aphaser=in_gain=0.4",
	Tremolo: "tremolo",
	Vibrato: "vibrato=f=6.5",
	Reverse: "areverse",
	Treble: "treble=g=5",
	Normalizer_2: "dynaudnorm=g=101",
	Normalizer: "acompressor",
	Surrounding: "surround",
	Pulsator: "apulsator=hz=1",
	Subboost: "asubboost",
	Karaoke: "stereotools=mlev=0.03",
	Flanger: "flanger",
	Gate: "agate",
	Haas: "haas",
	Mcompand: "mcompand",
	Mono: "pan=mono|c0=.5*c0+.5*c1",
	Mstlr: "stereotools=mode=ms>lr",
	Mstrr: "stereotools=mode=ms>rr",
	Compressor: "compand=points=-80/-105|-62/-80|-15.4/-15.4|0/-12|20/-7.6",
	Expander:
		"compand=attacks=0:points=-80/-169|-54/-80|-49.5/-64.6|-41.1/-41.1|-25.8/-15|-10.8/-4.5|0/0|20/8.3",
	Softlimiter: "compand=attacks=0:points=-80/-80|-12.4/-12.4|-6/-8|0/-6.8|20/-2.8",
	Chorus: "chorus=0.7:0.9:55:0.4:0.25:2",
	Chorus_2D: "chorus=0.6:0.9:50|60:0.4|0.32:0.25|0.4:2|1.3",
	Chorus_3D: "chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3",
	Fadein: "afade=t=in:ss=0:d=10",
	Dim: `afftfilt="'real=re * (1-clip((b/nb)*b,0,1))':imag='im * (1-clip((b/nb)*b,0,1))'"`,
	Earrape: "channelsplit,sidechaingate=level_in=64",
	Silence_Remove: "silenceremove=1:0:-50dB",
};

export default function UI({ ffmpeg }) {
	const [isUploading, setIsUploading] = useState(false);
	const [isUploaded, setIsUploaded] = useState(false);
	const base64File = useRef("");
	const [file, setFile] = useState();
	const filters = useRef([]);
	const audioRef2 = useRef();
	const audioRef = useRef("");
	const [encoding, setEncoding] = useState(false);
	const audioUrl = useRef("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!file) return;

		if (!["audio/ogg", "audio/mpeg"].includes(file.type))
			return alert("Error: The file should be mp3 or ogg");

		setIsUploading(true);

		const fileData = await fetch("https://httpbin.org/post", {
			method: "POST",
			body: file,
			headers: {
				"content-type": file.type,
				"content-length": `${file.size}`,
			},
		});

		const fileJson = await fileData.json();

		const base64 = fileJson.data;

		base64File.current = base64;

		setIsUploaded(true);

		const blob = await (await fetch(base64File.current)).blob();

		const objectUrl = URL.createObjectURL(blob);

		audioRef2.current.src = objectUrl;
		audioUrl.current = objectUrl;
	};

	const handleEncode = async () => {
		if (!ffmpeg) return;
		setEncoding(true);

		const objectUrl = audioUrl.current;

		await ffmpeg.writeFile("input.mp3", await fetchFile(objectUrl));

		await ffmpeg.exec([
			"-i",
			"input.mp3",
			"-af",
			filters.current.join(","),
			"ffmpeg_output_process.mp3",
		]);

		const data = await ffmpeg.readFile("ffmpeg_output_process.mp3");

		const url = URL.createObjectURL(new Blob([data.buffer], { type: "audio/mp3" }));

		audioRef.current.src = url;

		setEncoding(false);
	};

	return (
		<div className='min-h-screen bg-gray-900 p-4'>
			{isUploading ? (
				isUploaded ? (
					<div className='space-y-4'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='p-4 rounded-lg border-4 border-white'>
								<h2 className='text-white text-2xl font-bold mb-4'>Editing {file.name}</h2>
								<audio
									controls
									ref={audioRef}
									className='w-full mb-4'
								/>
								<h3 className='text-white text-center mb-2'>Original</h3>
								<audio
									controls
									ref={audioRef2}
									className='w-full'
								/>
							</div>
							<div className='p-4 rounded-lg border-4 border-white overflow-auto max-h-96'>
								{Object.keys(object).map((val) => (
									<div
										key={val}
										className='flex items-center space-x-4 py-2'>
										<Switch
											id={val}
											onCheckedChange={(checked) => {
												if (checked) {
													filters.current.push(object[val]);
												} else {
													filters.current = filters.current.filter((v) => v !== object[val]);
												}
											}}
										/>
										<Label
											htmlFor={val}
											className='text-white'>
											{val.replace("_", " ")}
										</Label>
									</div>
								))}
							</div>
						</div>
						<div className='flex justify-center'>
							<Button
								onClick={handleEncode}
								disabled={encoding}>
								{encoding ? "Encoding..." : "Encode"}
							</Button>
						</div>
					</div>
				) : (
					<div className='flex justify-center items-center h-64'>
						<div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white'></div>
					</div>
				)
			) : (
				<form
					onSubmit={handleSubmit}
					className='max-w-sm mx-auto'>
					<div className='space-y-4'>
						<Input
							type='file'
							onChange={(e) => setFile(e.target.files[0])}
							accept='audio/ogg,audio/mpeg'
						/>
						<Button
							type='submit'
							className='w-full'>
							Submit
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}
