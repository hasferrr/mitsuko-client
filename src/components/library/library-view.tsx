'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PublicLibrary from './public-library'
import MyLibrary from './my-library'

export default function LibraryView() {
  return (
    <div className="container max-w-6xl mx-auto p-4">
      <Tabs defaultValue="my-library">
        <div className="flex justify-between items-center pb-4">
          <TabsList>
            <TabsTrigger value="my-library">My Library</TabsTrigger>
            <TabsTrigger value="public-library">Public Library</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="my-library">
          <MyLibrary />
        </TabsContent>
        <TabsContent value="public-library">
          <PublicLibrary />
        </TabsContent>
      </Tabs>
    </div>
  )
}