'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { Item } from '@/types/supabase'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function ListPage() {
  const [items, setItems] = useState<Item[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, household, setUser, setHousehold, partnerOnline } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    initializeUser()
  }, [])

  useEffect(() => {
    if (household) {
      loadItems()
      subscribeToItems()
      subscribeToPresence()
    }
  }, [household])

  const initializeUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/')
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*, households(*)')
      .eq('id', authUser.id)
      .single()

    if (!userData || !userData.household_id) {
      router.push('/onboarding')
      return
    }

    setUser(userData)
    const { data: householdData } = await supabase
      .from('households')
      .select()
      .eq('id', userData.household_id)
      .single()
    
    if (householdData) {
      setHousehold(householdData)
    }
  }

  const loadItems = async () => {
    if (!household) return

    const { data, error } = await supabase
      .from('items')
      .select()
      .eq('household_id', household.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setItems(data)
    }
    setLoading(false)
  }

  const subscribeToItems = () => {
    if (!household) return

    const channel = supabase
      .channel('items-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `household_id=eq.${household.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((prev) => [payload.new as Item, ...prev])
            toast.success('Partner added an item! 🎉')
          } else if (payload.eventType === 'UPDATE') {
            setItems((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? (payload.new as Item) : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setItems((prev) => prev.filter((item) => item.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const subscribeToPresence = () => {
    if (!household || !user) return

    const channel = supabase.channel(`presence-${household.id}`)
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat()
        const partnerPresent = users.some((u: any) => u.user_id !== user.id)
        useStore.setState({ partnerOnline: partnerPresent })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim() || !user || !household) return

    const optimisticItem: Item = {
      id: `temp-${Date.now()}`,
      name: newItemName,
      quantity: newItemQuantity || null,
      category: null,
      is_completed: false,
      added_by_user_id: user.id,
      household_id: household.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setItems((prev) => [optimisticItem, ...prev])
    setNewItemName('')
    setNewItemQuantity('')

    const { error } = await supabase.from('items').insert({
      name: newItemName,
      quantity: newItemQuantity || null,
      added_by_user_id: user.id,
      household_id: household.id,
    })

    if (error) {
      setItems((prev) => prev.filter((item) => item.id !== optimisticItem.id))
      toast.error('Failed to add item')
    }
  }

  const toggleItem = async (item: Item) => {
    const newCompleted = !item.is_completed
    
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_completed: newCompleted } : i))
    )

    const { error } = await supabase
      .from('items')
      .update({ is_completed: newCompleted })
      .eq('id', item.id)

    if (error) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_completed: !newCompleted } : i))
      )
      toast.error('Failed to update item')
    }
  }

  const deleteItem = async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId))

    const { error } = await supabase.from('items').delete().eq('id', itemId)

    if (error) {
      toast.error('Failed to delete item')
      loadItems()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const activeItems = items.filter((item) => !item.is_completed)
  const completedItems = items.filter((item) => item.is_completed)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="glass rounded-3xl shadow-soft p-6 mb-6 border-2 border-white/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black mb-1">{household?.name}</h1>
              <p className="text-sm text-gray-600">
                Invite Code: <span className="font-mono font-bold">{household?.invite_code}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {partnerOnline && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-secondary-100 text-secondary-700 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
                  Partner online
                </motion.div>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Add Item Form */}
          <form onSubmit={addItem} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add an item..."
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none transition-colors bg-white/50"
            />
            <input
              type="text"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              placeholder="Qty"
              className="w-20 px-3 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-400 focus:outline-none transition-colors bg-white/50"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg touch-feedback font-bold"
            >
              Add
            </button>
          </form>
        </div>

        {/* Active Items */}
        <div className="glass rounded-3xl shadow-soft p-6 mb-6 border-2 border-white/40">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            <span>🛒</span> Shopping List ({activeItems.length})
          </h2>
          <AnimatePresence mode="popLayout">
            {activeItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-gray-400"
              >
                <p className="text-5xl mb-3">📝</p>
                <p>No items yet. Add something!</p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {activeItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-200 transition-all group"
                  >
                    <button
                      onClick={() => toggleItem(item)}
                      className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-primary-500 transition-colors flex-shrink-0 touch-feedback"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      {item.quantity && (
                        <p className="text-sm text-gray-500">{item.quantity}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all touch-feedback"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl shadow-soft p-6 border-2 border-white/40"
          >
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-gray-500">
              <span>✅</span> Completed ({completedItems.length})
            </h2>
            <div className="space-y-2">
              {completedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100"
                >
                  <button
                    onClick={() => toggleItem(item)}
                    className="w-6 h-6 rounded-full bg-secondary-500 flex items-center justify-center flex-shrink-0 touch-feedback"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-400 line-through">{item.name}</p>
                    {item.quantity && (
                      <p className="text-sm text-gray-400">{item.quantity}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors touch-feedback"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
