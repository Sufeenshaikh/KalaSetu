import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getArtisanById,
  getProductsByArtisanId,
} from "../services/firestoreService";
import { generateArtisanSuggestions } from "../services/geminiService";
import type { Artisan, Product } from "../types";
import Spinner from "../components/Spinner";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-surface p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-accent/20 text-primary p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-2xl font-bold text-secondary">{value}</p>
    </div>
  </div>
);

const ArtisanDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<{ pricing: string; descriptions: string; trends: string } | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedArtisan, fetchedProducts] = await Promise.all([
          getArtisanById(user.uid),
          getProductsByArtisanId(user.uid),
        ]);
        setArtisan(fetchedArtisan as Artisan);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleGetSuggestions = async () => {
    if (!artisan || products.length === 0) {
      alert("Cannot generate suggestions without artisan and product data.");
      return;
    }
    setIsGeneratingSuggestions(true);
    setSuggestions(null);
    try {
      const result = await generateArtisanSuggestions(artisan, products);
      setSuggestions(result);
    } catch (error) {
      console.error("Failed to get AI suggestions:", error);
      setSuggestions({
        pricing: "Sorry, we couldn't fetch suggestions right now. Please try again later.",
        descriptions: "",
        trends: ""
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const chartData: ChartData<'bar'> = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Sales (₹)',
        data: chartLabels.map(() => Math.floor(Math.random() * 5000) + 1000), // Mock data
        backgroundColor: 'rgba(217, 95, 67, 0.6)', // Primary color with opacity
        borderColor: 'rgba(217, 95, 67, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Monthly Sales' },
    },
    scales: {
        y: { beginAtZero: true }
    }
  };
  
  useEffect(() => {
    if (chartRef.current) {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
            chartInstanceRef.current = new ChartJS(ctx, {
                type: 'bar',
                data: chartData,
                options: chartOptions,
            });
        }
    }
    return () => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
    };
  }, [chartData, chartOptions]);


  if (loading) return <div className="py-20"><Spinner /></div>;
  if (!user || !artisan) return <div className="text-center py-20">Could not load artisan data.</div>;

  return (
    <div className="container mx-auto px-6 py-12">
      <BackButton />
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold text-secondary">Artisan Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome back, {artisan.name}!</p>
        </div>
        <div className="flex items-center mt-4 md:mt-0">
          <img src={artisan.image} alt={artisan.name} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-primary" />
          <p className="text-lg font-semibold">{artisan.name}<br /><span className="text-sm font-normal text-text-secondary">{artisan.region}</span></p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Visitors this week" value="1,204" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <StatCard title="Crafts Sold (Month)" value="32" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
        <StatCard title="Earnings (Month)" value="₹12,850" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-heading font-bold text-secondary mb-4">Sales Performance</h2>
          <canvas ref={chartRef} />
        </div>
        
        <div className="bg-surface p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-heading font-bold text-secondary mb-4">AI-Powered Insights</h2>
          <p className="text-text-secondary mb-4">Get personalized suggestions to improve your shop's performance.</p>
          <Button onClick={handleGetSuggestions} disabled={isGeneratingSuggestions}>
            {isGeneratingSuggestions ? 'Generating...' : '✨ Get Suggestions'}
          </Button>

          {isGeneratingSuggestions && <div className="mt-4"><Spinner /></div>}
          
          {suggestions && (
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <h3 className="font-bold text-secondary">Pricing Advice</h3>
                <p className="text-text-secondary whitespace-pre-line">{suggestions.pricing}</p>
              </div>
              <div>
                <h3 className="font-bold text-secondary">Description Tips</h3>
                <p className="text-text-secondary whitespace-pre-line">{suggestions.descriptions}</p>
              </div>
              <div>
                <h3 className="font-bold text-secondary">Trending Crafts</h3>
                <p className="text-text-secondary whitespace-pre-line">{suggestions.trends}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtisanDashboardPage;