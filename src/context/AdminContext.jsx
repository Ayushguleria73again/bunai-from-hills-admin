import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react'
import axios from 'axios'
import { useToast } from './ToastContext'

/* ================= CONTEXT ================= */

const AdminContext = createContext(null)

export const useAdmin = () => {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}

/* ================= AXIOS ================= */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://bunai-from-hills-backend.vercel.app/"
})

/* ================= PROVIDER ================= */

export const AdminProvider = ({ children }) => {
  const { addToast } = useToast()
  const abortControllers = useRef(new Set())

  /* ---------- STATE ---------- */

  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [galleryItems, setGalleryItems] = useState([])
  const [blogs, setBlogs] = useState([])

  const [loading, setLoading] = useState({
    products: false,
    orders: false,
    customers: false,
    gallery: false,
    blogs: false
  })

  const overallLoading = Object.values(loading).some(Boolean)

  /* ---------- CLEANUP ---------- */

  useEffect(() => {
    return () => {
      abortControllers.current.forEach(c => c.abort())
      abortControllers.current.clear()
    }
  }, [])

  const track = () => {
    const c = new AbortController()
    abortControllers.current.add(c)
    return c
  }

  /* ---------- INTERCEPTORS ---------- */

  useEffect(() => {
    const req = api.interceptors.request.use(config => {
      const token = localStorage.getItem('adminToken')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    const res = api.interceptors.response.use(
      r => r,
      e => {
        if (e?.response?.status === 401) {
          localStorage.removeItem('adminToken')
          addToast('Session expired. Please login again.', 'error')
        }
        return Promise.reject(e)
      }
    )

    return () => {
      api.interceptors.request.eject(req)
      api.interceptors.response.eject(res)
    }
  }, [addToast])

  /* ---------- HELPERS ---------- */

  const buildFormData = (obj) => {
    const fd = new FormData()
    Object.entries(obj || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) fd.append(k, JSON.stringify(v))
      else if (typeof v === 'boolean') fd.append(k, String(v))
      else fd.append(k, v)
    })
    return fd
  }

  const fail = (e, msg) => {
    console.error(msg, e)
    addToast(e?.response?.data?.message || msg, 'error')
  }

  /* ================= FETCH ================= */

  const fetchProducts = useCallback(async () => {
    const c = track()
    setLoading(l => ({ ...l, products: true }))
    try {
      const { data } = await api.get('/products', { signal: c.signal })
      setProducts(data)
    } catch (e) {
      if (!axios.isCancel(e)) fail(e, 'Failed to fetch products')
    } finally {
      setLoading(l => ({ ...l, products: false }))
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    const c = track()
    setLoading(l => ({ ...l, orders: true }))
    try {
      const { data } = await api.get('/orders', { signal: c.signal })
      setOrders(data)
    } catch (e) {
      if (!axios.isCancel(e)) fail(e, 'Failed to fetch orders')
    } finally {
      setLoading(l => ({ ...l, orders: false }))
    }
  }, [])

  const fetchCustomers = useCallback(async () => {
    const c = track()
    setLoading(l => ({ ...l, customers: true }))
    try {
      const { data } = await api.get('/contact', { signal: c.signal })
      setCustomers(data)
    } catch (e) {
      if (!axios.isCancel(e)) fail(e, 'Failed to fetch customers')
    } finally {
      setLoading(l => ({ ...l, customers: false }))
    }
  }, [])

  const fetchGallery = useCallback(async () => {
    const c = track()
    setLoading(l => ({ ...l, gallery: true }))
    try {
      const { data } = await api.get('/gallery', { signal: c.signal })
      setGalleryItems(data)
    } catch (e) {
      if (!axios.isCancel(e)) fail(e, 'Failed to fetch gallery')
    } finally {
      setLoading(l => ({ ...l, gallery: false }))
    }
  }, [])

  const fetchBlogs = useCallback(async () => {
    const c = track()
    setLoading(l => ({ ...l, blogs: true }))
    try {
      const { data } = await api.get('/blog', { signal: c.signal })
      setBlogs(data)
    } catch (e) {
      if (!axios.isCancel(e)) fail(e, 'Failed to fetch blogs')
    } finally {
      setLoading(l => ({ ...l, blogs: false }))
    }
  }, [])

  /* ================= CRUD ================= */

  const createProduct = async (p) => {
    try {
      const { data } = await api.post('/products', buildFormData(p))
      setProducts(v => [...v, data])
      addToast('Product created', 'success')
      return data
    } catch (e) {
      fail(e, 'Create product failed')
      throw e
    }
  }

  const updateProduct = async (id, p) => {
    try {
      const { data } = await api.put(`/products/${id}`, buildFormData(p))
      setProducts(v => v.map(i => i._id === id ? data : i))
      addToast('Product updated', 'success')
      return data
    } catch (e) {
      fail(e, 'Update product failed')
      throw e
    }
  }

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`)
      setProducts(v => v.filter(i => i._id !== id))
      addToast('Product deleted', 'success')
    } catch (e) {
      fail(e, 'Delete product failed')
      throw e
    }
  }

  const createGalleryItem = async (g) => {
    try {
      const { data } = await api.post('/gallery', buildFormData(g))
      setGalleryItems(v => [data, ...v])
      addToast('Gallery item added', 'success')
      return data
    } catch (e) {
      fail(e, 'Create gallery failed')
      throw e
    }
  }

  const deleteGalleryItem = async (id) => {
    try {
      await api.delete(`/gallery/${id}`)
      setGalleryItems(v => v.filter(i => i._id !== id))
      addToast('Gallery item deleted', 'success')
    } catch (e) {
      fail(e, 'Delete gallery failed')
      throw e
    }
  }

  const createBlog = async (b) => {
    try {
      const { data } = await api.post('/blog', buildFormData(b))
      setBlogs(v => [data, ...v])
      return data
    } catch (e) {
      fail(e, 'Create blog failed')
      throw e
    }
  }

  const updateBlog = async (id, b) => {
    try {
      const { data } = await api.put(`/blog/${id}`, buildFormData(b))
      setBlogs(v => v.map(i => i._id === id ? data : i))
      return data
    } catch (e) {
      fail(e, 'Update blog failed')
      throw e
    }
  }

  const deleteBlog = async (id) => {
    try {
      await api.delete(`/blog/${id}`)
      setBlogs(v => v.filter(i => i._id !== id))
    } catch (e) {
      fail(e, 'Delete blog failed')
      throw e
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/orders/${id}`, { orderStatus: status })
      setOrders(v => v.map(i => i._id === id ? data : i))
      addToast('Order updated', 'success')
      return data
    } catch (e) {
      fail(e, 'Order update failed')
      throw e
    }
  }

  const replyToCustomer = async (email, subject, message) => {
    try {
      await api.post('/contact/reply', { email, subject, message })
      addToast('Reply sent', 'success')
    } catch (e) {
      fail(e, 'Reply failed')
      throw e
    }
  }

  /* ================= VALUE ================= */

  const value = useMemo(() => ({
    products,
    orders,
    customers,
    galleryItems,
    blogs,
    loading,
    overallLoading,
    fetchProducts,
    fetchOrders,
    fetchCustomers,
    fetchGallery,
    fetchBlogs,
    createProduct,
    updateProduct,
    deleteProduct,
    createGalleryItem,
    deleteGalleryItem,
    createBlog,
    updateBlog,
    deleteBlog,
    updateOrderStatus,
    replyToCustomer
  }), [
    products,
    orders,
    customers,
    galleryItems,
    blogs,
    loading,
    overallLoading
  ])

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}
