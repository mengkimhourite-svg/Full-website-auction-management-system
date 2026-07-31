"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="not-found-container">
      <div className="text-8xl font-black text-red-500 mb-4">!</div>
      <h2 style={{ color: "#dc2626" }}>Something went wrong!</h2>
      <p>{error.message || "An unexpected error occurred. Please try again."}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  );
}
