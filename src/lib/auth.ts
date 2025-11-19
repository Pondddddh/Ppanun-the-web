import { JWTPayload, jwtVerify, SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-this")

export interface UserPayload extends JWTPayload{
  id: string
  email: string
  username: string
  role: "user" | "admin"
  credits: number // Added credits to payload for dashboard display
}

export async function createToken(payload: UserPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)

  return token
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as UserPayload
  } catch (error) {
    return null
  }
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(";").map((c) => c.trim())
  const tokenCookie = cookies.find((c) => c.startsWith("token="))

  return tokenCookie ? tokenCookie.split("=")[1] : null
}
