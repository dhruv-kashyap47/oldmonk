import { For } from "solid-js";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/solid/dialog";
import { categories } from "../../content/categories";
import { focusRing } from "../ui/styles";

export default function MobileNav(props: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogBackdrop class="fixed inset-0 z-40 bg-black/45" />
      <DialogContent class="fixed top-0 right-0 z-50 h-dvh w-[min(88vw,20rem)] overflow-y-auto border-l border-line bg-surface p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <DialogTitle class="font-serif text-xl font-semibold text-ink">Browse</DialogTitle>
            <DialogDescription class="mt-1 text-sm text-muted">
              Five categories, one row per tool.
            </DialogDescription>
          </div>
          <DialogClose
            class={`${focusRing} rounded-control px-2 py-1 text-sm text-muted hover:text-ink`}
            aria-label="Close navigation"
          >
            Close
          </DialogClose>
        </div>
        <nav aria-label="Categories" class="mt-8">
          <ul class="flex flex-col gap-1">
            <For each={categories}>
              {(category) => (
                <li>
                  <DialogClose
                    render={(contentProps) => <a {...contentProps} href={category.path} />}
                    class={`${focusRing} flex min-h-11 items-center rounded-control px-2 text-[15px] text-ink hover:bg-surface-2`}
                  >
                    {category.name}
                  </DialogClose>
                </li>
              )}
            </For>
          </ul>
        </nav>
        <nav aria-label="Site" class="mt-8 border-t border-line pt-4">
          <ul class="flex flex-col gap-1">
            <For
              each={[
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
              ]}
            >
              {(item) => (
                <li>
                  <DialogClose
                    render={(contentProps) => <a {...contentProps} href={item.href} />}
                    class={`${focusRing} flex min-h-11 items-center rounded-control px-2 text-sm text-muted hover:bg-surface-2 hover:text-ink`}
                  >
                    {item.label}
                  </DialogClose>
                </li>
              )}
            </For>
          </ul>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
