import React, { useEffect, useState } from 'react';
import Ordered from '../../../assets/ordered.png';
import Canceled from '../../../assets/canceled.png';
import Delivered from '../../../assets/deliver.png';
import Revenue from '../../../assets/revenue.png';

const DashboardStats = ({ sellerId }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCanceled: 0,
    totalDelivered: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/seller/orderStats?sellerId=${sellerId}`);
        const data = await response.json();
        setStats({
          totalOrders: data.totalOrders,
          totalCanceled: data.totalCanceled,
          totalDelivered: data.totalDelivered,
          totalRevenue: data.totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [sellerId]);

  const statItems = [
    { title: 'Total Order', count: stats.totalOrders, icon: Ordered },
    { title: 'Total Canceled', count: stats.totalCanceled, icon: Canceled },
    { title: 'Total Delivered', count: stats.totalDelivered, icon: Delivered },
    { title: 'Total Revenue (₹)', count: stats.totalRevenue, icon: Revenue },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mt-6 w-full bg-gray-300 p-4 rounded-lg">
      {statItems.map((stat, index) => (
        <div key={index} className="p-4 bg-white shadow-md rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{stat.title}</h3>
              <p className="text-2xl">{stat.count}</p>
            </div>
            <img src={stat.icon} alt="icon" className="w-12 h-12" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
