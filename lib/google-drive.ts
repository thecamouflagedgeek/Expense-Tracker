const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Mock user for demonstration
const mockGoogleUser = {
  uid: "mock-google-user",
  email: "user@example.com",
  displayName: "Mock User",
}

export const signInWithGoogle = async () => {
  try {
    // Simulate Google sign-in delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful sign-in
    const mockAccessToken = "mock-access-token-" + Date.now()

    console.log("Mock Google Sign-In successful:", mockGoogleUser, mockAccessToken)
    return { user: mockGoogleUser, accessToken: mockAccessToken }
  } catch (error: any) {
    console.error("Mock Google Sign-In error:", error)
    throw new Error(error.message)
  }
}

export const signOutGoogle = async () => {
  try {
    // Simulate sign-out delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("Mock Google Sign-Out successful")
  } catch (error: any) {
    console.error("Mock Google Sign-Out error:", error)
    throw new Error(error.message)
  }
}

export const uploadFileToDrive = async (file: File, folderName: string, accessToken: string) => {
  if (!accessToken) {
    throw new Error("Google access token not available. Please sign in with Google first.")
  }

  try {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock successful upload response
    const mockResponse = {
      id: "mock-file-id-" + Date.now(),
      name: file.name,
      mimeType: file.type,
      size: file.size.toString(),
      webViewLink: `https://drive.google.com/file/d/mock-file-id-${Date.now()}/view`,
      parents: [`mock-folder-id-${folderName}`],
    }

    console.log("Mock file uploaded to Google Drive:", mockResponse)
    return mockResponse
  } catch (error) {
    console.error("Mock error uploading file to Google Drive:", error)
    throw error
  }
}

const getFolderId = async (folderName: string, accessToken: string) => {
  // Mock folder lookup
  await new Promise((resolve) => setTimeout(resolve, 500))
  return `mock-folder-id-${folderName}`
}

const createFolder = async (folderName: string, accessToken: string) => {
  // Mock folder creation
  await new Promise((resolve) => setTimeout(resolve, 500))
  return `mock-folder-id-${folderName}`
}
