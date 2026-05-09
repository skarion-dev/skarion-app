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
import AssignCandidateModal from "./AssignCandidateModal";

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

  // Affiliate modal state
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [selectedAffiliateUser, setSelectedAffiliateUser] = useState<User | null>(null);

  // Candidate modal state
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [selectedCandidateUser, setSelectedCandidateUser] = useState<User | null>(null);

  const handleMakeAffiliate = (user: User) => {
    setSelectedAffiliateUser(user);
    setIsAffiliateModalOpen(true);
  };

  const handleAssignCandidate = (user: User) => {
    setSelectedCandidateUser(user);
    setIsCandidateModalOpen(true);
  };

  const handleAffiliateSuccess = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const handleCandidateSuccess = (updatedUser: User) => {
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
          {users.map((user) => {
            const isAlreadyCandidate = user.roles?.some((r) => r.name === "candidate");
            const isAlreadyAffiliate =
              !!user.referralCode && user.roles?.some((r) => r.name === "affiliate_user");

            return (
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
                      <span
                        key={r.id}
                        className={`text-xs px-2 py-1 rounded-full ${
                          r.name === "candidate"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
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
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMakeAffiliate(user)}
                      disabled={isAlreadyAffiliate}
                    >
                      Make Affiliate
                    </Button>
                    <Button
                      size="sm"
                      variant={isAlreadyCandidate ? "secondary" : "outline"}
                      onClick={() => handleAssignCandidate(user)}
                      disabled={isAlreadyCandidate}
                      className={isAlreadyCandidate ? "opacity-60 cursor-not-allowed" : ""}
                    >
                      {isAlreadyCandidate ? "✓ Candidate" : "Assign Candidate"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedAffiliateUser && (
        <MakeAffiliateModal
          isOpen={isAffiliateModalOpen}
          setIsOpen={setIsAffiliateModalOpen}
          user={selectedAffiliateUser}
          accessToken={accessToken}
          onSuccess={handleAffiliateSuccess}
        />
      )}

      {selectedCandidateUser && (
        <AssignCandidateModal
          isOpen={isCandidateModalOpen}
          setIsOpen={setIsCandidateModalOpen}
          user={selectedCandidateUser}
          accessToken={accessToken}
          onSuccess={handleCandidateSuccess}
        />
      )}
    </div>
  );
}
