/**
 * Authentication utilities for local PostgreSQL setup
 * Replaces Supabase Auth functionality
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./postgres-config";

// Types
export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  date_of_birth?: string;
  address?: any;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
  token?: string;
}

export interface ProfileResponse {
  profile: UserProfile | null;
  error: string | null;
}

// JWT utilities
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
};

// Authentication functions
export class AuthService {
  // Sign up a new user
  static async signUp(
    email: string,
    password: string,
    userData: {
      first_name: string;
      last_name: string;
      phone?: string;
    }
  ): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return { user: null, error: "User with this email already exists" };
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userResult = await query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, email_verified, created_at, updated_at",
        [email, passwordHash]
      );

      const user = userResult.rows[0];

      // Create profile manually (don't rely on trigger)
      await query(
        "INSERT INTO profiles (id, first_name, last_name, email, phone) VALUES ($1, $2, $3, $4, $5)",
        [
          user.id,
          userData.first_name,
          userData.last_name,
          email,
          userData.phone,
        ]
      );

      // Generate token
      const token = generateToken(user.id);

      return { user, error: null, token };
    } catch (error: any) {
      console.error("SignUp error:", error);
      return { user: null, error: error.message || "Failed to create account" };
    }
  }

  // Sign in user
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Get user with password hash
      const result = await query(
        "SELECT id, email, password_hash, email_verified, created_at, updated_at FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return { user: null, error: "Invalid email or password" };
      }

      const userData = result.rows[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        userData.password_hash
      );

      if (!isPasswordValid) {
        return { user: null, error: "Invalid email or password" };
      }

      // Remove password hash from response
      const { password_hash, ...user } = userData;

      // Generate token
      const token = generateToken(user.id);

      return { user, error: null, token };
    } catch (error: any) {
      console.error("SignIn error:", error);
      return { user: null, error: error.message || "Failed to sign in" };
    }
  }

  // Get user by ID
  static async getUser(
    userId: string
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const result = await query(
        "SELECT id, email, email_verified, created_at, updated_at FROM users WHERE id = $1",
        [userId]
      );

      if (result.rows.length === 0) {
        return { user: null, error: "User not found" };
      }

      return { user: result.rows[0], error: null };
    } catch (error: any) {
      console.error("GetUser error:", error);
      return { user: null, error: error.message || "Failed to get user" };
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<ProfileResponse> {
    try {
      const result = await query("SELECT * FROM profiles WHERE id = $1", [
        userId,
      ]);

      if (result.rows.length === 0) {
        return { profile: null, error: "Profile not found" };
      }

      return { profile: result.rows[0], error: null };
    } catch (error: any) {
      console.error("GetUserProfile error:", error);
      return { profile: null, error: error.message || "Failed to get profile" };
    }
  }

  // Update user profile
  static async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<ProfileResponse> {
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");

      const values = Object.values(updates);

      const result = await query(
        `UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [userId, ...values]
      );

      if (result.rows.length === 0) {
        return { profile: null, error: "Profile not found" };
      }

      return { profile: result.rows[0], error: null };
    } catch (error: any) {
      console.error("UpdateUserProfile error:", error);
      return {
        profile: null,
        error: error.message || "Failed to update profile",
      };
    }
  }

  // Verify email (placeholder for future implementation)
  static async verifyEmail(
    userId: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      await query("UPDATE users SET email_verified = true WHERE id = $1", [
        userId,
      ]);
      return { success: true, error: null };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to verify email",
      };
    }
  }

  // Change password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Get current password hash
      const result = await query(
        "SELECT password_hash FROM users WHERE id = $1",
        [userId]
      );

      if (result.rows.length === 0) {
        return { success: false, error: "User not found" };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        result.rows[0].password_hash
      );

      if (!isCurrentPasswordValid) {
        return { success: false, error: "Current password is incorrect" };
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await query(
        "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
        [newPasswordHash, userId]
      );

      return { success: true, error: null };
    } catch (error: any) {
      console.error("ChangePassword error:", error);
      return {
        success: false,
        error: error.message || "Failed to change password",
      };
    }
  }
}
