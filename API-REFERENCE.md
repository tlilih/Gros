# 📡 API Reference

## Supabase Client Methods

All database operations use the Supabase JavaScript client.

---

## Authentication

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: string,
  password: string,
})

// Returns:
// data.user: User object
// data.session: Session object with JWT
// error: Error object if failed
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string,
})

// Returns:
// data.user: User object
// data.session: Session object
```

### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser()

// Returns:
// user: User object or null
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut()
```

---

## Users Table

### Get User Profile

```typescript
const { data, error } = await supabase
  .from('users')
  .select('*, households(*)')
  .eq('id', userId)
  .single()

// Returns:
// data: {
//   id: string
//   email: string
//   name: string | null
//   household_id: string | null
//   households: Household | null
// }
```

### Update User Profile

```typescript
const { data, error } = await supabase
  .from('users')
  .update({
    name: string,
    avatar_url?: string,
    household_id?: string,
  })
  .eq('id', userId)

// Returns:
// data: Updated user object
```

### Create User Profile

```typescript
const { data, error } = await supabase
  .from('users')
  .insert({
    id: authUserId,
    email: string,
    name?: string,
  })

// Note: id must match auth.users.id
```

---

## Households Table

### Create Household

```typescript
const { data, error } = await supabase
  .from('households')
  .insert({
    name: string,
    invite_code: string, // 6 chars, uppercase
    owner_id: userId,
  })
  .select()
  .single()

// Returns:
// data: {
//   id: string
//   name: string
//   invite_code: string
//   owner_id: string
//   created_at: string
// }
```

### Find Household by Invite Code

```typescript
const { data, error } = await supabase
  .from('households')
  .select()
  .eq('invite_code', code)
  .single()

// Returns:
// data: Household object or null
// error: { message: 'No rows found' } if invalid code
```

### Get Household Details

```typescript
const { data, error } = await supabase
  .from('households')
  .select()
  .eq('id', householdId)
  .single()
```

---

## Items Table

### Get All Household Items

```typescript
const { data, error } = await supabase
  .from('items')
  .select()
  .eq('household_id', householdId)
  .order('created_at', { ascending: false })

// Returns:
// data: Item[]
```

### Add Item

```typescript
const { data, error } = await supabase
  .from('items')
  .insert({
    name: string,
    quantity?: string,
    category?: string,
    household_id: string,
    added_by_user_id: string,
  })
  .select()
  .single()

// Returns:
// data: {
//   id: string
//   name: string
//   quantity: string | null
//   is_completed: false
//   household_id: string
//   added_by_user_id: string
//   created_at: string
// }
```

### Toggle Item Completion

```typescript
const { data, error } = await supabase
  .from('items')
  .update({ is_completed: boolean })
  .eq('id', itemId)

// Returns:
// data: Updated item
```

### Delete Item

```typescript
const { error } = await supabase
  .from('items')
  .delete()
  .eq('id', itemId)

// Returns:
// error: null if successful
```

### Update Item

```typescript
const { data, error } = await supabase
  .from('items')
  .update({
    name?: string,
    quantity?: string,
    category?: string,
    is_completed?: boolean,
  })
  .eq('id', itemId)
```

---

## Real-time Subscriptions

### Subscribe to Items Changes

```typescript
const channel = supabase
  .channel('items-channel')
  .on(
    'postgres_changes',
    {
      event: '*', // or 'INSERT' | 'UPDATE' | 'DELETE'
      schema: 'public',
      table: 'items',
      filter: `household_id=eq.${householdId}`,
    },
    (payload) => {
      // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
      // payload.new: New row data
      // payload.old: Old row data (for UPDATE/DELETE)
      
      if (payload.eventType === 'INSERT') {
        // Handle new item
      } else if (payload.eventType === 'UPDATE') {
        // Handle item update
      } else if (payload.eventType === 'DELETE') {
        // Handle item deletion
      }
    }
  )
  .subscribe()

// Cleanup:
supabase.removeChannel(channel)
```

### Presence Tracking

```typescript
const channel = supabase.channel(`presence-${householdId}`)

// Track your presence
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    // state = { [userId]: [{ user_id, ... }], ... }
    
    const users = Object.values(state).flat()
    const othersOnline = users.filter(u => u.user_id !== myUserId)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: myUserId,
        online_at: new Date().toISOString(),
      })
    }
  })

// Cleanup:
supabase.removeChannel(channel)
```

---

## Query Builders

### Filtering

```typescript
// Equal
.eq('column', value)

// Not equal
.neq('column', value)

// Greater than
.gt('column', value)

// Less than
.lt('column', value)

// In array
.in('column', [value1, value2])

// Is null
.is('column', null)

// Text search
.textSearch('column', 'search term')
```

### Ordering

```typescript
.order('column', { ascending: true })
.order('created_at', { ascending: false })
```

### Limiting

```typescript
.limit(10)
.range(0, 9) // First 10 items
```

### Selecting Specific Columns

```typescript
.select('id, name, quantity')
.select('*, households(name, invite_code)')
```

---

## Error Handling

### Common Errors

```typescript
// Check for errors
if (error) {
  switch (error.code) {
    case 'PGRST116':
      // No rows found
      break
    case '23505':
      // Unique constraint violation
      break
    case '23503':
      // Foreign key violation
      break
    case '42501':
      // RLS policy violation
      break
    default:
      console.error('Unexpected error:', error)
  }
}
```

### Error Types

```typescript
interface PostgrestError {
  message: string
  details: string
  hint: string
  code: string
}
```

---

## TypeScript Types

### Generated Types

```typescript
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']
type Household = Database['public']['Tables']['households']['Row']
type Item = Database['public']['Tables']['items']['Row']

type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']
```

### Manual Types

```typescript
interface Item {
  id: string
  name: string
  quantity: string | null
  category: string | null
  is_completed: boolean
  household_id: string
  added_by_user_id: string
  created_at: string
  updated_at: string
}
```

---

## Rate Limits

### Supabase Free Tier

- **Database:** 500MB storage
- **Realtime:** 2GB bandwidth/month
- **Auth:** 50,000 monthly active users
- **API requests:** No hard limit, but throttled during high usage

### Best Practices

1. **Debounce input:** Don't query on every keystroke
2. **Batch updates:** Combine multiple updates when possible
3. **Use optimistic updates:** Update UI immediately, sync later
4. **Cache results:** Store frequently accessed data locally

---

## Security Best Practices

### Never Expose

```typescript
// ❌ NEVER use in client code
const SUPABASE_SERVICE_ROLE_KEY = 'xxx'

// ✅ Safe to use
const SUPABASE_ANON_KEY = 'xxx'
```

### Always Use RLS

```sql
-- ✅ All queries automatically filtered
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "household_items"
  ON items FOR SELECT
  USING (household_id IN (
    SELECT household_id FROM users WHERE id = auth.uid()
  ));
```

### Validate User Input

```typescript
// ✅ Sanitize and validate
const addItem = async (name: string) => {
  if (!name.trim() || name.length > 100) {
    throw new Error('Invalid item name')
  }
  
  await supabase.from('items').insert({
    name: name.trim(),
    household_id: validatedHouseholdId,
    added_by_user_id: auth.uid(),
  })
}
```

---

## Performance Optimization

### Use Select Wisely

```typescript
// ❌ Fetches all columns
.select('*')

// ✅ Only fetch what you need
.select('id, name, is_completed')
```

### Limit Results

```typescript
// ❌ Could return thousands of rows
await supabase.from('items').select()

// ✅ Limit to what you display
await supabase.from('items').select().limit(50)
```

### Use Indexes

```sql
-- Add indexes for frequently queried columns
CREATE INDEX items_household_id_idx ON items(household_id);
CREATE INDEX items_created_at_idx ON items(created_at DESC);
```

---

## Example: Complete CRUD Flow

```typescript
// Component state
const [items, setItems] = useState<Item[]>([])

// CREATE
const addItem = async (name: string, quantity?: string) => {
  // Optimistic update
  const tempItem: Item = {
    id: `temp-${Date.now()}`,
    name,
    quantity: quantity || null,
    is_completed: false,
    household_id: household.id,
    added_by_user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  setItems(prev => [tempItem, ...prev])
  
  // Save to database
  const { data, error } = await supabase
    .from('items')
    .insert({ name, quantity, household_id, added_by_user_id })
    .select()
    .single()
  
  if (error) {
    // Rollback optimistic update
    setItems(prev => prev.filter(i => i.id !== tempItem.id))
    toast.error('Failed to add item')
  } else {
    // Replace temp item with real item
    setItems(prev => prev.map(i => 
      i.id === tempItem.id ? data : i
    ))
  }
}

// READ
const loadItems = async () => {
  const { data, error } = await supabase
    .from('items')
    .select()
    .eq('household_id', household.id)
    .order('created_at', { ascending: false })
  
  if (data) setItems(data)
}

// UPDATE
const toggleItem = async (item: Item) => {
  const newCompleted = !item.is_completed
  
  // Optimistic update
  setItems(prev => prev.map(i =>
    i.id === item.id ? { ...i, is_completed: newCompleted } : i
  ))
  
  const { error } = await supabase
    .from('items')
    .update({ is_completed: newCompleted })
    .eq('id', item.id)
  
  if (error) {
    // Rollback
    setItems(prev => prev.map(i =>
      i.id === item.id ? item : i
    ))
  }
}

// DELETE
const deleteItem = async (itemId: string) => {
  // Optimistic delete
  const deletedItem = items.find(i => i.id === itemId)
  setItems(prev => prev.filter(i => i.id !== itemId))
  
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
  
  if (error && deletedItem) {
    // Restore item
    setItems(prev => [...prev, deletedItem])
  }
}
```

---

**API Version:** Supabase JS Client v2  
**Last Updated:** February 2026
