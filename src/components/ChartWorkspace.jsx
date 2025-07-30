import React from "react";
import { DrawingProvider } from "../context/DrawingContext";
import ChartToolbar from "./ChartToolbar";
import Chart from "./Chart";

function ChartWorkspace({ symbol, timeframe }) {
  return (
    <DrawingProvider>
      <div className="flex w-full h-full relative">
        {/* Toolbar Left */}
        <ChartToolbar />
        {/* Chart + Overlay */}
        <div className="flex-1 pl-16 pr-1 pt-6">
          <Chart symbol={symbol} timeframe={timeframe} />
        </div>
      </div>
    </DrawingProvider>
  );
}
export default ChartWorkspace;
