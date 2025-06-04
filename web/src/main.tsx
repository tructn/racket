import { Auth0Provider } from "@auth0/auth0-react";
import {
  createTheme,
  MantineColorsTuple,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

const myColor: MantineColorsTuple = [
  "#eaf1ff",
  "#d4dffc",
  "#a7bbf3",
  "#7896ec",
  "#5076e5",
  "#3762e2",
  "#2857e1",
  "#1b48c8",
  "#1240b4",
  "#00369f",
];

const theme = createTheme({
  colors: {
    myColor,
  },
  fontFamily: "Inter",
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENTID}
      authorizationParams={{
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
      useCookiesForTransactions={true}
    >
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <MantineProvider theme={theme}>
            <ModalsProvider>
              <App />
              <Notifications position="top-right" />
            </ModalsProvider>
          </MantineProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>,
);
