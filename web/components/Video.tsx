interface VideoProps {
  videoFile?: {
    asset?: {
      url?: string;
      _id?: string;
    };
  };
  alt?: string;
}

export default function Video({ videoFile, alt }: VideoProps) {
  if (!videoFile?.asset?.url) {
    return null;
  }

  const videoUrl = videoFile.asset.url;

  return (
    <div className="pt-[16px]">
      <video
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="w-full"
        style={{ maxWidth: '168px', height: 'auto' }}
        aria-label={alt || 'Video'}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

