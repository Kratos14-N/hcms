import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const instant = false;

interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  roomNumber?: string | null;
  blockAssigned?: string | null;
  categoryExpertise?: string | null;
  phone?: string | null;
  redirectUrl?: string;
}

const FALLBACK_DIRECTORY: DirectoryUser[] = [
  // Students
  {
    id: "cmv48dmol00007k7czr57hpc2",
    name: "Aarav Sharma",
    email: "aarav.student@hostel.edu",
    role: Role.STUDENT,
    roomNumber: "A-204",
    blockAssigned: "Block A",
  },
  {
    id: "cmv48dn1z00017k7ct1ktqlrs",
    name: "Rohan Patel",
    email: "rohan.student@hostel.edu",
    role: Role.STUDENT,
    roomNumber: "B-312",
    blockAssigned: "Block B",
  },
  {
    id: "cmv48dngl00027k7ci4608hgf",
    name: "Priya Iyer",
    email: "priya.student@hostel.edu",
    role: Role.STUDENT,
    roomNumber: "C-105",
    blockAssigned: "Block C",
  },
  {
    id: "cmv48dnuj00037k7c80qgkxor",
    name: "Ananya Das",
    email: "ananya.student@hostel.edu",
    role: Role.STUDENT,
    roomNumber: "A-108",
    blockAssigned: "Block A",
  },
  // Wardens
  {
    id: "cmv48do8r00047k7cey5r15op",
    name: "Dr. Vikram Singh",
    email: "warden.singh@hostel.edu",
    role: Role.WARDEN,
    blockAssigned: "Block A",
  },
  {
    id: "cmv48don500057k7cfztdr1vy",
    name: "Prof. Rajesh Gupta",
    email: "warden.gupta@hostel.edu",
    role: Role.WARDEN,
    blockAssigned: "Block B",
  },
  {
    id: "cmv48dp1d00067k7c5pymtohf",
    name: "Dr. Sunita Rao",
    email: "warden.rao@hostel.edu",
    role: Role.WARDEN,
    blockAssigned: "Block C",
  },
  // Workers
  {
    id: "cmv48dpg800077k7caoq3b1y6",
    name: "Ramesh Kumar",
    email: "ramesh.electrician@hostel.edu",
    phone: "+91 98111 22233",
    role: Role.WORKER,
    categoryExpertise: "ELECTRICAL",
  },
  {
    id: "cmv48dpu000087k7cdjr8vb4a",
    name: "Suresh Verma",
    email: "suresh.plumber@hostel.edu",
    phone: "+91 98222 33344",
    role: Role.WORKER,
    categoryExpertise: "PLUMBING",
  },
  {
    id: "cmv48dq7z00097k7cwtdjpnmz",
    name: "Amit Sharma",
    email: "amit.carpenter@hostel.edu",
    phone: "+91 98333 44455",
    role: Role.WORKER,
    categoryExpertise: "CARPENTRY",
  },
  {
    id: "cmv48dqmz000a7k7cuuyijech",
    name: "Manoj Kumar",
    email: "manoj.network@hostel.edu",
    phone: "+91 98444 55566",
    role: Role.WORKER,
    categoryExpertise: "NETWORKING",
  },
  // Coordinators
  {
    id: "cmv48dr16000b7k7cusilp342",
    name: "Pooja Mehta",
    email: "admin.hcms@hostel.edu",
    role: Role.COORDINATOR,
  },
  {
    id: "cmv48drez000c7k7csjrddk8s",
    name: "Kavita Nambiar",
    email: "kavita.operations@hostel.edu",
    role: Role.COORDINATOR,
  },
];

function resolveRedirect(role: Role): string {
  switch (role) {
    case Role.STUDENT:
      return "/student";
    case Role.WORKER:
      return "/worker";
    case Role.WARDEN:
      return "/warden";
    case Role.COORDINATOR:
      return "/coordinator";
    default:
      return "/student";
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        roomNumber: true,
        blockAssigned: true,
        categoryExpertise: true,
        phone: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      success: true,
      users: users.length > 0 ? users : FALLBACK_DIRECTORY,
    });
  } catch (err) {
    console.warn("Failed to query users list from database; returning fallback directory:", err);
    return NextResponse.json({
      success: true,
      users: FALLBACK_DIRECTORY,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      role: requestedRole,
      email,
      phone,
      identifier,
      name,
      roomNumber,
      blockAssigned,
      categoryExpertise,
      userId,
    } = body;

    const targetRole: Role =
      requestedRole && Object.values(Role).includes(requestedRole as Role)
        ? (requestedRole as Role)
        : Role.STUDENT;

    let user: DirectoryUser | null = null;

    const rawInput = (identifier || phone || email || "").trim();
    const isPhoneLogin = Boolean(
      phone || (!rawInput.includes("@") && /[0-9]{6,}/.test(rawInput))
    );
    const cleanDigits = rawInput.replace(/[^0-9]/g, "").slice(-10);

    // 1. Attempt database lookup & automatic registration with try/catch
    try {
      if (userId) {
        user = await prisma.user.findUnique({ where: { id: userId } });
      }

      // Handle Phone-based staff authentication
      if (!user && isPhoneLogin && cleanDigits) {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: { contains: cleanDigits } },
              { email: { startsWith: `staff.${cleanDigits}` } },
            ],
          },
        });

        // If not found in DB, check fallback directory by phone
        if (!user) {
          const fbWorker = FALLBACK_DIRECTORY.find(
            (u) => u.phone && u.phone.replace(/[^0-9]/g, "").includes(cleanDigits)
          );
          if (fbWorker) {
            user = fbWorker;
          }
        }

        // Auto-register staff member with phone if not found
        if (!user && (targetRole === Role.WORKER || requestedRole === "WORKER")) {
          const cleanName = name?.trim() || "Field Technician";
          const staffPhone = rawInput.startsWith("+") ? rawInput : `+91 ${rawInput}`;
          const generatedEmail = `staff.${cleanDigits}@hostel.edu`;

          user = await prisma.user.create({
            data: {
              name: cleanName,
              phone: staffPhone,
              email: generatedEmail,
              role: Role.WORKER,
              categoryExpertise: categoryExpertise?.trim() || "MAINTENANCE",
            },
          });
        }
      }

      // Handle Email-based authentication
      if (!user && email && !isPhoneLogin) {
        user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });

        // Update fields if customized
        if (user && (name || roomNumber || blockAssigned || categoryExpertise || phone)) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              ...(name ? { name: name.trim() } : {}),
              ...(roomNumber !== undefined ? { roomNumber: roomNumber?.trim() || null } : {}),
              ...(blockAssigned !== undefined ? { blockAssigned: blockAssigned?.trim() || null } : {}),
              ...(categoryExpertise !== undefined
                ? { categoryExpertise: categoryExpertise?.trim() || null }
                : {}),
              ...(phone ? { phone: phone.trim() } : {}),
            },
          });
        }
      }

      // If user does not exist but email is provided, register them dynamically!
      if (!user && email && !isPhoneLogin) {
        const cleanEmail = email.trim().toLowerCase();
        const cleanName =
          name?.trim() ||
          cleanEmail
            .split("@")[0]
            .replace(/[._]/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase());

        user = await prisma.user.create({
          data: {
            name: cleanName,
            email: cleanEmail,
            role: targetRole,
            roomNumber: roomNumber?.trim() || null,
            blockAssigned: blockAssigned?.trim() || null,
            categoryExpertise: categoryExpertise?.trim() || null,
            phone: phone?.trim() || null,
          },
        });
      }

      // If still not found and a role was requested, find the first user of that role
      if (!user && requestedRole) {
        user = await prisma.user.findFirst({
          where: { role: targetRole },
        });
      }
    } catch (dbError) {
      console.warn("Auth database operation failed or socket dropped; creating dynamic fallback:", dbError);
    }

    // 2. Resilient dynamic fallback with the exact user credentials provided
    if (!user) {
      const cleanEmail = (email || identifier || "").trim().toLowerCase();
      const matched = FALLBACK_DIRECTORY.find(
        (u) =>
          (userId && u.id === userId) ||
          (cleanEmail && u.email.toLowerCase() === cleanEmail) ||
          (cleanDigits && u.phone && u.phone.replace(/[^0-9]/g, "").includes(cleanDigits)) ||
          (requestedRole && u.role === targetRole)
      );

      if (matched) {
        user = {
          ...matched,
          name: name?.trim() || matched.name,
          roomNumber: roomNumber?.trim() || matched.roomNumber,
          blockAssigned: blockAssigned?.trim() || matched.blockAssigned,
          categoryExpertise: categoryExpertise?.trim() || matched.categoryExpertise,
        };
      } else if (cleanEmail) {
        // Create custom fallback user with exact submitted details
        user = {
          id: userId || `usr_${Date.now()}`,
          name:
            name?.trim() ||
            cleanEmail
              .split("@")[0]
              .replace(/[._]/g, " ")
              .replace(/\b\w/g, (c: string) => c.toUpperCase()),
          email: cleanEmail.includes("@") ? cleanEmail : `staff.${cleanDigits || Date.now()}@hostel.edu`,
          role: targetRole,
          roomNumber: roomNumber?.trim() || (targetRole === Role.STUDENT ? "A-204" : null),
          blockAssigned: blockAssigned?.trim() || (targetRole === Role.WARDEN ? "Block A" : null),
          categoryExpertise: categoryExpertise?.trim() || (targetRole === Role.WORKER ? "ELECTRICAL" : null),
          phone: phone?.trim() || (isPhoneLogin ? rawInput : null),
        };
      } else {
        // Fallback by role from directory
        const roleMatch = FALLBACK_DIRECTORY.find((u) => u.role === targetRole);
        user = roleMatch || FALLBACK_DIRECTORY[0];
      }
    }

    const redirectUrl = resolveRedirect(user.role);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomNumber: user.roomNumber || null,
        blockAssigned: user.blockAssigned || null,
        categoryExpertise: user.categoryExpertise || null,
      },
      redirectUrl,
    });

    const cookieOptions = {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax" as const,
      httpOnly: false,
    };

    response.cookies.set("hcms_role", user.role, cookieOptions);
    response.cookies.set("hcms_user_id", user.id, cookieOptions);
    response.cookies.set("dev_role", user.role, cookieOptions);
    response.cookies.set("userId", user.id, cookieOptions);

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to sign in";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
