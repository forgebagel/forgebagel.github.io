'use client';

interface VideoEmbedProps {
  movieId: string;
}

export default function VideoEmbed({ movieId }: VideoEmbedProps) {
  return (
    <div style={{ width: '90%', maxWidth: '1000px', border: '2px solid #333', boxShadow: '0px 0px 20px rgba(0,0,0,0.5)' }}>
      <iframe
        src={`https://www.vidking.net/embed/movie/${movieId}`}
        width="100%"
        height="600"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}
