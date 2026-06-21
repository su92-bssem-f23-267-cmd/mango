'use server'

import db from '@/lib/db'
import bcrypt from 'bcryptjs'
import { registerSchema, RegisterInput } from '@/lib/validations'

export async function registerUser(data: RegisterInput) {
  try {
    const validatedData = registerSchema.safeParse(data)
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0].message }
    }

    const { name, email, password } = validatedData.data
    const lowercaseEmail = email.toLowerCase()

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: lowercaseEmail }
    })

    if (existingUser) {
      return { error: 'Email already registered' }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the user in the database
    await db.user.create({
      data: {
        name,
        email: lowercaseEmail,
        password: hashedPassword,
        role: 'USER' // default role is USER
      }
    })

    return { success: 'User registered successfully!' }
  } catch (error) {
    console.error('Registration failed:', error)
    return { error: 'Something went wrong. Please try again.' }
  }
}
