export interface Team {
    id: number;
    name: string;
    description: string;
    ownerId: string;
    tenantId: number;
    createdAt: string;
    updatedAt: string;
    members: Player[];
    bookings: Booking[];
    costs: Cost[];
}

export interface Player {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
}

export interface Booking {
    id: number;
    teamId: number;
    courtId: number;
    startTime: string;
    endTime: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    totalCost: number;
    description: string;
}

export interface Cost {
    id: number;
    teamId: number;
    amount: number;
    description: string;
    date: string;
    category: string;
}

export interface TeamMember {
    teamId: number;
    playerId: number;
    role: string;
} 