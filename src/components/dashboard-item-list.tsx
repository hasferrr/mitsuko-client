"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Edit, Trash } from "lucide-react"
import { DeleteDialogue } from "./ui-custom/delete-dialogue"
import { EditDialogue } from "./ui-custom/edit-dialogue"

export const DashboardItemList = ({
  icon,
  title,
  description,
  date,
  handleEdit,
  handleDelete,
}: {
  icon: React.ReactNode
  title: string
  description: string
  date: string
  handleEdit: (newName: string) => Promise<void>
  handleDelete: () => Promise<void>
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirmDelete = async () => {
    setIsProcessing(true)
    try {
      await handleDelete()
      setIsDeleteOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="border border-border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-secondary p-2 rounded-lg">
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-medium line-clamp-2">{title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{date}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 min-w-6 p-0"
            onClick={() => setIsEditOpen(true)}
            disabled={isProcessing}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 min-w-6 p-0"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isProcessing}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditDialogue
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        initialValue={title}
        onSave={async (newValue) => {
          setIsProcessing(true)
          try {
            await handleEdit(newValue)
          } finally {
            setIsProcessing(false)
          }
        }}
        isProcessing={isProcessing}
      />

      <DeleteDialogue
        handleDelete={handleConfirmDelete}
        isDeleteModalOpen={isDeleteOpen}
        setIsDeleteModalOpen={setIsDeleteOpen}
        isProcessing={isProcessing}
      />
    </div>
  )
}
