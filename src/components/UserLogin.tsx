import React, { memo, useState, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/seatMapSlice'
import { v4 as uuidv4 } from 'uuid'

interface UserLoginProps {
  className?: string
}

const UserLogin: React.FC<UserLoginProps> = memo(({ className = '' }) => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.seatMap)
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false)
  const [userName, setUserName] = useState('')

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim()) return

    const newUser = {
      id: uuidv4(),
      name: userName.trim(),
    }

    dispatch(setUser(newUser))
    setUserName('')
    setIsLoginFormOpen(false)
  }, [userName, dispatch])

  const handleLogout = useCallback(() => {
    dispatch(setUser(null))
  }, [dispatch])

  const handleQuickLogin = useCallback(() => {
    const quickName = `User-${Math.floor(Math.random() * 1000)}`
    const newUser = {
      id: uuidv4(),
      name: quickName,
    }
    dispatch(setUser(newUser))
  }, [dispatch])

  if (user) {
    return (
      <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700">Đã đăng nhập với tên:</p>
            <p className="font-semibold text-green-800">{user.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Đăng nhập</h3>
        <p className="text-sm text-gray-600 mb-4">
          Đăng nhập để có thể chọn và đặt ghế
        </p>
        
        {!isLoginFormOpen ? (
          <div className="space-y-2">
            <button
              onClick={() => setIsLoginFormOpen(true)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Đăng nhập với tên tùy chỉnh
            </button>
            <button
              onClick={handleQuickLogin}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Đăng nhập nhanh
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nhập tên của bạn"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!userName.trim()}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginFormOpen(false)
                  setUserName('')
                }}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
})

UserLogin.displayName = 'UserLogin'

export default UserLogin
