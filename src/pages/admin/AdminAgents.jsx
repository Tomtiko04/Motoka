import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  PlusIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const AdminAgents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/agents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setAgents(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform agents data to match display format
  const displayAgents = agents.map(agent => ({
    id: agent.id,
    name: `${agent.first_name} ${agent.last_name}`,
    amount: agent.amount_to_pay ? `N${parseFloat(agent.amount_to_pay).toLocaleString()}` : 'N0',
    location: agent.state,
    state: agent.state,
    profile_image: agent.profile_image,
    status: agent.status
  }));

  const filters = ['All', 'Active', 'Suspended', 'Deleted'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <UserGroupIcon className="h-6 w-6 text-gray-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {displayAgents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden">
                {agent.profile_image ? (
                  <img 
                    src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}/storage/${agent.profile_image}`}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-gray-700">
                    {agent.name.charAt(0)}
                  </span>
                )}
              </div>
              
              {/* Name */}
              <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                {agent.name}
              </h3>
              
              {/* Amount */}
              <p className="text-sm font-semibold text-gray-900 mb-2">
                {agent.amount}
              </p>
              
              {/* Location */}
              <div className="flex items-center justify-center text-xs text-gray-500">
                <MapPinIcon className="h-3 w-3 mr-1" />
                <span>{agent.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayAgents.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-500">
            No agents have been created yet. Create your first agent to get started.
          </p>
        </div>
      )}

      {/* Create New Agent Card */}
      <div className="flex justify-center">
        <div 
          onClick={() => navigate('/admin/agents/create')}
          className="bg-blue-50 rounded-lg p-8 max-w-md w-full text-center hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <PlusIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Create New Agent</h3>
        </div>
      </div>
    </div>
  );
};

export default AdminAgents;