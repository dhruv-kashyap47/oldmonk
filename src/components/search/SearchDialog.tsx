import { For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { track } from "../../analytics";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/solid/command";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/solid/dialog";
import { getTool, tools } from "../../tools/registry";
import { focusRing } from "../ui/styles";

const commandItems = tools.map((tool) => ({
  value: tool.slug,
  label: tool.name,
  keywords: [tool.category, ...tool.keywords],
}));

export default function SearchDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  function choose(slug: string) {
    props.onOpenChange(false);
    track("search_select", { slug });
    navigate(`/${slug}`);
  }

  function preload(slug: string | null): void {
    if (!slug) return;
    const tool = getTool(slug);
    if (!tool) return;
    void tool.loadTool().catch(() => undefined);
    void tool.loadContent().catch(() => undefined);
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogBackdrop class="dialog-backdrop fixed inset-0 z-40 bg-black/45" />
      <DialogContent class="search-panel fixed top-[10vh] left-1/2 z-50 w-[min(92vw,40rem)] -translate-x-1/2 rounded-panel border border-line bg-surface p-4 shadow-2xl">
        <div class="flex items-start justify-between gap-4 px-1 pb-3">
          <div>
            <DialogTitle class="font-serif text-xl font-semibold text-ink">Search tools</DialogTitle>
            <DialogDescription class="mt-1 text-sm text-muted">
              Every shipped tool, by name or keyword.
            </DialogDescription>
          </div>
          <DialogClose
            class={`${focusRing} rounded-control px-2 py-1 text-sm text-muted hover:text-ink`}
            aria-label="Close search"
          >
            Close
          </DialogClose>
        </div>
        <Command
          items={commandItems}
          onAction={(value) => choose(value)}
          onValueChange={(value) => preload(value)}
        >
          <CommandInput
            aria-label="Search tools"
            placeholder="Type a tool name, like JSON"
            autofocus
            class="mb-3 w-full rounded-control border border-line bg-surface-2 px-3 py-2.5 text-[15px] text-ink placeholder:text-muted/70 focus:outline-none"
          />
          <CommandEmpty class="px-2 py-6 text-sm text-muted">
            No tool matches that search yet.
          </CommandEmpty>
          <CommandList class="max-h-[55vh] overflow-y-auto">
            {(state) => (
              <For each={state.items as { value: string; label: string }[]}>
                {(item) => {
                  const tool = () => getTool(item.value);
                  return (
                    <CommandItem
                      value={item.value}
                      onPointerEnter={() => preload(item.value)}
                      class={`${focusRing} flex cursor-pointer flex-col items-start gap-0.5 rounded-control px-3 py-2.5 text-left text-[15px] text-ink data-highlighted:bg-surface-2`}
                    >
                      <span class="font-medium">{item.label}</span>
                      <span class="text-xs text-muted">{tool()?.summary ?? ""}</span>
                    </CommandItem>
                  );
                }}
              </For>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
