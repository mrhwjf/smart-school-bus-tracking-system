import React, { useState } from "react";
import Login from "./pages/driver/Login";
import DriverDashboard from "./pages/driver/DriverDashboard";

const App = () => {
  // const [loggedIn, setLoggedIn] = useState(false);

  // return loggedIn ? (
  //   <DriverDashboard />
  // ) : (
  //   <Login onLogin={() => setLoggedIn(true)} />
  // );

  return <DriverDashboard />;
};

export default App; 