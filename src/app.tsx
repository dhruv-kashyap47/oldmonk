import { SiteFooter } from "./components/layout/SiteFooter";
import { SiteHeader } from "./components/layout/SiteHeader";
import { SkipLink } from "./components/layout/SkipLink";
import { RouteAnalytics } from "./components/layout/RouteAnalytics";
import { Router } from "./router";
import "./styles/app.css";

export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <RouteAnalytics />
          <SkipLink />
          <SiteHeader />
          {props.children}
          <SiteFooter />
        </>
      )}
    </Router>
  );
}
