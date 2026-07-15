export default function GlobalLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12 animate-pulse bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Hero / Banner Skeleton */}
      <div className="h-60 md:h-72 w-full bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />

      {/* Grid Content Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol ana içerik bloğu */}
        <div className="lg:col-span-2 space-y-8">
          <div className="h-8 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          
          <div className="space-y-4">
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-11/12 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          
          {/* Kart yer tutucuları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            {[1, 2].map((n) => (
              <div key={n} className="border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-5 space-y-4">
                <div className="aspect-[16/9] w-full bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Sağ kenar çubuğu bloğu */}
        <div className="space-y-6">
          <div className="h-8 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-2xl space-y-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex gap-4">
                <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl shrink-0" />
                <div className="flex-grow space-y-2 py-1">
                  <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
