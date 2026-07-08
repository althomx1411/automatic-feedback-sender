import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Email from "./pages/email/Email";

function App() {
  const [array, setArray] = useState([]);

  const fetchData = async () => {
    const response = await axios.get("http://127.0.0.1:5000/feedbacks");
    setArray(response.data.users);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Email />
      <div>
        {array.map((user, index) => (
          <div key={index}>
            <span>{user}</span>
            <br></br>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
