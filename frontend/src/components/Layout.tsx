type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white">
        <div className="border-b border-slate-700 px-6 py-5">
          <div className="text-xl font-bold">
            Psychotool
          </div>

          <div className="mt-1 text-xs text-slate-400">
            Nástroj pre psychológov
          </div>
        </div>

        <nav className="p-4">
          <a
            href="#"
            className="mb-1 block rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium"
          >
            Prehľad
          </a>

          <a
            href="#"
            className="mb-1 block rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
          >
            Klienti
          </a>

          <a
            href="#"
            className="mb-1 block rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
          >
            Dotazníky
          </a>

          <a
            href="#"
            className="mb-1 block rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
          >
            Výsledky
          </a>

          <a
            href="#"
            className="block rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-slate-800"
          >
            Nastavenia
          </a>
        </nav>

        {/* USER */}
        <div className="absolute bottom-0 w-64 border-t border-slate-700 p-4">
          <div className="text-sm font-medium">
            Testovací Psychológ
          </div>

          <div className="text-xs text-slate-400">
            psycholog@test.sk
          </div>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1">
        <header className="border-b border-slate-200 bg-white px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Prehľad
              </h1>

              <p className="text-sm text-slate-500">
                Vitajte v Psychotool
              </p>
            </div>

            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm">
              Testovací Psychológ
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;