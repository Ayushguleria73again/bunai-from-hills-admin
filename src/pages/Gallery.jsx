import React, {
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react'
import { useAdmin } from '../context/AdminContext'
import { useToast } from '../context/ToastContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faTrash,
  faTimes
} from '@fortawesome/free-solid-svg-icons'

const IMAGE_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001'

const Gallery = () => {
  const {
    galleryItems = [],
    loading = {},
    fetchGallery,
    createGalleryItem,
    deleteGalleryItem
  } = useAdmin()

  const { addToast } = useToast()
  const fileReaderRef = useRef(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  })

  /* Fetch gallery on mount */
  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  /* Cleanup FileReader */
  useEffect(() => {
    return () => {
      if (fileReaderRef.current?.readyState === 1) {
        fileReaderRef.current.abort()
      }
    }
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      category: ''
    })
    setImagePreview(null)
    setImageFile(null)
    setIsModalOpen(false)
  }, [])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)

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

      if (!imageFile) {
        addToast('Please select an image', 'error')
        return
      }

      try {
        await createGalleryItem({
          ...formData,
          image: imageFile
        })

        addToast('Gallery item added successfully!', 'success')
        resetForm()
      } catch (error) {
        console.error(error)
        addToast('Error adding gallery item', 'error')
      }
    },
    [addToast, createGalleryItem, formData, imageFile, resetForm]
  )

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm('Delete this gallery item?')) return

      try {
        await deleteGalleryItem(id)
        addToast('Gallery item deleted', 'success')
      } catch (error) {
        console.error(error)
        addToast('Error deleting gallery item', 'error')
      }
    },
    [addToast, deleteGalleryItem]
  )

  const isLoading = loading.gallery

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Gallery Item
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-green-600" />
        </div>
      ) : galleryItems.length === 0 ? (
        <p className="text-center text-gray-500 mt-12">
          No gallery items found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryItems.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="aspect-square">
                <img
                  src={`${IMAGE_BASE_URL}${item.imageUrl}`}
                  alt={item.title || 'Gallery item'}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900">
                  {item.title || 'Untitled'}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {item.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Add Gallery Item</h2>
                <button onClick={resetForm}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Title"
                  className="w-full border px-3 py-2 rounded"
                />

                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Category"
                  className="w-full border px-3 py-2 rounded"
                />

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  rows={3}
                  className="w-full border px-3 py-2 rounded"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded"
                  />
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Add
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

export default Gallery
