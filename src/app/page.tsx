import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { ResumeBuddyClient } from "@/components/resume-buddy-client";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Icons.logo className="h-6 w-6" />
            <h1 className="text-2xl font-bold font-headline">
              ResumeWise
            </h1>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <ResumeBuddyClient />
      </main>
    </div>
  );
}
