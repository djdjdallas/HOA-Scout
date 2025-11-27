'use client'

import { useState } from 'react'
import { Search, MapPin, Home } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import HOAAutocomplete from './HOAAutocomplete'
import CityZipBrowser from './CityZipBrowser'
import AddressLookup from './AddressLookup'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function HybridSearch({ className, defaultTab = 'name' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const router = useRouter()

  const handleSelectHOA = (hoa) => {
    router.push(`/reports/${hoa.id}`)
  }

  return (
    <div className={cn('w-full', className)}>
      <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="name" className="flex items-center justify-center gap-1.5">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">By Name</span>
            <span className="sm:hidden">Name</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center justify-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">By Location</span>
            <span className="sm:hidden">Location</span>
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center justify-center gap-1.5">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">By Address</span>
            <span className="sm:hidden">Address</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="name">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Search for an HOA by name. Start typing to see suggestions.
            </p>
            <HOAAutocomplete onSelect={handleSelectHOA} />
          </div>
        </TabsContent>

        <TabsContent value="location">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Browse all HOAs in a Florida city or zip code.
            </p>
            <CityZipBrowser onSelect={handleSelectHOA} />
          </div>
        </TabsContent>

        <TabsContent value="address">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Enter a property address to find nearby HOAs.
            </p>
            <AddressLookup onSelect={handleSelectHOA} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
