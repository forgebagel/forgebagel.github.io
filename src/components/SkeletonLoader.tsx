export default function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-700 rounded ${className}`}></div>
  );
}