import React, { useEffect, useMemo } from 'react'
import { useAdmin } from '../context/AdminContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShoppingBag,
  faBox,
  faUsers,
  faRupeeSign,
  faChartLine
} from '@fortawesome/free-solid-svg-icons'

const statusStyles = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800'
}

const Dashboard = () => {
  const {
    products = [],
    orders = [],
    fetchProducts,
    fetchOrders,
    loading = {}
  } = useAdmin()

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [fetchProducts, fetchOrders])

  /* ================= STATS ================= */

  const {
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    recentOrders
  } = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : []

    const revenue = safeOrders.reduce(
      (sum, o) => sum + (Number(o.totalAmount) || 0),
      0
    )

    return {
      totalProducts: products.length,
      totalOrders: safeOrders.length,
      totalRevenue: revenue,
      pendingOrders: safeOrders.filter(o => o.orderStatus === 'pending').length,
      recentOrders: [...safeOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    }
  }, [products, orders])

  const isLoading = loading.products || loading.orders

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={faShoppingBag}
          label="Total Products"
          value={totalProducts}
          color="blue"
        />
        <StatCard
          icon={faBox}
          label="Total Orders"
          value={totalOrders}
          color="green"
        />
        <StatCard
          icon={faRupeeSign}
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          color="yellow"
        />
        <StatCard
          icon={faChartLine}
          label="Pending Orders"
          value={pendingOrders}
          color="red"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-48 items-center">
            <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-green-600 rounded-full" />
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-center py-12 text-gray-500">
            No recent orders.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID','Customer','Date','Amount','Status'].map(h => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map(order => {
                  const customer = order.customerInfo || {}
                  return (
                    <tr key={order._id}>
                      <td className="px-6 py-4 text-sm font-medium">
                        {order._id}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {customer.fullName || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 text-xs rounded-full ${
                          statusStyles[order.orderStatus] || ''
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= STAT CARD ================= */

const StatCard = ({ icon, label, value, color }) => {
  const bg = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  }[color]

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bg}`}>
          <FontAwesomeIcon icon={icon} className="text-xl" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
