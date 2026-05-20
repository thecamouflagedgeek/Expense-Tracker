// Local Storage Auth Service - No Firebase
const USERS_KEY = 'ctrlfund_users'
const CURRENT_USER_KEY = 'ctrlfund_current_user'

export interface User {
  id: string
  email: string
  password?: string
  name: string
  role: "admin" | "member" | "viewer"
  isActive: boolean
  createdAt: string
  lastLogin: string | null
  customPermissions: {
    canEditTransactions: boolean
    canUploadReceipts: boolean
    canEditNotes: boolean
  }
}

// Initialize with default admin
const initializeUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  
  const defaultAdmin: User = {
    id: "default-admin",
    email: "admin@ctrlfund.com",
    password: "admin123", // Plain text for demo - never do this in production
    name: "Main Admin",
    role: "admin",
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    customPermissions: {
      canEditTransactions: true,
      canUploadReceipts: true,
      canEditNotes: true,
    },
  }
  
  const users = [defaultAdmin]
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  return users
}


// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  return initializeUsers()
}

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  const users = initializeUsers()
  return users.find(u => u.id === userId) || null
}

// Email and password login
export async function loginWithEmail(email: string, password: string): Promise<User> {
  const users = initializeUsers()
  const user = users.find(u => u.email === email && u.password === password)
  
  if (!user) {
    throw new Error("Invalid email or password")
  }
  
  if (!user.isActive) {
    throw new Error("Your account is not active. Please contact an administrator.")
  }
  
  // Update last login
  user.lastLogin = new Date().toISOString()
  const updatedUsers = users.map(u => u.id === user.id ? user : u)
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  
  return user
}

// Google login (mock for now)
export async function loginWithGoogle(): Promise<User> {
  throw new Error("Google login not available in offline mode")
}

// Signup
export async function signup(
  email: string,
  password: string,
  name: string,
  role: "admin" | "department-user",
): Promise<{ message: string } | { error: string }> {
  const users = initializeUsers()
  
  if (users.find(u => u.email === email)) {
    throw new Error("User with this email already exists")
  }
  
  const userRole: "admin" | "member" | "viewer" = role === "admin" ? "admin" : "member"
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    password,
    name,
    role: userRole,
    isActive: false,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    customPermissions: {
      canEditTransactions: role === "admin",
      canUploadReceipts: true,
      canEditNotes: role === "admin",
    },
  }
  
  users.push(newUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  
  return {
    message: "Account created successfully! Your account is pending approval from the main admin.",
  }
}

// Logout
export async function logout(): Promise<void> {
  localStorage.removeItem(CURRENT_USER_KEY)
}

// Get current user
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY)
  return stored ? JSON.parse(stored) : null
}

// Update user status
export async function updateUserStatus(userId: string, isActive: boolean): Promise<void> {
  const users = initializeUsers()
  const updatedUsers = users.map(u => 
    u.id === userId ? { ...u, isActive } : u
  )
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
}

// Update user permissions
export async function updateUserPermissions(
  userId: string,
  permissions: Partial<User["customPermissions"]>,
): Promise<void> {
  const users = initializeUsers()
  const updatedUsers = users.map(u => 
    u.id === userId ? { ...u, customPermissions: { ...u.customPermissions, ...permissions } } : u
  )
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
}

// Update user role
export async function updateUserRole(userId: string, role: "admin" | "member" | "viewer"): Promise<void> {
  const users = initializeUsers()
  const user = users.find(u => u.id === userId)
  
  if (!user) {
    throw new Error("User not found")
  }
  
  if (user.email === "admin@ctrlfund.com") {
    throw new Error("Cannot change the main admin's role")
  }
  
  const updatedPermissions = {
    canEditTransactions: role !== "viewer",
    canUploadReceipts: role !== "viewer",
    canEditNotes: role !== "viewer",
  }
  
  const updatedUsers = users.map(u => 
    u.id === userId ? { ...u, role, customPermissions: updatedPermissions } : u
  )
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
}

// Delete user
export async function deleteUser(userId: string): Promise<void> {
  const users = initializeUsers()
  const user = users.find(u => u.id === userId)
  
  if (!user) {
    throw new Error("User not found")
  }
  
  if (user.email === "admin@ctrlfund.com") {
    throw new Error("Cannot delete the main admin account")
  }
  
  const updatedUsers = users.filter(u => u.id !== userId)
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
}