import { For, Show, createSignal, lazy, onSettled } from "solid-js";
import { useLocation } from "@solidjs/router";
import { Loading } from "@solidjs/web";
import { track } from "../../analytics";
import { categories } from "../../content/categories";
import { categoryColor, categoryInk } from "../../lib/category-style";
import { Kbd } from "../ui/Kbd";
import { focusRing } from "../ui/styles";
import { Container } from "./Container";
import { ThemeToggle } from "./ThemeToggle";

const SearchDialog = lazy(() => import("../search/SearchDialog"));
const MobileNav = lazy(() => import("./MobileNav"));

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = createSignal(false);
  const [loaded, setLoaded] = createSignal(false);
  const [navOpen, setNavOpen] = createSignal(false);
  const [navLoaded, setNavLoaded] = createSignal(false);

  function openSearch() {
    track("search_open", { source: "header" });
    setLoaded(true);
    setOpen(true);
  }

  function openNav() {
    setNavLoaded(true);
    setNavOpen(true);
  }

  onSettled(() => {
    if (typeof window === "undefined") return;
    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
        return;
      }
      if (event.key === "/" && !mod && !event.altKey && !isTypingTarget(event.target)) {
        event.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <>
      <header
        class="border-b border-line border-t-2"
        style="border-top-color: var(--color-accent-warm)"
      >
        <Container class="flex h-16 items-center gap-5">
          <a href="/" class={`${focusRing} inline-flex items-center gap-2.5 rounded-control no-underline`}>
            <img
              src="/brand/mark-128.png"
              alt=""
              width="128"
              height="128"
              class="size-9 rounded-control"
            />
            <span class="font-serif text-2xl leading-none font-semibold tracking-tight text-ink">
              oldmonk<span class="text-accent-warm">.</span>
            </span>
          </a>

          <nav aria-label="Categories" class="hidden md:block">
            <ul class="flex items-center gap-4 text-sm text-muted">
              <For each={categories}>
                {(category) => (
                  <li style={`--cat-color:${categoryColor(category.slug)};--cat-ink:${categoryInk(category.slug)}`}>
                    <a
                      href={category.path}
                      aria-current={location.pathname === category.path ? "page" : undefined}
                      class={`${focusRing} rounded-control px-1 py-2 underline-offset-4 hover:text-[var(--cat-ink)] hover:underline aria-[current=page]:text-[var(--cat-ink)]`}
                    >
                      {category.name.replace(" tools", "")}
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </nav>

          <div class="ms-auto flex items-center gap-2">
            <button
              type="button"
              class={`${focusRing} inline-flex min-h-9 items-center gap-2 rounded-control border border-line px-3 text-sm text-muted transition-colors duration-150 hover:border-accent hover:text-ink`}
              onClick={openSearch}
              aria-label="Search tools"
            >
              <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span class="hidden sm:inline">Search</span>
              <span class="hidden md:inline">
                <Kbd>/</Kbd>
              </span>
            </button>
            <ThemeToggle />
            <button
              type="button"
              class={`${focusRing} inline-flex size-9 items-center justify-center rounded-control border border-line text-ink md:hidden`}
              aria-label="Open navigation"
              onClick={openNav}
            >
              <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </Container>
      </header>

      <Show when={loaded()}>
        <Loading fallback={null}>
          <SearchDialog open={open()} onOpenChange={setOpen} />
        </Loading>
      </Show>
      <Show when={navLoaded()}>
        <Loading fallback={null}>
          <MobileNav open={navOpen()} onOpenChange={setNavOpen} />
        </Loading>
      </Show>
    </>
  );
}
