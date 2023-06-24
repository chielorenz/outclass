import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full p-8 bg-neutral-900 text-white">
        <div className="mb-8 space-y-2 text-neutral-400 italic">
          <h1 className="text-3xl">Outclass playground</h1>
          <p>
            Outclass is a class string manipulation tool,{" "}
            <a href="https://github.com/b1n01/outclass" className="underline">
              read more.
            </a>
          </p>
        </div>
        {children}
      </body>
    </html>
  );
}
