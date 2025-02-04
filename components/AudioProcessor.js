"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function AudioProcessor() {
	const [audioFile, setAudioFile] = useState(null);
	const [processedAudio, setProcessedAudio] = useState(null);
	const [filter, setFilter] = useState("none");
	const [filterValue, setFilterValue] = useState(0);
	const [isProcessing, setIsProcessing] = useState(false);

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setAudioFile(file);
		}
	};

	const processAudio = async () => {
		if (!audioFile) return;

		setIsProcessing(true);
		const formData = new FormData();
		formData.append("audio", audioFile);
		formData.append("filter", filter);
		formData.append("value", filterValue);

		try {
			const response = await fetch("/api/process-audio", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) throw new Error("Processing failed");

			const blob = await response.blob();
			setProcessedAudio(URL.createObjectURL(blob));
		} catch (error) {
			console.error("Error processing audio:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className='space-y-4'>
			<div>
				<Label htmlFor='audio-file'>Upload Audio File</Label>
				<Input
					id='audio-file'
					type='file'
					accept='audio/*'
					onChange={handleFileChange}
				/>
			</div>

			{audioFile && (
				<>
					<div>
						<Label htmlFor='filter'>Select Filter</Label>
						<Select onValueChange={setFilter}>
							<SelectTrigger>
								<SelectValue placeholder='Select a filter' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='none'>None</SelectItem>
								<SelectItem value='volume'>Volume</SelectItem>
								<SelectItem value='pitch'>Pitch</SelectItem>
								<SelectItem value='tempo'>Tempo</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{filter !== "none" && (
						<div>
							<Label>Adjust Filter</Label>
							<Slider
								min={-100}
								max={100}
								step={1}
								value={[filterValue]}
								onValueChange={(value) => setFilterValue(value[0])}
							/>
							<span>{filterValue}</span>
						</div>
					)}

					<Button
						onClick={processAudio}
						disabled={isProcessing}>
						{isProcessing ? "Processing..." : "Process Audio"}
					</Button>
				</>
			)}

			{processedAudio && (
				<div>
					<h2 className='text-xl font-semibold mb-2'>Processed Audio</h2>
					<audio
						controls
						src={processedAudio}
					/>
					<Button
						asChild
						className='mt-2'>
						<a
							href={processedAudio}
							download='processed_audio.mp3'>
							Download Processed Audio
						</a>
					</Button>
				</div>
			)}
		</div>
	);
}
