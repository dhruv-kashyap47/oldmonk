import { For } from "solid-js";
import { faqSchema } from "../../seo/schema";
import type { FAQItem } from "../../tools/types";
import { JsonLd } from "../seo/JsonLd";

export function FAQ(props: { items: readonly FAQItem[] }) {
  return (
    <>
      <JsonLd data={faqSchema(props.items)} />
      <section aria-labelledby="faq" class="mt-12">
        <h2 id="faq" class="font-serif text-2xl font-semibold text-ink">
          Questions
        </h2>
        <dl data-faq class="mt-6">
          <For each={props.items}>
            {(item) => (
              <div class="border-t border-line py-5">
                <dt class="text-base font-medium text-ink">{item.question}</dt>
                <dd class="mt-2 text-[15px] leading-relaxed text-muted">{item.answer}</dd>
              </div>
            )}
          </For>
        </dl>
      </section>
    </>
  );
}
