import { useEffect, useState } from "react";
import "./App.css";
import Board from "./components/Board";
import Startpage from "./components/Startpage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
function App() {
  const [userName, setUserName] = useState("");
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Startpage userName={userName} setUserName={setUserName} />}
        />
        <Route path="/Board" element={<Board userName={userName} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
