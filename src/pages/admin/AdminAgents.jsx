import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  PlusIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import config from '../../config/config';

const AdminAgents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [agentPayments, setAgentPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchAgents();
    fetchAgentPayments();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/agents`, {
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
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentPayments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${config.getApiBaseUrl()}/admin/agent-payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        // Group payments by agent_id and calculate totals
        const paymentsByAgent = {};
        data.data.data.forEach(payment => {
          if (!paymentsByAgent[payment.agent_id]) {
            paymentsByAgent[payment.agent_id] = {
              totalAmount: 0,
              totalCommission: 0,
              pendingAmount: 0,
              paidAmount: 0
            };
          }
          paymentsByAgent[payment.agent_id].totalAmount += parseFloat(payment.amount);
          paymentsByAgent[payment.agent_id].totalCommission += parseFloat(payment.commission_amount);
          
          if (payment.status === 'pending') {
            paymentsByAgent[payment.agent_id].pendingAmount += parseFloat(payment.amount);
          } else if (payment.status === 'paid') {
            paymentsByAgent[payment.agent_id].paidAmount += parseFloat(payment.amount);
          }
        });
        setAgentPayments(paymentsByAgent);
      }
    } catch (error) {
      toast.error('Failed to fetch agent payments');
    }
  };

  // Transform agents data to match display format
  const displayAgents = agents.map(agent => {
    const payments = agentPayments[agent.id] || { totalAmount: 0, pendingAmount: 0, paidAmount: 0 };
    return {
      id: agent.id,
      uuid: agent.uuid || agent.slug, // Use UUID if available, fallback to slug
      name: `${agent.first_name || ''} ${agent.last_name || ''}`.trim() || 'Unknown Agent',
      amount: `N${payments.totalAmount.toLocaleString()}`,
      pendingAmount: `N${payments.pendingAmount.toLocaleString()}`,
      paidAmount: `N${payments.paidAmount.toLocaleString()}`,
      location: agent.state || 'Unknown',
      state: agent.state,
      profile_image: agent.profile_image,
      status: agent.status
    };
  });

  const filters = ['All', 'Active', 'Suspended', 'Deleted'];

  // Filter agents based on active filter
  const filteredAgents = displayAgents.filter(agent => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return agent.status === 'active';
    if (activeFilter === 'Suspended') return agent.status === 'suspended';
    if (activeFilter === 'Deleted') return agent.status === 'deleted';
    return true;
  });

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
      <div className="flex items-center justify-center">
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {filteredAgents.map((agent) => (
          <div 
            key={agent.id} 
            className="bg-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            onClick={() => navigate(`/admin/agents/${agent.uuid}`)}
          >
            <div className="text-center">
              {/* Profile Image */}
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                {agent.profile_image ? (
                  <img 
                    src={`${config.getApiBaseUrl().replace('/api', '')}/${agent.profile_image}`}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ display: agent.profile_image ? 'none' : 'flex' }}
                >
                  {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              </div>
              
              {/* Name */}
              <h3 className="text-lg font-semibold text-gray-600 mb-2 truncate">
                {agent.name}
              </h3>
              
              {/* Total Amount */}
              <p className="text-xl font-bold text-gray-600 mb-3">
                {agent.amount}
              </p>
              
              {/* Location */}
              <div className="flex items-center justify-center text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4 mr-1 text-gray-500" />
                <span className="font-medium">{agent.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-500">
            No agents have been created yet. Create your first agent to get started.
          </p>
        </div>
      )}

      {/* Create New Agent Card */}
      <div className="flex justify-center mt-8">
        <div 
          onClick={() => navigate('/admin/agents/create')}
          className="bg-gray-50 rounded-2xl border-2 border-dashed border-blue-400 p-8 max-w-sm w-full text-center hover:bg-blue-50 hover:border-blue-500 transition-all duration-300 cursor-pointer group"
        >
          <div className="w-20 h-20 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <PlusIcon className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">Create New Agent</h3>
        </div>
      </div>
    </div>
  );
};

export default AdminAgents;