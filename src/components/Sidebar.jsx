import React, { useState, useEffect, useRef } from "react";

export default function Sidebar({ selectedSymbol, setSelectedSymbol, darkMode }) {
  // Use a state variable for the backend URL, loading it from localStorage initially
  const [backendBaseUrl, setBackendBaseUrl] = useState(
    () => localStorage.getItem('backendBaseUrl') || 'https://55b970bc0738.ngrok-free.app/'
  );
  
  // Remove trailing slash if present to avoid double slashes
  const cleanBaseUrl = backendBaseUrl.replace(/\/$/, '');
  const FOREX_API = `${cleanBaseUrl}/symbols/forex`;

  const [symbols, setSymbols] = useState([]);
  const [names, setNames] = useState({});
  const [prices, setPrices] = useState({});
  const [allForexSymbols, setAllForexSymbols] = useState([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchActive, setSearchActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimer = useRef(null);
  const dragIdx = useRef(null);

  // Consolidated data fetching and loading logic
  useEffect(() => {
    // If the URL is not set, we can't fetch anything.
    if (!backendBaseUrl) {
      setLoading(false);
      return;
    }

    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      console.log('Starting data fetch from:', FOREX_API);

      // Load saved watchlist first
      const saved = localStorage.getItem("forexWatchlist");
      if (saved) {
        try {
          const savedSymbols = JSON.parse(saved);
          if (Array.isArray(savedSymbols) && savedSymbols.length > 0) {
            console.log('Loaded saved symbols:', savedSymbols);
            setSymbols(savedSymbols);
            if (!selectedSymbol) {
              setSelectedSymbol(savedSymbols[0]);
            }
          }
        } catch (err) {
          console.error('Error loading saved watchlist:', err);
        }
      }

      try {
        console.log('Fetching from API:', FOREX_API);
        
        const response = await fetch(FOREX_API, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Remove ngrok-specific headers for Render
          },
          mode: 'cors'
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const text = await response.text();
        console.log('Raw response text:', text);

        if (!text) {
          throw new Error('Empty response from server');
        }

        let data;
        try {
          data = JSON.parse(text);
          console.log('Parsed JSON data:', data);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error(`Invalid JSON response: ${parseError.message}`);
        }

        const forexData = Array.isArray(data) ? data : data.symbols || [];
        console.log('Processed forex data:', forexData);
        
        if (forexData.length === 0) {
          throw new Error('No forex symbols returned from API');
        }
        
        setAllForexSymbols(forexData);
        
        const symbolList = forexData.map(item =>
          typeof item === 'string' ? item : item.symbol || item.name
        );
        
        const nameMap = {};
        const priceMap = {};
        
        forexData.forEach(item => {
          const symbol = typeof item === 'string' ? item : item.symbol || item.name;
          nameMap[symbol] = typeof item === 'object' ? (item.name || item.description || symbol) : symbol;
          priceMap[symbol] = typeof item === 'object' ? (item.price || Math.random() * 100 + 1) : Math.random() * 100 + 1;
        });
        
        console.log('Symbol list:', symbolList);
        console.log('Name map:', nameMap);
        console.log('Price map:', priceMap);
        
        setSymbols(symbolList);
        setNames(nameMap);
        setPrices(priceMap);
        
        if (!selectedSymbol && symbolList.length > 0) {
          setSelectedSymbol(symbolList[0]);
        }
        
        console.log('Data loading completed successfully');
        
      } catch (err) {
        console.error('Error fetching forex symbols:', err);
        setError(`${err.message}`);
        
        // Only use fallback if no symbols are already loaded
        if (symbols.length === 0) {
          console.log('Using fallback data');
          const fallbackSymbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
          const fallbackNames = {
            'EURUSD': 'Euro/US Dollar',
            'GBPUSD': 'British Pound/US Dollar',
            'USDJPY': 'US Dollar/Japanese Yen',
            'AUDUSD': 'Australian Dollar/US Dollar',
            'USDCAD': 'US Dollar/Canadian Dollar'
          };
          const fallbackPrices = {
            'EURUSD': 1.0875,
            'GBPUSD': 1.2654,
            'USDJPY': 149.32,
            'AUDUSD': 0.6598,
            'USDCAD': 1.3642
          };
          
          setSymbols(fallbackSymbols);
          setNames(fallbackNames);
          setPrices(fallbackPrices);
          setAllForexSymbols(fallbackSymbols.map(symbol => ({ symbol, name: fallbackNames[symbol] })));
          
          if (!selectedSymbol) {
            setSelectedSymbol(fallbackSymbols[0]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [backendBaseUrl]); // Removed selectedSymbol dependency to prevent infinite loops

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    if (symbols.length > 0) {
      localStorage.setItem("forexWatchlist", JSON.stringify(symbols));
    }
  }, [symbols]);

  // Simulate price updates
  useEffect(() => {
    if (symbols.length === 0) return;
    
    const interval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = { ...prevPrices };
        symbols.forEach(symbol => {
          if (newPrices[symbol]) {
            const change = (Math.random() - 0.5) * 0.002;
            newPrices[symbol] = +(newPrices[symbol] * (1 + change)).toFixed(5);
          }
        });
        return newPrices;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [symbols]);

  // Search/autocomplete functionality
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    
    if (searchTimer.current) clearTimeout(searchTimer.current);
    
    searchTimer.current = setTimeout(() => {
      const filteredSymbols = allForexSymbols.filter(item => {
        const symbol = typeof item === 'string' ? item : item.symbol || item.name;
        const name = typeof item === 'object' ? (item.name || item.description || '') : '';
        
        return symbol.toLowerCase().includes(input.toLowerCase()) || 
               name.toLowerCase().includes(input.toLowerCase());
      }).slice(0, 8);
      
      setSuggestions(filteredSymbols.map(item => ({
        symbol: typeof item === 'string' ? item : item.symbol || item.name,
        name: typeof item === 'object' ? (item.name || item.description || '') : '',
        type: 'Forex Pair'
      })));
    }, 300);
    
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [input, allForexSymbols]);

  // Enhanced test API function
  const testAPI = async () => {
    try {
      console.log('=== Testing API Connection ===');
      console.log('URL:', FOREX_API);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(FOREX_API, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response received:');
      console.log('- Status:', response.status);
      console.log('- Status Text:', response.statusText);
      console.log('- Headers:', Object.fromEntries(response.headers.entries()));
      console.log('- URL:', response.url);
      
      const text = await response.text();
      console.log('- Raw Response:', text);
      
      if (!response.ok) {
        console.error('HTTP Error:', response.status, response.statusText);
        return;
      }
      
      try {
        const json = JSON.parse(text);
        console.log('- Parsed JSON:', json);
        console.log('- Data type:', Array.isArray(json) ? 'Array' : typeof json);
        console.log('- Data length:', Array.isArray(json) ? json.length : 'N/A');
      } catch (parseErr) {
        console.error('JSON Parse Error:', parseErr);
        console.log('Response is not valid JSON');
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('Request timed out after 10 seconds');
      } else {
        console.error('Test API error:', err.name, err.message);
      }
    }
    console.log('=== End API Test ===');
  };

  // Manual retry function
  const retryFetch = () => {
    if (backendBaseUrl) {
      setError(null);
      // Trigger a re-fetch by updating the dependency
      const loadData = async () => {
        setLoading(true);
        // Re-run the fetch logic
        window.location.reload(); // Simple approach, or you could extract the fetch logic
      };
      loadData();
    }
  };
  
  function addSymbol(sym, name) {
    if (!symbols.includes(sym)) {
      setSymbols([...symbols, sym]);
      if (name) {
        setNames(prev => ({ ...prev, [sym]: name }));
      }
      if (!prices[sym]) {
        setPrices(prev => ({ ...prev, [sym]: Math.random() * 2 + 0.5 }));
      }
    }
    setSelectedSymbol(sym);
    setInput("");
    setSuggestions([]);
    setSearchActive(false);
  }
  
  function removeSymbol(sym) {
    setSymbols(symbols.filter(s => s !== sym));
    if (sym === selectedSymbol) {
      const remaining = symbols.filter(s => s !== sym);
      setSelectedSymbol(remaining[0] || "");
    }
  }
  
  function handleDragStart(i) {
    dragIdx.current = i;
  }
  
  function handleDrop(i) {
    if (dragIdx.current === null || dragIdx.current === i) return;
    const updated = [...symbols];
    const [removed] = updated.splice(dragIdx.current, 1);
    updated.splice(i, 0, removed);
    setSymbols(updated);
    dragIdx.current = null;
  }

  // URL input handler
  const handleUrlSubmit = (url) => {
    if (url) {
      const cleanUrl = url.trim().replace(/\/$/, ''); // Remove trailing slash
      setBackendBaseUrl(cleanUrl);
      localStorage.setItem('backendBaseUrl', cleanUrl);
      console.log('Backend URL updated to:', cleanUrl);
    }
  };

  // Render a prompt to enter the ngrok URL if it's not set
  if (!backendBaseUrl) {
    return (
      <aside className={`w-56 min-w-40 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-[#121826] border-gray-200'} border-r p-4 flex flex-col justify-center`}>
        <div className="mb-4">
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Enter your ngrok URL:
          </label>
          <input
            type="text"
            className={`mt-1 block w-full px-2 py-1 text-sm border rounded ${darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
            placeholder="https://your-app-name.onrender.com"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUrlSubmit(e.target.value);
              }
            }}
          />
          <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Enter your Render backend URL (e.g., https://your-app.onrender.com)
          </p>
        </div>
      </aside>
    );
  }

  // Loading state
  if (loading) {
    return (
      <aside className={`w-56 min-w-40 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-[#121826] border-gray-200'} border-r p-4 flex items-center justify-center`}>
        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm text-center`}>
          <div>Loading...</div>
          <div className="text-xs mt-1">{FOREX_API}</div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`w-56 min-w-40 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-[#121826] border-gray-200'} border-r p-4 flex flex-col`}>
      {/* Error message */}
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 text-xs rounded">
          <div className="font-semibold">API Error:</div>
          <div className="mt-1">{error}</div>
          <div className="mt-2 flex gap-1">
            <button 
              onClick={testAPI}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              type="button"
            >
              Test API
            </button>
            <button 
              onClick={retryFetch}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              type="button"
            >
              Retry
            </button>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            URL: {FOREX_API}
          </div>
        </div>
      )}
      
      {/* URL configuration */}
      <div className="mb-2">
        <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-1`}>
          Backend: {backendBaseUrl}
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('backendBaseUrl');
            setBackendBaseUrl('');
          }}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          Change URL
        </button>
      </div>
      
      {/* Search box */}
      <div className="flex mb-2 relative">
        <input
          className={`flex-1 rounded px-2 py-1 border text-sm ${darkMode ? 'bg-gray-800 text-white border-gray-700 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
          placeholder="Search forex pairs..."
          value={input}
          onFocus={() => setSearchActive(true)}
          onBlur={() => setTimeout(() => setSearchActive(false), 150)}
          onChange={(e) => {
            setInput(e.target.value.toUpperCase());
            setSearchActive(true);
          }}
          aria-label="Search forex pairs"
        />
        <button
          onClick={() =>
            suggestions[0]?.symbol &&
            addSymbol(suggestions[0].symbol, suggestions[0].name)
          }
          className={`ml-2 px-2 py-1 ${darkMode ? 'bg-blue-700' : 'bg-blue-600'} text-white rounded hover:bg-blue-500 transition-colors`}
          type="button"
          disabled={!input.trim()}
        >
          +
        </button>
        
        {/* Suggestions dropdown */}
        {searchActive && suggestions.length > 0 && (
          <div className={`absolute z-20 left-0 top-8 w-full ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded shadow-xl`}>
            {suggestions.map((s) => (
              <div
                key={s.symbol}
                className={`px-2 py-1 cursor-pointer ${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-blue-100 text-gray-900'} text-xs`}
                title={s.name}
                onMouseDown={() => addSymbol(s.symbol, s.name)}
              >
                <b>{s.symbol}</b>{" "}
                {s.name && (
                  <>
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>{s.name}</span>{" "}
                  </>
                )}
                <span className={darkMode ? "text-gray-500" : "text-gray-400"}>({s.type})</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Watchlist */}
      <ul className="flex-1 overflow-auto space-y-1" aria-label="Forex Watchlist">
        {symbols.map((sym, i) => {
          const price = prices[sym];
          const isActive = sym === selectedSymbol;
          return (
            <li
              key={sym}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              onClick={() => setSelectedSymbol(sym)}
              className={`rounded flex items-center px-2 py-1 cursor-pointer transition ${
                isActive
                  ? `${darkMode ? 'bg-blue-900' : 'bg-blue-50'} border-l-4 border-blue-600 font-bold`
                  : `${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`
              }`}
              role="option"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedSymbol(sym);
              }}
            >
              <div className="flex-1 min-w-0">
                <span className={`block truncate font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {sym}
                </span>
                {names[sym] && (
                  <span className={`block text-xs truncate ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {names[sym]}
                  </span>
                )}
              </div>
              
              <span
                className={`ml-2 text-sm tabular-nums ${
                  price == null 
                    ? (darkMode ? "text-gray-500" : "text-gray-400") 
                    : (darkMode ? "text-green-500" : "text-green-600")
                }`}
              >
                {price == null ? "..." : price.toFixed(5)}
              </span>
              
              <button
                className={`ml-2 ${darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} text-xs`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeSymbol(sym);
                }}
                tabIndex={-1}
                type="button"
              >
                ×
              </button>
              
              <span
                className={`ml-1 cursor-move ${darkMode ? 'text-gray-600' : 'text-gray-300'} select-none`}
                aria-hidden="true"
                title="Drag to reorder"
              >
                ⋮
              </span>
            </li>
          );
        })}
      </ul>
      
      {symbols.length === 0 && !loading && (
        <div className={`text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm mt-4`}>
          {error ? 'Failed to load forex pairs' : 'No forex pairs in watchlist'}
        </div>
      )}
    </aside>
  );
}