'use client';

import { useEffect, useState } from 'react';

type CommentItem = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

type CommentSectionProps = {
  movieId: string;
  movieTitle: string;
};

const getStorageKey = (movieId: string) => `movie-comments:${movieId}`;

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function CommentSection({ movieId, movieTitle }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    try {
      const rawComments = window.localStorage.getItem(getStorageKey(movieId));
      if (rawComments) {
        const parsedComments = JSON.parse(rawComments);
        if (Array.isArray(parsedComments)) {
          setComments(parsedComments);
        }
      }
    } catch {
      setComments([]);
    }
  }, [movieId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(getStorageKey(movieId), JSON.stringify(comments));
    } catch {
      // Ignore storage failures in private browsing or restricted contexts.
    }
  }, [comments, movieId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim() || 'Guest';
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    const newComment: CommentItem = {
      id: crypto.randomUUID(),
      name: trimmedName,
      text: trimmedText,
      createdAt: new Date().toISOString(),
    };

    setComments((currentComments) => [newComment, ...currentComments]);
    setName('');
    setText('');
  };

  return (
    <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Community</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Comments for {movieTitle}</h2>
        </div>
        <p className="text-sm text-slate-300">Share a quick thought about the movie.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Comment</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Write your comment here..."
              rows={4}
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-400">{comments.length} comment{comments.length === 1 ? '' : 's'}</p>
          <button
            type="submit"
            className="rounded-full bg-cyan-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-950 transition hover:bg-cyan-400"
          >
            Post Comment
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{comment.name}</h3>
                  <span className="text-xs uppercase tracking-[0.28em] text-cyan-300/70">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setComments((currentComments) => currentComments.filter((entry) => entry.id !== comment.id));
                  }}
                  className="rounded-full border border-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-rose-400/50 hover:text-rose-300"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm leading-relaxed text-slate-200">{comment.text}</p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-6 text-center text-sm text-slate-400">
            No comments yet. Be the first to talk about {movieTitle}.
          </div>
        )}
      </div>
    </section>
  );
}