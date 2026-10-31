import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import NewTicket from "@/pages/NewTicket";
import TicketPage from "@/pages/Ticket";
import Staff from "@/pages/Staff";
import Login from "@/pages/Login";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/yeni" element={<NewTicket />} />
            <Route path="/talep/:id" element={<TicketPage />} />
            <Route path="/yonetim" element={<Staff />} />
            <Route path="/giris" element={<Login />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
