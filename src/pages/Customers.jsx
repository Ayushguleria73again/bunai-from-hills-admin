import React, {
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../context/ToastContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEnvelope,
  faCalendarAlt,
  faSearch
} from '@fortawesome/free-solid-svg-icons'

const Customers = () => {
  const {
    customers = [],
    loading = {},
    fetchCustomers,
    replyToCustomer
  } = useAdmin()

  const { addToast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [replyModalOpen, setReplyModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replyLoading, setReplyLoading] = useState(false)

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  /* ================= HANDLERS ================= */

  const openReplyModal = useCallback((customer) => {
    setSelectedCustomer(customer)
    setReplyModalOpen(true)
    setReplyMessage('')
  }, [])

  const closeReplyModal = useCallback(() => {
    setReplyModalOpen(false)
    setSelectedCustomer(null)
    setReplyMessage('')
  }, [])

  const handleReplySubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!selectedCustomer || !replyMessage.trim()) return

      if (typeof replyToCustomer !== 'function') {
        addToast('Reply feature not available', 'error')
        return
      }

      setReplyLoading(true)
      try {
        const msg = selectedCustomer.message || ''
        const subject =
          `Re: ${msg.slice(0, 50)}${msg.length > 50 ? '...' : ''}`

        await replyToCustomer(
          selectedCustomer.email,
          subject,
          replyMessage
        )

        closeReplyModal()
        fetchCustomers()
      } catch (error) {
        console.error(error)
        addToast(
          error?.response?.data?.message || 'Error sending reply',
          'error'
        )
      } finally {
        setReplyLoading(false)
      }
    },
    [
      selectedCustomer,
      replyMessage,
      replyToCustomer,
      addToast,
      closeReplyModal,
      fetchCustomers
    ]
  )

  /* ================= FILTER ================= */

  const filteredContacts = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return customers.filter(c => {
      const name = c?.name?.toLowerCase() || ''
      const email = c?.email?.toLowerCase() || ''
      const message = c?.message?.toLowerCase() || ''
      return (
        name.includes(term) ||
        email.includes(term) ||
        message.includes(term)
      )
    })
  }, [customers, searchTerm])

  const isLoading = loading.customers

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>

        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center h-64 items-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-green-600 rounded-full" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          {searchTerm
            ? 'No customers match your search.'
            : 'No customer messages found.'}
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredContacts.map(contact => (
            <div
              key={contact._id}
              className="bg-white rounded shadow p-6"
            >
              <h3 className="font-semibold">{contact.name || '—'}</h3>
              <p className="text-sm text-gray-500">{contact.email}</p>

              <div className="flex items-center text-sm text-gray-600 mt-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                {contact.createdAt
                  ? new Date(contact.createdAt).toLocaleDateString()
                  : '—'}
              </div>

              <p className="mt-4 text-sm text-gray-600">
                {contact.message || 'No message'}
              </p>

              <button
                onClick={() => openReplyModal(contact)}
                className="mt-4 flex items-center gap-2 text-green-600"
              >
                <FontAwesomeIcon icon={faEnvelope} />
                Reply
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {replyModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-2">
              Reply to {selectedCustomer.name}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {selectedCustomer.email}
            </p>

            <form onSubmit={handleReplySubmit}>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                required
                className="w-full border rounded p-2 mb-4"
                placeholder="Type your reply..."
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReplyModal}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  {replyLoading ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
