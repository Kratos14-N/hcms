import { PrismaClient, Role, Priority, ComplaintStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding HCMS database with diverse multi-resident & multi-staff personas...");

  // 1. Clean existing records
  await prisma.chatMessage.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  // 2. Default System Settings
  await prisma.systemSetting.create({
    data: {
      id: "default",
      blackoutStart: "22:00",
      blackoutEnd: "06:00",
      emergencyTimeoutMin: 30,
      autoCloseTimeoutHours: 48,
    },
  });

  // 3. Mock Users - Multiple distinct Students across blocks & rooms
  const student1 = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "aarav.student@hostel.edu",
      role: Role.STUDENT,
      blockAssigned: "Block A",
      roomNumber: "A-204",
      phone: "+919876543210",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Rohan Patel",
      email: "rohan.student@hostel.edu",
      role: Role.STUDENT,
      blockAssigned: "Block B",
      roomNumber: "B-312",
      phone: "+919876543211",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Priya Iyer",
      email: "priya.student@hostel.edu",
      role: Role.STUDENT,
      blockAssigned: "Block C",
      roomNumber: "C-105",
      phone: "+919876543212",
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: "Ananya Das",
      email: "ananya.student@hostel.edu",
      role: Role.STUDENT,
      blockAssigned: "Block A",
      roomNumber: "A-108",
      phone: "+919876543213",
    },
  });

  // Multiple Wardens across Hostel Blocks
  const warden1 = await prisma.user.create({
    data: {
      name: "Dr. Vikram Singh",
      email: "warden.singh@hostel.edu",
      role: Role.WARDEN,
      blockAssigned: "Block A",
      phone: "+919833344455",
    },
  });

  await prisma.user.create({
    data: {
      name: "Prof. Rajesh Gupta",
      email: "warden.gupta@hostel.edu",
      role: Role.WARDEN,
      blockAssigned: "Block B",
      phone: "+919833344466",
    },
  });

  const warden3 = await prisma.user.create({
    data: {
      name: "Dr. Sunita Rao",
      email: "warden.rao@hostel.edu",
      role: Role.WARDEN,
      blockAssigned: "Block C",
      phone: "+919833344477",
    },
  });

  // Multiple Field Technicians with distinct trades & skills
  const workerElectrician = await prisma.user.create({
    data: {
      name: "Ramesh Kumar",
      email: "ramesh.electrician@hostel.edu",
      role: Role.WORKER,
      categoryExpertise: "ELECTRICAL",
      phone: "+919811122233",
    },
  });

  const workerPlumber = await prisma.user.create({
    data: {
      name: "Suresh Verma",
      email: "suresh.plumber@hostel.edu",
      role: Role.WORKER,
      categoryExpertise: "PLUMBING",
      phone: "+919822233344",
    },
  });

  const workerCarpenter = await prisma.user.create({
    data: {
      name: "Amit Sharma",
      email: "amit.carpenter@hostel.edu",
      role: Role.WORKER,
      categoryExpertise: "CARPENTRY",
      phone: "+919833344488",
    },
  });

  const workerNetwork = await prisma.user.create({
    data: {
      name: "Manoj Kumar",
      email: "manoj.network@hostel.edu",
      role: Role.WORKER,
      categoryExpertise: "NETWORKING",
      phone: "+919844455599",
    },
  });

  // Multiple Operations Coordinators
  const coordinator1 = await prisma.user.create({
    data: {
      name: "Pooja Mehta",
      email: "admin.hcms@hostel.edu",
      role: Role.COORDINATOR,
      phone: "+919844455566",
    },
  });

  await prisma.user.create({
    data: {
      name: "Kavita Nambiar",
      email: "kavita.operations@hostel.edu",
      role: Role.COORDINATOR,
      phone: "+919855566677",
    },
  });

  // 4. Categories & Sub-Categories
  const electrical = await prisma.category.create({
    data: {
      name: "Electrical",
      subCategories: {
        create: [
          { name: "Ceiling Fan Malfunction", defaultTATHours: 12 },
          { name: "Power Socket Sparking / Dead", defaultTATHours: 8 },
          { name: "Room Tube Light Replacement", defaultTATHours: 24 },
        ],
      },
    },
    include: { subCategories: true },
  });

  const plumbing = await prisma.category.create({
    data: {
      name: "Plumbing",
      subCategories: {
        create: [
          { name: "Tap / Faucet Water Leakage", defaultTATHours: 8 },
          { name: "Washroom Drain Clogged", defaultTATHours: 6 },
          { name: "Geyser Heating Failure", defaultTATHours: 24 },
        ],
      },
    },
    include: { subCategories: true },
  });

  const wifi = await prisma.category.create({
    data: {
      name: "Wi-Fi & Network",
      subCategories: {
        create: [
          { name: "No Internet / Access Point Offline", defaultTATHours: 4 },
          { name: "Slow Speed / Packet Drop", defaultTATHours: 12 },
        ],
      },
    },
    include: { subCategories: true },
  });

  const carpentry = await prisma.category.create({
    data: {
      name: "Carpentry & Furniture",
      subCategories: {
        create: [
          { name: "Study Desk / Wardrobe Hinge Broken", defaultTATHours: 24 },
          { name: "Door Lock & Handle Jammed", defaultTATHours: 6 },
          { name: "Bed Frame / Slats Loose", defaultTATHours: 18 },
        ],
      },
    },
    include: { subCategories: true },
  });

  // 5. Sample Complaints across different students, rooms & workers
  const now = new Date();

  // Ticket 1: Aarav Sharma in Room A-204 (Ceiling fan)
  const fanSub = electrical.subCategories[0];
  await prisma.complaint.create({
    data: {
      complaintRefId: "CMP-26-1001",
      studentId: student1.id,
      workerId: workerElectrician.id,
      subCategoryId: fanSub.id,
      location: "Room A-204",
      description: "Ceiling fan making a loud grinding noise and running at lowest speed.",
      priority: Priority.NORMAL,
      status: ComplaintStatus.IN_PROGRESS,
      tatDeadline: new Date(now.getTime() + 12 * 60 * 60 * 1000),
      auditLogs: {
        create: [
          { actionTaken: "COMPLAINT_LOGGED", userId: student1.id },
          { actionTaken: "WORKER_ASSIGNED", userId: warden1.id, metadata: { workerId: workerElectrician.id } },
          { actionTaken: "STATUS_IN_PROGRESS", userId: workerElectrician.id },
        ],
      },
    },
  });

  // Ticket 2: Rohan Patel in Room B-312 (Plumbing Emergency)
  const tapSub = plumbing.subCategories[0];
  await prisma.complaint.create({
    data: {
      complaintRefId: "CMP-26-1002",
      studentId: student2.id,
      workerId: workerPlumber.id,
      subCategoryId: tapSub.id,
      location: "Room B-312 Washroom",
      description: "Water pipe ruptured under the basin, water flooding the floor continuously.",
      priority: Priority.EMERGENCY,
      emergencyFlag: true,
      status: ComplaintStatus.LOGGED,
      tatDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      auditLogs: {
        create: [
          { actionTaken: "COMPLAINT_LOGGED_EMERGENCY", userId: student2.id },
          { actionTaken: "DISPATCHED_BY_COORDINATOR", userId: coordinator1.id },
        ],
      },
    },
  });

  // Ticket 3: Priya Iyer in Room C-105 (Carpentry furniture)
  const deskSub = carpentry.subCategories[0];
  await prisma.complaint.create({
    data: {
      complaintRefId: "CMP-26-1003",
      studentId: student3.id,
      workerId: workerCarpenter.id,
      subCategoryId: deskSub.id,
      location: "Room C-105",
      description: "Study desk drawer track is broken and wardrobe upper hinge is detached.",
      priority: Priority.NORMAL,
      status: ComplaintStatus.ASSIGNED,
      tatDeadline: new Date(now.getTime() + 20 * 60 * 60 * 1000),
      auditLogs: {
        create: [
          { actionTaken: "COMPLAINT_LOGGED", userId: student3.id },
          { actionTaken: "WORKER_ASSIGNED", userId: warden3.id, metadata: { workerId: workerCarpenter.id } },
        ],
      },
    },
  });

  // Ticket 4: Ananya Das in Room A-108 (Wi-Fi speed drop)
  const wifiSub = wifi.subCategories[1];
  await prisma.complaint.create({
    data: {
      complaintRefId: "CMP-26-1004",
      studentId: student4.id,
      workerId: workerNetwork.id,
      subCategoryId: wifiSub.id,
      location: "Room A-108",
      description: "Severe packet loss and disconnected every 5 minutes on the hostel subnet.",
      priority: Priority.HIGH,
      status: ComplaintStatus.RESOLVED,
      tatDeadline: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 30 * 60 * 1000),
      resolutionNotes: "Router access point rebooted and DHCP lease renewed.",
      auditLogs: {
        create: [
          { actionTaken: "COMPLAINT_LOGGED", userId: student4.id },
          { actionTaken: "STATUS_RESOLVED", userId: workerNetwork.id },
        ],
      },
    },
  });

  console.log("Seeding complete! Diverse multi-resident and multi-staff accounts created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });