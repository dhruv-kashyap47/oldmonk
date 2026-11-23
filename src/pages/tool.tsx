import { Show, lazy } from "solid-js";
import { Loading } from "@solidjs/web";
import { useParams } from "@solidjs/router";
import { getTool } from "../tools/registry";
import type { ToolMeta } from "../tools/types";
import { ToolShell } from "../components/tool/ToolShell";
import { LoadingState } from "../components/tool/states";
import { Container } from "../components/layout/Container";
import NotFoundPage from "./not-found";

function ToolView(props: { tool: ToolMeta }) {
  const ToolBody = lazy(props.tool.loadTool);
  const ToolContent = lazy(props.tool.loadContent);

  return (
    <Loading
      fallback={
        <Container width="tool" class="pt-8">
          <LoadingState label={`Loading ${props.tool.name}`} />
        </Container>
      }
    >
      <ToolShell tool={props.tool} content={<ToolContent />}>
        <ToolBody />
      </ToolShell>
    </Loading>
  );
}

export default function ToolPage() {
  const params = useParams();
  const tool = () => getTool(params.slug ?? "");

  return (
    <Show when={tool()} fallback={<NotFoundPage />} keyed>
      {(found) => <ToolView tool={found} />}
    </Show>
  );
}
