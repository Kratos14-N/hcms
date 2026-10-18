"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  ThumbsUp, 
  Plus, 
  X, 
  MapPin, 
  Sparkles,
  Play,
  Image as ImageIcon,
  Video as VideoIcon
} from "lucide-react";

interface MomentStory {
  id: string;
  author: string;
  room: string;
  title: string;
  category: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  upvotes: number;
  timeAgo: string;
  avatarColor: string;
  urgent: boolean;
  userUpvoted?: boolean;
}

const INITIAL_MOMENTS: MomentStory[] = [
  {
    id: "m-1",
    author: "Rohan V.",
    room: "Block A - 2nd Fl",
    title: "Water cooler pipe cracked and leaking all over corridor",
    category: "Appliances",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    upvotes: 19,
    timeAgo: "2h ago",
    avatarColor: "from-amber-400 to-orange-500",
    urgent: true,
  },
  {
    id: "m-2",
    author: "Pooja S.",
    room: "Wing B - 302",
    title: "Switchboard smoking and sparking when plugging laptop",
    category: "Electrical",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    upvotes: 31,
    timeAgo: "4h ago",
    avatarColor: "from-rose-400 to-red-500",
    urgent: true,
  },
  {
    id: "m-3",
    author: "Devendra K.",
    room: "Mess Hall",
    title: "Water overflow in handwash gallery",
    category: "Plumbing",
    mediaType: "video",
    mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    upvotes: 14,
    timeAgo: "5h ago",
    avatarColor: "from-blue-400 to-indigo-500",
    urgent: false,
  },
  {
    id: "m-4",
    author: "Aman T.",
    room: "Block A - 104",
    title: "Ceiling fan rattling loudly on speed regulator 4",
    category: "Maintenance",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    upvotes: 12,
    timeAgo: "7h ago",
    avatarColor: "from-purple-400 to-pink-500",
    urgent: false,
  },
];

interface CampusMomentsProps {
  authorName?: string;
  authorRoom?: string;
}

export default function CampusMoments({ authorName, authorRoom }: CampusMomentsProps = {}) {
  const [moments, setMoments] = useState<MomentStory[]>(INITIAL_MOMENTS);
  const [activeStory, setActiveStory] = useState<MomentStory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setMediaType(file.type.startsWith("video") ? "video" : "image");
    }
  };

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const already = m.userUpvoted;
          return {
            ...m,
            upvotes: already ? m.upvotes - 1 : m.upvotes + 1,
            userUpvoted: !already,
          };
        }
        return m;
      })
    );

    if (activeStory && activeStory.id === id) {
      setActiveStory((prev) =>
        prev
          ? {
              ...prev,
              upvotes: prev.userUpvoted ? prev.upvotes - 1 : prev.upvotes + 1,
              userUpvoted: !prev.userUpvoted,
            }
          : null
      );
    }
  };

  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newStory: MomentStory = {
      id: `m-${Date.now()}`,
      author: authorName || "Resident Student",
      room: newLocation || authorRoom || "Hostel Resident",
      title: newTitle,
      category: isUrgent ? "Hazard Incident" : "General Repair",
      mediaType,
      mediaUrl:
        previewUrl ||
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      upvotes: 1,
      timeAgo: "Just now",
      avatarColor: "from-teal-400 to-emerald-600",
      urgent: isUrgent,
      userUpvoted: true,
    };

    setMoments([newStory, ...moments]);
    setNewTitle("");
    setNewLocation("");
    setPreviewUrl("");
    setIsUrgent(false);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Hostel Moments & Video Stories
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          Click any story to view photo/video proof
        </span>
      </div>

      {/* Story Bubbles Feed */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 pt-1 no-scrollbar select-none">
        {/* Post Story Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-teal-500/80 bg-teal-50/60 flex items-center justify-center text-teal-700 group-hover:scale-105 group-hover:bg-teal-100 transition shadow-xs">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-teal-800">Post Story</span>
        </button>

        {/* Stories List */}
        {moments.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveStory(item)}
            className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none cursor-pointer"
          >
            <div
              className={`relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr ${
                item.urgent
                  ? "from-rose-500 via-amber-500 to-red-500 animate-pulse"
                  : item.avatarColor
              } shadow-sm group-hover:scale-105 transition`}
            >
              <div className="w-full h-full rounded-full bg-white p-0.5 overflow-hidden flex items-center justify-center">
                {item.mediaType === "video" ? (
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center relative">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                ) : (
                  <Image
                    src={item.mediaUrl}
                    alt={item.title}
                    width={64}
                    height={64}
                    unoptimized
                    className="w-full h-full object-cover rounded-full"
                  />
                )}
              </div>
              {item.mediaType === "video" && (
                <span className="absolute bottom-0 right-0 p-1 rounded-full bg-slate-950 text-white text-[9px] border border-white">
                  ▶
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-slate-700 max-w-[65px] truncate">
                {item.author.split(" ")[0]}
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1 rounded-sm">
                +{item.upvotes}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative text-white max-h-[90vh]">
            {/* Top Bar Overlay */}
            <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${activeStory.avatarColor} flex items-center justify-center font-bold text-xs text-white shadow-md`}
                >
                  {activeStory.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    {activeStory.author}
                    {activeStory.urgent && (
                      <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded">
                        HAZARD
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-teal-400" />
                    {activeStory.room} • {activeStory.timeAgo}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveStory(null)}
                className="text-slate-300 hover:text-white transition p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Content Stage */}
            <div className="relative w-full h-96 sm:h-[420px] bg-black flex items-center justify-center overflow-hidden">
              {activeStory.mediaType === "video" ? (
                <video
                  src={activeStory.mediaUrl}
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={activeStory.mediaUrl}
                  alt={activeStory.title}
                  width={600}
                  height={400}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Story Details & Upvote Action */}
            <div className="p-5 space-y-3 bg-slate-900 border-t border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                  {activeStory.category}
                </span>
                <p className="text-sm font-bold text-white mt-0.5 leading-snug">
                  &ldquo;{activeStory.title}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>{activeStory.upvotes} students affected</span>
                </div>

                <button
                  onClick={(e) => handleUpvote(activeStory.id, e)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    activeStory.userUpvoted
                      ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{activeStory.userUpvoted ? "Upvoted (+1)" : "Affects Me Too"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Moment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Post Image/Video Moment
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  What is malfunctioning?
                </label>
                <textarea
                  required
                  rows={2}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Geyser sparking and leaking warm water in 2nd-floor washroom"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Room
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Wing B, Floor 2 Washroom"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Upload Photo/Video Preview Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Photo / Video Proof
                </label>
                <label className="border-2 border-dashed border-slate-300 rounded-xl p-3 flex flex-col items-center justify-center hover:border-teal-500 hover:bg-teal-50/40 transition cursor-pointer">
                  {previewUrl ? (
                    mediaType === "video" ? (
                      <video src={previewUrl} className="h-28 rounded-lg object-cover" controls />
                    ) : (
                      <Image src={previewUrl} alt="Preview" width={200} height={112} unoptimized className="h-28 rounded-lg object-cover" />
                    )
                  ) : (
                    <div className="text-center py-2 text-slate-500">
                      <div className="flex items-center justify-center gap-2 text-teal-600 mb-1">
                        <ImageIcon className="w-5 h-5" />
                        <VideoIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold">Choose photo or record video</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="urgentModal"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="urgentModal" className="text-xs text-slate-700 font-medium">
                  Mark as urgent electrical / safety hazard
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm cursor-pointer"
                >
                  Publish Moment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}