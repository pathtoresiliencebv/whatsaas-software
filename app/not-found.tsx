import Link from 'next/link';
import { CircleIcon } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[100dvh]">
      <div className="max-w-md space-y-8 p-4 text-center">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Pagina niet gevonden
        </h1>
        <p className="text-base text-muted-foreground">
          De pagina die je zoekt is mogelijk verwijderd, van naam veranderd of tijdelijk niet beschikbaar.
        </p>
        <Link
          href="/"
          className="max-w-48 mx-auto flex justify-center py-2 px-4 border border-border rounded-full shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
