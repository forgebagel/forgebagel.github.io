export default function TestEmbedPage() {
  return (
    <main className="w-full min-h-screen bg-black p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto rounded-2xl border-2 border-slate-700 shadow-2xl shadow-black/40 overflow-hidden bg-black">
        <iframe
          src="https://www.vidking.net/embed/movie/1007757"
          width="100%"
          height="600"
          className="aspect-video"
          frameBorder="0"
          allowFullScreen
          title="Test Embed"
        />
      </div>
    </main>
  );
}
