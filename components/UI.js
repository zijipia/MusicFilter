"use client";

import { useRef, useState, useEffect } from "react";
import { fetchFile } from "@ffmpeg/util";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "./ui/scroll-area";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { BiUpload } from "react-icons/bi";

const filtersList = {
	Bassboost_Low: "bass=g=15:f=110:w=0.3",
	Bassboost: "bass=g=20:f=110:w=0.3",
	Bassboost_High: "bass=g=30:f=110:w=0.3",
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

export default function UI({ ffmpeg, logs }) {
	const [file, setFile] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [filters, setFilters] = useState([]);
	const audioRef = useRef();
	const originalAudioRef = useRef();
	const audioUrl = useRef("");
	const [showLog, setShowLog] = useState(false);
	const logEndRef = useRef(null);

	useEffect(() => {
		if (logEndRef.current) {
			logEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [logs]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!file) return alert("Please upload an MP3 or OGG file.");
		setIsProcessing(true);

		const objectUrl = URL.createObjectURL(file);
		originalAudioRef.current.src = objectUrl;
		audioUrl.current = objectUrl;
		setIsProcessing(false);
	};

	const handleEncode = async () => {
		if (!ffmpeg || filters.length === 0) return;
		setIsProcessing(true);

		await ffmpeg.writeFile("input.mp3", await fetchFile(audioUrl.current));
		await ffmpeg.exec(["-i", "input.mp3", "-af", filters.join(","), "output.mp3"]);

		const data = await ffmpeg.readFile("output.mp3");
		const url = URL.createObjectURL(new Blob([data.buffer], { type: "audio/mp3" }));
		audioRef.current.src = url;
		setIsProcessing(false);
	};

	return (
		<div className='min-h-screen flex items-center justify-center gap-6 p-6'>
			<div className='md:col-span-2 space-y-6 w-1/2'>
				<Card className='backdrop-blur-sm drop-shadow-lg bg-background/80 dark:bg-background/40'>
					<h2 className='text-2xl font-semibold text-center mt-4 mb-4'>Audio Editor</h2>
					<CardHeader>
						<div className='relative'>
							<form
								onSubmit={handleSubmit}
								className=''>
								<Input
									type='file'
									accept='audio/ogg,audio/mpeg'
									onChange={(e) => setFile(e.target.files[0])}
								/>
								<Button
									type='submit'
									className='absolute right-0 top-1/2 transform -translate-y-1/2'>
									<BiUpload />
									Upload
								</Button>
							</form>
						</div>
					</CardHeader>
					{file && (
						<>
							<CardContent>
								<h3 className='text-lg font-semibold mb-4'>Filters</h3>
								<ScrollArea className='h-[450px] pr-4'>
									<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto'>
										{Object.keys(filtersList).map((filter) => (
											<div
												key={filter}
												className='flex items-center space-x-3 mb-2'>
												<Switch
													onCheckedChange={(checked) => {
														setFilters(
															checked
																? [...filters, filtersList[filter]]
																: filters.filter((f) => f !== filtersList[filter]),
														);
													}}
												/>
												<Label>{filter}</Label>
											</div>
										))}
									</div>
								</ScrollArea>
							</CardContent>
							<CardFooter>
								<Button
									onClick={handleEncode}
									disabled={isProcessing}
									className='mt-4 w-full'>
									{isProcessing ? "Processing..." : "Apply Filters"}
								</Button>
								<Button
									onClick={() => setShowLog(!showLog)}
									className='mt-4 border-black'
									variant='outline'>
									{showLog ? "Hide Log" : "Show Log"}
								</Button>
							</CardFooter>
						</>
					)}
				</Card>
			</div>
			{file && (
				<div className='md:col-span-1 w-1/2'>
					<Card className='sticky top-4 drop-shadow-lg backdrop-blur-sm bg-background/80 dark:bg-background/40'>
						<CardHeader>
							<CardTitle className='text-2xl font-semibold text-center'>Output Audio</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-6'>
								<div className='justify-center text-center'>
									<Card className='mt-2 mb-2 mr-2 ml-2'>
										<div className='mt-6 mb-6 mr-6 ml-6'>
											<h3 className='text-lg font-semibold mb-4'>Original Audio</h3>
											<audio
												controls
												ref={originalAudioRef}
												className='w-full mt-2'
											/>
										</div>
									</Card>
									<Card className='mt-2 mb-2 mr-2 ml-2'>
										<div className='mt-6 mb-6 mr-6 ml-6'>
											<h3 className='text-lg font-semibold mb-4'>Processed Audio</h3>
											<audio
												controls
												ref={audioRef}
												className='w-full mt-2'
											/>
										</div>
									</Card>
								</div>
							</div>
						</CardContent>
					</Card>

					{showLog && (
						<Card className='backdrop-blur-sm drop-shadow-lg bg-background/80 dark:bg-background/40 mt-4'>
							<CardHeader>
								<CardTitle className='text-2xl font-semibold text-center'>FFmpeg Logs</CardTitle>
							</CardHeader>
							<CardContent>
								<ScrollArea className='h-[200px] pr-4'>
									<div className='space-y-2'>
										{logs.map((log, index) => (
											<div
												key={index}
												className='text-sm'>
												{log}
											</div>
										))}
										<div ref={logEndRef} />
									</div>
								</ScrollArea>
							</CardContent>
						</Card>
					)}
				</div>
			)}
		</div>
	);
}
