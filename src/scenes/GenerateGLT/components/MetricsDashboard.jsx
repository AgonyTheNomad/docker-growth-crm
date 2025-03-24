import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { constructUrl } from "../../../utils/apiUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChartBar, X, RefreshCw } from 'lucide-react';

const StatusBreakdownModal = ({ status, startDate, endDate, timeframe = "Month" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({
    franchise: [],
    growthbacker: [],
    source: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('franchise');

  const fetchBreakdownData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        status,
        start_date: startDate,
        end_date: endDate,
        timeframe
      });
      
      const response = await fetch(
        constructUrl(`/api/analytics/status-breakdown?${params}`),
        {
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch breakdown data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBreakdownData();
    }
  }, [isOpen, status, startDate, endDate, timeframe]);

  const renderChart = (chartData) => {
    if (!chartData?.length) return null;

    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8' }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis tick={{ fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '6px'
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="p-1 hover:bg-slate-700 rounded">
          <ChartBar className="w-4 h-4" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl bg-slate-900 text-white">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">
              {status} - Detailed Breakdown
            </DialogTitle>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="franchise">By Franchise</TabsTrigger>
            <TabsTrigger value="growthbacker">By Growthbacker</TabsTrigger>
            <TabsTrigger value="source">By Source</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="h-96 flex items-center justify-center text-red-400">
              {error}
            </div>
          ) : (
            <>
              <TabsContent value="franchise">
                <Card className="border-0 bg-slate-800 p-4">
                  {renderChart(data.franchise)}
                </Card>
              </TabsContent>
              <TabsContent value="growthbacker">
                <Card className="border-0 bg-slate-800 p-4">
                  {renderChart(data.growthbacker)}
                </Card>
              </TabsContent>
              <TabsContent value="source">
                <Card className="border-0 bg-slate-800 p-4">
                  {renderChart(data.source)}
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StatusBreakdownModal;