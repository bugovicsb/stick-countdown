import { createRoot } from "react-dom/client";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);

serviceWorkerRegistration.register();
