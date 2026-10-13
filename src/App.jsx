import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Subscriptions from "./pages/Subscriptions";
import Plans from "./pages/Plans";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />

      <Routes>
        <Route path="/" element={<> <Header pageTitle="Dashboard" /> <Dashboard /> </>} />
        <Route path="/users" element={<> <Header pageTitle="Users" /> <Users /> </>} />
        <Route path="/subscriptions" element={<> <Header pageTitle="Subscriptions" /> <Subscriptions /> </>} />
        <Route path="/plans" element={<> <Header pageTitle="Plans" /> <Plans /> </>} />
        <Route path="/customers" element={<> <Header pageTitle="Customers" /> <Customers /> </>} />
        <Route path="/analytics" element={<> <Header pageTitle="Analytics" /> <Analytics /> </>} />
      </Routes>
    </BrowserRouter>
  );
} 