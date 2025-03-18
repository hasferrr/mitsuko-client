"use client"

export const DashboardItemList = ({
  icon,
  title,
  description,
  date,
  action
}: {
  icon: React.ReactNode
  title: string
  description: string
  date: string
  action?: React.ReactNode
}) => {
  return (
    <div className="border border-border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-secondary p-2 rounded-lg">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-medium">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{date}</span>
          {action}
        </div>
      </div>
    </div>
  )
}
