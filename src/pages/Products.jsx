import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react'
import { useAdmin } from '../context/AdminContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faEdit,
  faTrash,
  faUpload,
  faRupeeSign
} from '@fortawesome/free-solid-svg-icons'

const IMAGE_BASE_URL =
  import.meta.env.VITE_API_URL || "https://bunai-from-hills-backend.vercel.app/"

const Products = () => {
  const {
    products = [],
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    loading = {}
  } = useAdmin()

  const fileReaderRef = useRef(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    inStock: true,
    image: null
  })

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  /* ================= CLEANUP ================= */

  useEffect(() => {
    return () => {
      if (fileReaderRef.current?.readyState === 1) {
        fileReaderRef.current.abort()
      }
    }
  }, [])

  /* ================= HELPERS ================= */

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      inStock: true,
      image: null
    })
    setImagePreview(null)
    setEditingProduct(null)
    setIsModalOpen(false)
  }, [])

  /* ================= HANDLERS ================= */

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }, [])

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFormData(prev => ({ ...prev, image: file }))

    const reader = new FileReader()
    fileReaderRef.current = reader

    reader.onloadend = () => {
      setImagePreview(reader.result)
    }

    reader.readAsDataURL(file)
  }, [])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      const payload = {
        ...formData,
        price: Number(formData.price)
      }

      try {
        if (editingProduct) {
          await updateProduct(editingProduct._id, payload)
        } else {
          await createProduct(payload)
        }
        resetForm()
      } catch (err) {
        console.error('Error saving product:', err)
      }
    },
    [formData, editingProduct, createProduct, updateProduct, resetForm]
  )

  const handleEdit = useCallback((product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price ?? '',
      category: product.category || '',
      inStock: !!product.inStock,
      image: null
    })
    setImagePreview(
      product.imageUrl ? `${IMAGE_BASE_URL}${product.imageUrl}` : null
    )
    setIsModalOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Delete this product?')) return
      try {
        await deleteProduct(id)
      } catch (err) {
        console.error('Error deleting product:', err)
      }
    },
    [deleteProduct]
  )

  const openAddModal = useCallback(() => {
    resetForm()
    setIsModalOpen(true)
  }, [resetForm])

  const isLoading = loading.products

  /* ================= UI ================= */

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={openAddModal}
          className="flex gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center h-64 items-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-green-600 rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">
          No products available.
        </p>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                {['Image','Name','Description','Price','Category','Stock','Actions']
                  .map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-medium text-gray-500">
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p._id}>
                  <td className="px-6 py-4">
                    {p.imageUrl ? (
                      <img
                        src={`${IMAGE_BASE_URL}${p.imageUrl}`}
                        alt={p.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                        <FontAwesomeIcon icon={faUpload} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">{p.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                    {p.description}
                  </td>
                  <td className="px-6 py-4">
                    <FontAwesomeIcon icon={faRupeeSign} className="mr-1 text-xs" />
                    {(p.price || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">{p.category || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 text-xs rounded-full ${
                      p.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleEdit(p)} className="mr-3 text-indigo-600">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-600">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white max-w-2xl w-full rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={resetForm}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FontAwesomeIcon icon={faRupeeSign} />
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full pl-8 border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select category</option>
                <option value="crochet">Crochet</option>
                <option value="home-decor">Home Decor</option>
                <option value="accessories">Accessories</option>
                <option value="toys">Toys</option>
                <option value="clothing">Clothing</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Image</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border rounded-md px-3 py-2"
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 rounded object-cover border"
                />
              )}
            </div>
            {editingProduct && (
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to keep existing image
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-600"
            />
            <span className="text-sm">In Stock</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
    </div>
  )
}

export default Products
