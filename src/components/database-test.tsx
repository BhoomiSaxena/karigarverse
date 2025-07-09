"use client"

import { useDatabase } from '@/contexts/DatabaseContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DatabaseTest() {
  const { user, profile, artisanProfile, loading, isArtisan } = useDatabase()

  if (loading) {
    return <div>Loading database connection...</div>
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
        <CardDescription>Verify Supabase integration is working</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Auth Status:</strong> {user ? '✅ Authenticated' : '❌ Not authenticated'}
        </div>
        
        {user && (
          <>
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
            <div>
              <strong>Email:</strong> {user.email}
            </div>
          </>
        )}

        {profile && (
          <>
            <div>
              <strong>Profile:</strong> ✅ Loaded
            </div>
            <div>
              <strong>Name:</strong> {profile.full_name}
            </div>
          </>
        )}

        <div>
          <strong>Artisan Status:</strong> {isArtisan ? '✅ Is Artisan' : '❌ Not an artisan'}
        </div>

        {artisanProfile && (
          <div>
            <strong>Shop Name:</strong> {artisanProfile.shop_name}
          </div>
        )}

        {!user && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Sign in to test database integration</p>
            <div className="space-x-2">
              <Button asChild variant="outline" size="sm">
                <a href="/login">Sign In</a>
              </Button>
              <Button asChild size="sm">
                <a href="/signup">Sign Up</a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
