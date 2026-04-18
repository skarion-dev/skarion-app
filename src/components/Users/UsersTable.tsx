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
import MakeAffiliateModal from "./MakeAffiliateModal";

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

export function UsersTable({ initialUsers, accessToken }: { initialUsers: User[], accessToken?: string }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleMakeAffiliate = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAffiliateSuccess = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Referral Code</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image} />
                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.username}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.roles?.map((r) => (
                    <span key={r.id} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {r.name}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {user.referralCode || (
                  <span className="text-muted-foreground italic text-xs">None</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleMakeAffiliate(user)}
                  disabled={!!user.referralCode && user.roles?.some(r => r.name === 'affiliate_user')}
                >
                  Make Affiliate
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedUser && (
        <MakeAffiliateModal 
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          user={selectedUser}
          accessToken={accessToken}
          onSuccess={handleAffiliateSuccess}
        />
      )}
    </div>
  );
}
