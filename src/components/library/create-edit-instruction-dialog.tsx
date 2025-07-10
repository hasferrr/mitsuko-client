'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCustomInstructionStore } from '@/stores/data/use-custom-instruction-store'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { CustomInstruction } from '@/types/custom-instruction'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'Content is required'),
})

interface CreateEditInstructionDialogProps {
  children: ReactNode
  instruction?: CustomInstruction
}

export function CreateEditInstructionDialog({ children, instruction }: CreateEditInstructionDialogProps) {
  const { create, update, loading } = useCustomInstructionStore()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: instruction?.name || '',
      content: instruction?.content || '',
    },
    mode: 'onChange',
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: instruction?.name || '',
        content: instruction?.content || '',
      })
      setTimeout(() => handleResize(), 0)
    }
  }, [isOpen, instruction, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (instruction) {
      await update(instruction.id, values)
    } else {
      await create(values.name, values.content)
    }
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">{instruction ? 'Edit' : 'Create'} Custom Instruction</AlertDialogTitle>
          <AlertDialogDescription>
            {instruction ? 'Update your custom instruction details below.' : 'Create a new custom instruction to use in your translations.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Formal Translation Style" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      ref={textareaRef}
                      onInput={handleResize}
                      onFocus={handleResize}
                      className="min-h-[100px] max-h-[300px] overflow-y-auto resize-none"
                      placeholder="Enter your custom instruction here"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit" disabled={loading || !form.formState.isValid}>Save</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}