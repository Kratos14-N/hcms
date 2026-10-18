import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { Priority, ComplaintStatus, AttachmentType, Role } from "@prisma/client";
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import { FormSubmitButton } from "@/components/form-submit-button";

export const instant = false;

async function NewRequestFormContent() {
  const categories = await prisma.category.findMany({
    include: { subCategories: true },
    orderBy: { name: "asc" },
  });

  const cookieStore = await cookies();
  const sessionUserId =
    cookieStore.get("hcms_user_id")?.value ||
    cookieStore.get("userId")?.value;

  const currentStudent = sessionUserId
    ? await prisma.user.findUnique({ where: { id: sessionUserId } })
    : null;

  async function createComplaint(formData: FormData) {
    "use server";

    const subCategoryId = formData.get("subCategoryId")?.toString();
    const location = formData.get("location")?.toString()?.trim();
    const description = formData.get("description")?.toString()?.trim();
    const isEmergency = formData.get("isEmergency") === "on";
    const file = formData.get("file") as File | null;

    if (!subCategoryId || !location || !description) {
      return;
    }

    const cStore = await cookies();
    const sId = cStore.get("hcms_user_id")?.value || cStore.get("userId")?.value;

    let studentUser = sId
      ? await prisma.user.findUnique({ where: { id: sId } })
      : null;

    if (!studentUser) {
      studentUser = await prisma.user.findFirst({
        where: { role: Role.STUDENT },
      });
      if (!studentUser) {
        studentUser = await prisma.user.create({
          data: {
            name: "Resident Student",
            email: "student@hostel.edu",
            role: Role.STUDENT,
          },
        });
      }
    }

    const refId = `HCMS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const tatDeadline = new Date(
      now.getTime() + (isEmergency ? 2 : 24) * 60 * 60 * 1000
    );

    const created = await prisma.complaint.create({
      data: {
        complaintRefId: refId,
        studentId: studentUser.id,
        subCategoryId,
        location,
        description,
        priority: isEmergency ? Priority.EMERGENCY : Priority.NORMAL,
        emergencyFlag: isEmergency,
        status: ComplaintStatus.LOGGED,
        tatDeadline,
      },
    });

    // Handle File Upload directly to public/uploads
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".jpg";
      const sanitizedFilename = `proof-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, sanitizedFilename), buffer);

      const fileUrl = `/uploads/${sanitizedFilename}`;
      const isVideo = file.type.includes("video") || ext.toLowerCase().endsWith(".mp4");

      await prisma.attachment.create({
        data: {
          complaintId: created.id,
          fileUrl,
          fileType: isVideo
            ? AttachmentType.VIDEO_MP4
            : file.type.includes("png")
            ? AttachmentType.IMAGE_PNG
            : AttachmentType.IMAGE_JPEG,
          isResolutionProof: false,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        complaintId: created.id,
        actionTaken: `TICKET_REGISTERED: ${
          isEmergency ? "URGENT HAZARD (2-Hour SLA)" : "STANDARD MAINTENANCE (24-Hour SLA)"
        } lodged by ${studentUser.name}`,
      },
    });

    revalidatePath("/student");
    revalidatePath("/warden");
    revalidatePath("/coordinator");
    redirect(`/student/requests/${created.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Back button */}
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to My Complaints
      </Link>

      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Resident Lodging Desk
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Lodge Maintenance Request.
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Describe the issue and attach optional photo/video evidence. Tickets are automatically routed to on-duty staff.
        </p>
      </div>

      <form
        action={createComplaint}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg shadow-slate-200/40 space-y-5"
      >
        {/* Service Classification */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Category & Fault Type <span className="text-rose-500">*</span>
          </label>
          <select
            name="subCategoryId"
            required
            className="w-full text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">Select Category & Issue Type...</option>
            {categories.map((cat) => (
              <optgroup key={cat.id} label={cat.name}>
                {cat.subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {cat.name} — {sub.name} (SLA: {sub.defaultTATHours}h)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Room / Floor Location <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="location"
              required
              defaultValue={currentStudent?.roomNumber ? `Room ${currentStudent.roomNumber}` : ""}
              placeholder="e.g. Room B-312, Floor 2 Corridor, or Block Washroom"
              className="w-full text-xs sm:text-sm pl-11 pr-4 py-3 rounded-2xl border border-slate-300 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Description of the Defect <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={3}
            placeholder="Please detail the malfunction (e.g. Ceiling fan grinding noise, washroom pipe leak, or Wi-Fi AP red blinking light)..."
            className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-300 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition leading-relaxed"
          />
        </div>

        {/* Photo / Video upload */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Attach Evidence (Photo or Video)
          </label>
          <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/60 hover:bg-indigo-50/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 transition">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                Click to browse photo or video
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, or MP4 video (up to 10MB)
              </p>
            </div>
            <input
              type="file"
              name="file"
              accept="image/*,video/*"
              className="hidden"
            />
          </label>
        </div>

        {/* Emergency Hazard Toggle */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
          <input
            type="checkbox"
            name="isEmergency"
            id="isEmergency"
            className="mt-0.5 w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
          />
          <div className="space-y-0.5">
            <label
              htmlFor="isEmergency"
              className="text-xs font-bold text-slate-900 cursor-pointer flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Flag as Critical / Emergency Hazard
            </label>
            <p className="text-[11px] text-slate-500 leading-normal">
              Triggers the immediate 2-hour warden dispatch countdown. Reserve for water flooding, sparks, short circuits, or structural risks.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <FormSubmitButton
            label="Submit Maintenance Ticket"
            pendingLabel="Lodging Ticket & Dispatching..."
          />
        </div>
      </form>
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-sm text-slate-400">
          Loading ticket lodging desk...
        </div>
      }
    >
      <NewRequestFormContent />
    </Suspense>
  );
}