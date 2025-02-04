"use client";

import dynamic from "next/dynamic";

const AudioProcessor = dynamic(() => import("./AudioProcessor"), { ssr: false });

export default function AudioProcessorWrapper() {
	return <AudioProcessor />;
}
