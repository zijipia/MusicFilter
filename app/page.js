import AudioProcessor from "@/components/AudioProcessor";

export default function Home() {
	return (
		<div className='container mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-4'>Audio Processor</h1>
			<AudioProcessor />
		</div>
	);
}
