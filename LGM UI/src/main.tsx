import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { store } from "./store.ts";
import { Toaster } from "sonner"
import { Provider } from "react-redux";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
    <Toaster
      position="top-right"
      closeButton
      expand={false}
      richColors
      duration={2000}
    />
  </StrictMode>
);
