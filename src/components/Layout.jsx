import React, { useState } from "react";
import Layout from "./components/Layout";
import Sidebar from "./components/Sidebar";
import ChartWorkspace from "./workspace";

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");

  return (
    <Layout
      sidebar={
        <Sidebar
          selectedSymbol={selectedSymbol}
          setSelectedSymbol={setSelectedSymbol}
        />
      }
      main={<ChartWorkspace symbol={selectedSymbol} />}
    />
  );
}
