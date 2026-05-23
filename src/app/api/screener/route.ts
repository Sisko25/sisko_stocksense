import { NextResponse } from "next/server";

const FMP_API_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "gainers", "losers", or "default"
  const searchTicker = searchParams.get("ticker");
  
  try {
    if (!FMP_API_KEY) {
      // Mock data if no API key is provided
      let mockData = [
        { symbol: "AAPL", name: "Apple Inc.", price: 175.50, changesPercentage: 1.2, marketCap: 2800000000000, pe: 28.5, volume: 55000000, exchange: "NASDAQ" },
        { symbol: "MSFT", name: "Microsoft", price: 330.10, changesPercentage: 0.8, marketCap: 2500000000000, pe: 35.2, volume: 22000000, exchange: "NASDAQ" },
        { symbol: "NVDA", name: "NVIDIA Corp", price: 450.20, changesPercentage: -1.5, marketCap: 1100000000000, pe: 110.5, volume: 45000000, exchange: "NASDAQ" },
        { symbol: "TSLA", name: "Tesla Inc.", price: 210.45, changesPercentage: 5.4, marketCap: 800000000000, pe: 75.1, volume: 120000000, exchange: "NASDAQ" },
      ];
      
      if (type === "gainers") {
        mockData = [
          { symbol: "TSLA", name: "Tesla Inc.", price: 210.45, changesPercentage: 5.4, marketCap: 800000000000, pe: 75.1, volume: 120000000, exchange: "NASDAQ" },
          { symbol: "AAPL", name: "Apple Inc.", price: 175.50, changesPercentage: 1.2, marketCap: 2800000000000, pe: 28.5, volume: 55000000, exchange: "NASDAQ" },
        ];
      } else if (type === "losers") {
        mockData = [
          { symbol: "NVDA", name: "NVIDIA Corp", price: 450.20, changesPercentage: -1.5, marketCap: 1100000000000, pe: 110.5, volume: 45000000, exchange: "NASDAQ" },
        ];
      } else if (searchTicker) {
        mockData = [
          { symbol: searchTicker.toUpperCase(), name: "Searched Company", price: 100.00, changesPercentage: 0.0, marketCap: 1000000000, pe: 15.0, volume: 1000000, exchange: "NASDAQ" }
        ];
      }
      return NextResponse.json(mockData);
    }

    let url = "";
    if (searchTicker) {
      url = `https://financialmodelingprep.com/stable/quote?symbol=${searchTicker}&apikey=${FMP_API_KEY}`;
    } else if (type === "losers") {
      url = `https://financialmodelingprep.com/stable/biggest-losers?apikey=${FMP_API_KEY}`;
    } else {
      // Default to gainers since batch-quotes are premium restricted on FMP
      url = `https://financialmodelingprep.com/stable/biggest-gainers?apikey=${FMP_API_KEY}`;
    }
    
    // Add cache revalidation logic
    const res = await fetch(url, { next: { revalidate: 60 } }); 
    
    if (!res.ok) {
      throw new Error(`FMP API responded with status: ${res.status}`);
    }

    const data = await res.json();
    
    // FMP returns 200 OK but with an Error Message string for restricted endpoints!
    if (data["Error Message"] || (typeof data === "string" && data.includes("Premium")) || (data.message && data.message.includes("Premium"))) {
      console.warn("FMP API Restriction Hit:", data);
      // Fallback to mock data so the UI doesn't break
      return NextResponse.json([{ 
        symbol: searchTicker ? searchTicker.toUpperCase() : "MOCK", 
        name: searchTicker ? "Search restricted on Free API" : "Restricted API", 
        price: 150.00, 
        changesPercentage: 1.5, 
        marketCap: 1000000000, 
        pe: 15.0, 
        volume: 1000000, 
        exchange: "NASDAQ" 
      }]);
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching from FMP:", error);
    // Return mock data fallback on total failure
    return NextResponse.json([{ 
      symbol: searchTicker ? searchTicker.toUpperCase() : "MOCK", 
      name: "Fallback Data (API Error)", 
      price: 100.00, 
      changesPercentage: 0.0, 
      marketCap: 10000000, 
      pe: 10.0, 
      volume: 100000, 
      exchange: "NASDAQ" 
    }]);
  }
}
