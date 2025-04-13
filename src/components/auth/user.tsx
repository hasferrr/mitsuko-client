"use client"

import { capitalize, cn } from "@/lib/utils"
import { RefreshCw } from "lucide-react"
import { Button } from "../ui/button"
import { UserData } from "@/types/user"
import { useSessionStore } from "@/stores/use-session-store"
import { useQuery } from "@tanstack/react-query"
import { fetchUserData } from "@/lib/api/user"
import { fetchTransactions, PaginatedTransactions, AmountFilter } from "@/lib/api/transaction"
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
  const [amountFilter, setAmountFilter] = useState<AmountFilter>("all")
  const pageSize = 10

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    isFetching: isUserFetching,
    refetch: refetchUser
  } = useQuery<UserData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserData,
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

  const transactions = paginatedTransactions?.data || []
  const totalCount = paginatedTransactions?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  const handleRefresh = () => {
    setPage(1)
    refetchUser()
    refetchTransactions()
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleAmountFilterChange = (value: AmountFilter) => {
    setAmountFilter(value)
    setPage(1)
  }

  return (
    <div className="w-[42rem] max-w-xl mx-auto">
      <div className="rounded-md overflow-hidden border mb-6">
        <div className="px-4 py-2 border-b">
          <div className="flex justify-between items-center">
            <h2 className="font-medium">User Information</h2>
            <Button
              variant="ghost"
              size="sm"
              className={cn("p-2", (isUserFetching || isTransactionsFetching) && "opacity-50")}
              onClick={handleRefresh}
            >
              <RefreshCw className={cn("h-4 w-4", (isUserFetching || isTransactionsFetching) && "animate-spin")} />
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
                  <span className={cn((user?.credit ?? 0) < 0 && "text-red-500")}>
                    {Math.round(user?.credit ?? 0).toLocaleString()}
                  </span>
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
                  capitalize(user?.tier ?? "unknown")
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
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
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
              <th className="px-4 py-2 text-left font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {isTransactionsLoading ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-muted-foreground">
                  Loading transactions...
                </td>
              </tr>
            ) : isTransactionsError ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-red-500">
                  Error loading transactions
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-muted-foreground">
                  No transaction history
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    {new Date(transaction.created_at).toLocaleString()}
                  </td>
                  <td className={cn("px-4 py-2", transaction.amount >= 0 ? "text-foreground" : "text-red-500")}>
                    {transaction.amount > 0 ? "+" : ""}
                    {Math.round(transaction.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {capitalize(transaction.event.replace(/_/g, " ").toLocaleLowerCase())}
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
    </div>
  )
}