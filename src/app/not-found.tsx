import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="text-8xl font-black text-indigo-600 mb-4">404</div>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link href="/">Go Back Home</Link>
    </div>
  );
}
