import React, {
  useState,
  useCallback,
  useRef,
  useEffect
} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isMountedRef = useRef(true)
  const errorRef = useRef(null)

  const from = location.state?.from?.pathname || '/'

  /* ================= LIFECYCLE ================= */

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /* ================= HANDLER ================= */

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (loading) return

      const safeEmail = email.trim()
      const safePassword = password.trim()

      if (!safeEmail || !safePassword) {
        setError('Email and password are required')
        return
      }

      setLoading(true)
      setError('')

      try {
        const result = await login(safeEmail, safePassword)

        if (result?.success) {
          navigate(from, { replace: true })
          return
        }

        if (isMountedRef.current) {
          setError(result?.message || 'Invalid credentials')
          errorRef.current?.focus()
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(
            err?.response?.data?.message ||
            err?.message ||
            'An error occurred during login'
          )
          errorRef.current?.focus()
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    },
    [email, password, loading, login, navigate, from]
  )

  /* ================= UI ================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bunai From The Hills Management Panel
          </p>
        </div>

        {error && (
          <div
            ref={errorRef}
            tabIndex={-1}
            className="rounded-md bg-red-50 p-4 outline-none"
          >
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:bg-gray-100"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          <p>Demo credentials: admin@bunaifromhills.com / admin123</p>
        </div>
      </div>
    </div>
  )
}

export default Login
