import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ReviewPage } from "./components/ReviewPage";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/^\/review\/?$/.test(window.location.pathname) ? <ReviewPage /> : <App />}
  </React.StrictMode>
);
