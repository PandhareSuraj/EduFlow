import { APP_CONFIG } from "@/config/appConfig";

export function Footer() {
  const { version, supportEmail } = APP_CONFIG;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 py-3 px-4 md:px-6 text-xs text-muted-foreground no-print">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>EduFlow v{version}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            © {currentYear} EduFlow. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`mailto:${supportEmail}`}
            className="hover:text-foreground transition-colors"
          >
            Contact Support
          </a>
          <span>•</span>
          <a
            href="/product-tour"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Documentation
          </a>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Press{" "}
            <kbd className="px-1 py-0.5 font-mono bg-muted border rounded text-[10px]">
              Ctrl+H
            </kbd>{" "}
            for help
          </span>
        </div>
      </div>
    </footer>
  );
}
