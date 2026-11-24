import { For } from "solid-js";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/solid/accordion";
import { faqSchema } from "../../seo/schema";
import type { FAQItem } from "../../tools/types";
import { JsonLd } from "../seo/JsonLd";
import { focusRing } from "../ui/styles";

export function FAQ(props: { items: readonly FAQItem[] }) {
  const all = props.items.map((_, index) => `answer-${index}`);

  return (
    <>
      <JsonLd data={faqSchema(props.items)} />
      <section aria-labelledby="faq" class="mt-14">
        <h2 id="faq" class="font-serif text-2xl font-semibold text-ink">
          Common questions
        </h2>
        <Accordion
          multiple
          collapsible
          defaultValue={all}
          data-faq
          class="faq-accordion mt-4"
        >
          <For each={props.items}>
            {(item, index) => (
              <AccordionItem value={`answer-${index()}`} data-faq-item>
                <AccordionHeader>
                  <AccordionTrigger class={`${focusRing} -mx-2 rounded-control px-2`}>
                    <span>{item.question}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionPanel>
                  <p>{item.answer}</p>
                </AccordionPanel>
              </AccordionItem>
            )}
          </For>
        </Accordion>
      </section>
    </>
  );
}
