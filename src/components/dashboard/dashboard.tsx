import { FeaturesOptions } from "./features-options"
import { RecentProjects } from "./recent-projects"

export function Dashboard() {
  return (
    <div className="flex-1 p-6 relative">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-medium mb-3 -tracking-[0.02em]">Get started with Mitsuko</h2>
          <p className="text-muted-foreground mx-auto">
            Select one of the options below to get started with AI-powered tools
          </p>
        </div>
        <FeaturesOptions />
        <RecentProjects />
      </div>
    </div>
  )
}