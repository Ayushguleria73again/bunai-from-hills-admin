import React, {
  useEffect,
  useState,
  useCallback,
  useMemo
} from 'react'
import { useAdmin } from '../context/AdminContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faTimes,
  faRupeeSign
} from '@fortawesome/free-solid-svg-icons'

const statusStyles = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800'
}

/* ✅ Order Title Helper */
const getOrderTitle = (items = []) => {
  if (!items.length) return '—'
  if (items.length === 1) return items[0].title
  return `${items[0].title} + ${items.length - 1} more`
}

const Orders = () => {
  const {
    orders = [],
    fetchOrders,
    updateOrderStatus,
    loading = {}
  } = useAdmin()

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  /* ================= STATUS UPDATE ================= */

  const handleStatusChange = useCallback(
    async (orderId, newStatus) => {
      try {
        setUpdatingId(orderId)
        await updateOrderStatus(orderId, newStatus)
      } catch (err) {
        console.error('Failed to update order status', err)
      } finally {
        setUpdatingId(null)
      }
    },
    [updateOrderStatus]
  )

  /* ================= FILTER (FIXED) ================= */

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders

    return orders.filter(o => {
      const status = String(o.orderStatus || '')
        .toLowerCase()
        .trim()

      return status === statusFilter
    })
  }, [orders, statusFilter])

  const isLoading = loading.orders

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          {['all','pending','processing','shipped','completed','cancelled'].map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center h-64 items-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-green-600 rounded-full" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                {['Order ID','Title','Customer','Date','Amount','Status','Payment','Actions']
                  .map(h => (
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
              {filteredOrders.map(order => {
                const customer = order.customerInfo || {}
                const normalizedStatus = String(order.orderStatus || '')
                  .toLowerCase()
                  .trim()

                return (
                  <tr key={order._id}>
                    <td className="px-6 py-4 text-sm font-medium">
                      {order._id}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {getOrderTitle(order.items)}
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
                      <FontAwesomeIcon icon={faRupeeSign} className="mr-1 text-xs" />
                      {(order.totalAmount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 text-xs rounded-full ${
                          statusStyles[normalizedStatus] || ''
                        }`}
                      >
                        {normalizedStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {order.paymentMethod}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-indigo-600 mr-3"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>

                      {normalizedStatus !== 'completed' &&
                       normalizedStatus !== 'cancelled' && (
                        <select
                          value={normalizedStatus}
                          disabled={updatingId === order._id}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          className="px-2 py-1 border rounded text-sm"
                        >
                          {['pending','processing','shipped','completed','cancelled']
                            .map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
{selectedOrder && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white max-w-4xl w-full rounded p-6 relative">
      <button
        onClick={() => setSelectedOrder(null)}
        className="absolute top-4 right-4 text-gray-600"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>

      <h2 className="text-xl font-semibold mb-4">
        {getOrderTitle(selectedOrder.items)}
      </h2>

      {/* CUSTOMER DETAILS */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Customer Details</h3>
        <p><strong>Name:</strong> {selectedOrder.customerInfo?.fullName}</p>
        <p><strong>Email:</strong> {selectedOrder.customerInfo?.email}</p>
        <p><strong>Phone:</strong> {selectedOrder.customerInfo?.phone}</p>
        <p>
          <strong>Address:</strong>{" "}
          {selectedOrder.customerInfo?.address},{" "}
          {selectedOrder.customerInfo?.city},{" "}
          {selectedOrder.customerInfo?.state} –{" "}
          {selectedOrder.customerInfo?.pincode}
        </p>
      </div>

      {/* ORDER ITEMS */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Order Items</h3>
        {(selectedOrder.items || []).map((item, i) => (
          <div key={i} className="flex justify-between py-1 text-sm">
            <span>{item.title} × {item.quantity}</span>
            <span>
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="border-t mt-4 pt-4 flex justify-between font-semibold">
        <span>Total Amount</span>
        <span>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
      </div>

      <p className="text-sm mt-2 text-gray-600">
        Payment Method: {selectedOrder.paymentMethod.toUpperCase()}
      </p>
    </div>
  </div>
)}

    </div>
  )
}

export default Orders
