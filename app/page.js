import dynamic from "next/dynamic";

const AudioProcessor = dynamic(() => import("../components/AudioProcessor"), { ssr: false });

export default function Home() {
	return <AudioProcessor />;
}
