export default function GlobalLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="relative flex items-center justify-center">
        {/* Dış dönen halka */}
        <div className="absolute w-16 h-16 border-4 border-brand-blue/20 dark:border-brand-blue/10 border-t-blue-500 rounded-full animate-spin"></div>
        {/* İç logo veya nokta */}
        <div className="w-6 h-6 bg-brand-blue rounded-full animate-pulse"></div>
      </div>
      <p className="mt-6 text-sm font-medium text-zinc-500 dark:text-zinc-400 animate-pulse">
        Yükleniyor...
      </p>
    </div>
  );
}
