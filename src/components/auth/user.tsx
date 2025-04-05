"use client"

import { capitalize, cn } from "@/lib/utils"
import { RefreshCw } from "lucide-react"
import { Button } from "../ui/button"
import { UserData } from "@/types/user"
import { Transaction } from "@/types/transaction"
import { useSessionStore } from "@/stores/use-session-store"
import { useQuery } from "@tanstack/react-query"
import { fetchUserData } from "@/lib/api/user"
import { fetchTransactions } from "@/lib/api/transaction"

export function User() {
  const session = useSessionStore((state) => state.session)

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
    data: transactions = [],
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    isFetching: isTransactionsFetching,
    refetch: refetchTransactions
  } = useQuery<Transaction[]>({
    queryKey: ["transactions", session?.user?.id],
    queryFn: fetchTransactions,
    enabled: !!session?.user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const handleRefresh = () => {
    refetchUser()
    refetchTransactions()
  }

  return (
    <div className="w-full max-w-lg mx-auto">
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
      </div>
    </div>
  )
}