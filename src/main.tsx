import { StrictMode, Suspense } from "react";

import { createRoot } from "react-dom/client";
import { I18nextProvider } from "react-i18next";

import { i18n } from "@/lib/i18n";

import { App } from "./app";
import "./styles/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <Suspense>
        <App />
      </Suspense>
    </I18nextProvider>
  </StrictMode>,
);
