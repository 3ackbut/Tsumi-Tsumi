import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Status from "./pages/Status";
import Diagnosis from "./pages/Diagnosis";
import { AppDataProvider } from "./context/AppDataContext";

function App() {
  return (
    <BrowserRouter>
      <AppDataProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/status" element={<Status />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
        </Routes>
      </AppDataProvider>
    </BrowserRouter>
  );
}

export default App;
