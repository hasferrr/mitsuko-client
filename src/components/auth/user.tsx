"use client"

import Link from "next/link"
import { capitalize, cn } from "@/lib/utils"
import { RefreshCw, Plus } from "lucide-react"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"
import { UserCreditData } from "@/types/user"
import { useSessionStore } from "@/stores/use-session-store"
import { useQuery } from "@tanstack/react-query"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { fetchTransactions, PaginatedTransactions, AmountFilter } from "@/lib/api/transaction"
import { fetchCreditBatches, PaginatedCreditBatches } from "@/lib/api/credit-batch"
import { useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

export function User() {
  const session = useSessionStore((state) => state.session)
  const [page, setPage] = useState(1)
  const [amountFilter, setAmountFilter] = useState<AmountFilter>("non-zero")
  const pageSize = 10
  const [creditPage, setCreditPage] = useState(1)
  const creditPageSize = 5

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    isFetching: isUserFetching,
    refetch: refetchUser
  } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: !!session?.user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const {
    data: paginatedTransactions,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    isFetching: isTransactionsFetching,
    refetch: refetchTransactions
  } = useQuery<PaginatedTransactions>({
    queryKey: ["transactions", session?.user?.id, page, pageSize, amountFilter],
    queryFn: () => fetchTransactions(page, pageSize, amountFilter),
    enabled: !!session?.user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const {
    data: paginatedCreditBatches,
    isLoading: isCreditBatchesLoading,
    isError: isCreditBatchesError,
    isFetching: isCreditBatchesFetching,
    refetch: refetchCreditBatches,
  } = useQuery<PaginatedCreditBatches>({
    queryKey: ["creditBatches", session?.user?.id, creditPage, creditPageSize],
    queryFn: () => fetchCreditBatches(creditPage, creditPageSize),
    enabled: !!session?.user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const transactions = paginatedTransactions?.data || []
  const totalCount = paginatedTransactions?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  const creditBatches = paginatedCreditBatches?.data || []
  const creditTotalCount = paginatedCreditBatches?.count || 0
  const creditTotalPages = Math.ceil(creditTotalCount / creditPageSize)

  const handleRefresh = () => {
    setPage(1)
    setCreditPage(1)
    refetchUser()
    refetchTransactions()
    refetchCreditBatches()
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleCreditPageChange = (newPage: number) => {
    setCreditPage(newPage)
  }

  const handleAmountFilterChange = (value: AmountFilter) => {
    setAmountFilter(value)
    setPage(1)
  }

  return (
    <div className="w-[min(42rem,90vw)] mx-auto">
      <div className="rounded-md overflow-hidden border mb-6">
        <div className="px-4 py-2 border-b">
          <div className="flex justify-between items-center">
            <h2 className="font-medium">User Information</h2>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-2",
                (isUserFetching || isTransactionsFetching || isCreditBatchesFetching) && "opacity-50"
              )}
              onClick={handleRefresh}
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4",
                  (isUserFetching || isTransactionsFetching || isCreditBatchesFetching) && "animate-spin"
                )}
              />
              <span className="text-sm">Refresh</span>
            </Button>
          </div>
        </div>

        <table className="w-full">
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-2">Email</td>
              <td className="px-4 py-2 text-right">{session?.user?.email}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2">Credits</td>
              <td className="px-4 py-2 text-right">
                {isUserLoading ? (
                  <span className="italic text-muted-foreground">Loading...</span>
                ) : isUserError ? (
                  <span className="italic text-red-500">Error</span>
                ) : (
                  <div className="flex items-center justify-end gap-2">
                    <Link href="/pricing" target="_blank">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 py-0 px-2 mr-1 h-6 text-white hover:text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Buy
                      </Button>
                    </Link>
                    <span className={cn((user?.credit ?? 0) < 0 && "text-red-500")}>
                      {Math.round(user?.credit ?? 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </td>
            </tr>
            <tr className="border-b last:border-0">
              <td className="px-4 py-2">Account Tier</td>
              <td className="px-4 py-2 text-right">
                {isUserLoading ? (
                  <span className="italic text-muted-foreground">Loading...</span>
                ) : isUserError ? (
                  <span className="italic text-red-500">Error</span>
                ) : (
                  // capitalize(user?.tier ?? "unknown")
                  "Basic"
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-md overflow-hidden border">
        <div className="px-4 py-2 border-b flex justify-between items-center gap-4">
          <h2 className="font-medium">Transaction History</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <Select
              value={amountFilter}
              onValueChange={(value) => handleAmountFilterChange(value as AmountFilter)}
            >
              <SelectTrigger className="w-[105px] h-8">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="non-zero">Non-zero</SelectItem>
                <SelectItem value="zero">Zero</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left font-medium">Timestamp</th>
              <th className="px-4 py-2 text-left font-medium">Amount</th>
              <th className="px-4 py-2 text-left font-medium">Event</th>
              <th className="px-4 py-2 text-left font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {isTransactionsLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="px-4 py-2 h-10">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-2 h-10">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-2 h-10">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2 h-10">
                    <Skeleton className="h-4 w-28" />
                  </td>
                </tr>
              ))
            ) : isTransactionsError ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-red-500">
                  Error loading transactions
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  No transaction history
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b last:border-0 truncate">
                  <td className="px-4 py-2">
                    {new Date(transaction.created_at).toLocaleString()}
                  </td>
                  <td className={cn("px-4 py-2", transaction.amount >= 0 ? "text-foreground" : "text-red-500")}>
                    {transaction.amount > 0 ? "+" : ""}
                    {Math.round(transaction.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {capitalize(transaction.event?.replace(/_?(REQUEST|TOKENS)\b/g, "").replace(/_/g, " ").toLocaleLowerCase().trim() || "")}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {transaction.description}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="py-4 border-t">
            <Pagination>
              <PaginationContent>
                {page > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(page - 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show pages around current page
                  let pageNum
                  if (totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1
                  } else if (page <= 3) {
                    // Near start
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    // Near end
                    pageNum = totalPages - 4 + i
                  } else {
                    // Middle
                    pageNum = page - 2 + i
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={pageNum === page}
                        onClick={() => handlePageChange(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                {page < totalPages && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(page + 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <div className="rounded-md overflow-hidden border mt-6">
        <div className="px-4 py-2 border-b">
          <h2 className="font-medium">Credit Grants</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left font-medium">Received</th>
              <th className="px-4 py-2 text-left font-medium">State</th>
              <th className="px-4 py-2 text-left font-medium">Balance</th>
              <th className="px-4 py-2 text-left font-medium">Expires</th>
            </tr>
          </thead>
          <tbody>
            {isCreditBatchesLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="px-4 py-2 h-10">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-2 h-10">
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-2 h-10">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-2 h-10">
                    <Skeleton className="h-4 w-20" />
                  </td>
                </tr>
              ))
            ) : isCreditBatchesError ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-red-500">
                  Error loading credit grants
                </td>
              </tr>
            ) : creditBatches && creditBatches.length > 0 ? (
              creditBatches.map((batch) => {
                const isExpired = new Date(batch.expires_at) < new Date() || batch.remaining_amount <= 0
                const state = isExpired ? "Expired" : "Available"

                return (
                  <tr key={batch.id} className="border-b last:border-0">
                    <td className="px-4 py-2">
                      {new Date(batch.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          isExpired
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        )}
                      >
                        {state}
                      </span>
                    </td>
                    <td className="px-4 py-2">{batch.remaining_amount.toLocaleString()} / {batch.initial_amount.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {new Date(batch.expires_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  No credit grants history
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {creditTotalPages > 1 && (
          <div className="py-4 border-t">
            <Pagination>
              <PaginationContent>
                {creditPage > 1 && (
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handleCreditPageChange(creditPage - 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}

                {Array.from({ length: Math.min(5, creditTotalPages) }, (_, i) => {
                  let pageNum
                  if (creditTotalPages <= 5) {
                    pageNum = i + 1
                  } else if (creditPage <= 3) {
                    pageNum = i + 1
                  } else if (creditPage >= creditTotalPages - 2) {
                    pageNum = creditTotalPages - 4 + i
                  } else {
                    pageNum = creditPage - 2 + i
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={pageNum === creditPage}
                        onClick={() => handleCreditPageChange(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                {creditTotalPages > 5 && creditPage < creditTotalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handleCreditPageChange(creditTotalPages)}
                        className="cursor-pointer"
                      >
                        {creditTotalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                {creditPage < creditTotalPages && (
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handleCreditPageChange(creditPage + 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}