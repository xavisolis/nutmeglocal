import { DirectorySkeleton } from '@/components/directory/business-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function DirectoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-9 w-48 mb-2" />
      <Skeleton className="h-5 w-80 mb-8" />
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <DirectorySkeleton />
    </div>
  );
}
