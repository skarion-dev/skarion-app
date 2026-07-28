"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleManagementSheet } from "./RoleManagementSheet";
import { Settings2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string;
  isActive: boolean;
  referralCode: string;
  roles: { id: string; name: string }[];
}

const ROLE_COLORS: Record<string, string> = {
  admin:            "bg-red-100 text-red-700",
  affiliate_user:   "bg-amber-100 text-amber-700",
  candidate:        "bg-violet-100 text-violet-700",
  customer_support: "bg-sky-100 text-sky-700",
  user:             "bg-slate-100 text-slate-600",
};

export function UsersTable({
  initialUsers,
  accessToken,
}: {
  initialUsers: User[];
  accessToken?: string;
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [sheetUser, setSheetUser] = useState<User | null>(null);

  const handleSuccess = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    // Keep the sheet open but with fresh data so the user can see the result
    setSheetUser(updatedUser);
  };

  return (
    <>
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Roles</TableHead>
              <TableHead className="font-semibold">Referral Code</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                {/* User */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border/50">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="text-xs font-semibold">
                        {user.name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">@{user.username}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>

                {/* Roles */}
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles?.length > 0 ? (
                      user.roles.map((r) => (
                        <span
                          key={r.id}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            ROLE_COLORS[r.name] ?? "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {r.name.replace(/_/g, " ")}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">—</span>
                    )}
                  </div>
                </TableCell>

                {/* Referral Code */}
                <TableCell>
                  {user.referralCode ? (
                    <span className="font-mono text-xs font-semibold tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">
                      {user.referralCode}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">None</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => setSheetUser(user)}
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    Manage Roles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sheetUser && (
        <RoleManagementSheet
          open={!!sheetUser}
          onOpenChange={(open) => !open && setSheetUser(null)}
          user={sheetUser}
          accessToken={accessToken}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
