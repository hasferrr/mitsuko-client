"use client"

import { capitalize, cn } from "@/lib/utils"
import { RefreshCw } from "lucide-react"
import { Button } from "../ui/button"
import { UserData } from "@/types/user"
import { useSessionStore } from "@/stores/use-session-store"
import { useQuery } from "@tanstack/react-query"
import { fetchUserData } from "@/lib/api/user"

export function User() {
  const session = useSessionStore((state) => state.session)

  const { data: user, isLoading, isError, isFetching, refetch } = useQuery<UserData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserData,
    enabled: !!session?.user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const transactions = [
    {
      time: new Date("2025-04-02T06:55:23"),
      amount: 1000000,
      event: "Purchase tokens",
    },
    {
      time: new Date("2025-03-26T12:17:41"),
      amount: 1000000,
      event: "Purchase tokens",
    },
    {
      time: new Date("2025-03-25T04:07:13"),
      amount: -36000,
      event: "Translation Request",
    },
    {
      time: new Date("2025-03-16T09:45:52"),
      amount: -15916,
      event: "Translation Request",
    },
    {
      time: new Date("2025-03-16T09:39:45"),
      amount: -14284,
      event: "Translation Request",
    },
    {
      time: new Date("2025-03-16T09:36:20"),
      amount: -13060,
      event: "Translation Request",
    },
    {
      time: new Date("2025-03-16T09:34:20"),
      amount: -19608,
      event: "Translation Request",
    },
    {
      time: new Date("2025-03-16T09:00:13"),
      amount: -9406.26,
      event: "Translation Request",
    },
    {
      time: new Date("2025-03-16T09:00:13"),
      amount: 1000000,
      event: "Purchase tokens",
    },
    {
      time: new Date("2025-03-16T09:00:13"),
      amount: -10042.46,
      event: "Translation Request",
    },
  ]

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="rounded-md overflow-hidden border mb-6">
        <div className="px-4 py-2 border-b">
          <div className="flex justify-between items-center">
            <h2 className="font-medium">User Information</h2>
            <Button
              variant="ghost"
              size="sm"
              className={cn("p-2", isFetching && "opacity-50")}
              onClick={() => refetch()}
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
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
                {isLoading ? (
                  <span className="italic text-muted-foreground">Loading...</span>
                ) : isError ? (
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
                {isLoading ? (
                  <span className="italic text-muted-foreground">Loading...</span>
                ) : isError ? (
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-muted-foreground">
                  No transaction history
                </td>
              </tr>
            ) : (
              transactions.map((transaction, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    {transaction.time.toLocaleString()}
                  </td>
                  <td className={cn("px-4 py-2", transaction.amount >= 0 ? "text-foreground" : "text-red-500")}>
                    {transaction.amount >= 0 ? "+" : ""}
                    {Math.round(transaction.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{transaction.event}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}