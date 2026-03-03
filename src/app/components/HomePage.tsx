import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Bell, Clock, ChevronRight, BookOpen } from "lucide-react";

const avatarUrl =
  "https://images.unsplash.com/photo-1769365705653-73c8e4608825?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3R1ZGVudCUyMGF2YXRhciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDg0Mzk1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const robotUrl =
  "https://images.unsplash.com/photo-1768323102290-3b6ad7d1c5b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcm9ib3QlMjBBSSUyMGxlYXJuaW5nJTIwYXNzaXN0YW50fGVufDF8fHx8MTc3MDg0Mzk1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const courses = [
  {
    id: 1,
    title: "Accounting basics",
    instructor: "Robert K. Thormas",
    tags: ["#Accounting", "#Math"],
    progress: 70,
    progressTime: "50 min",
    bgColor: "bg-[#e8f0d4]",
    progressBarColor: "bg-[#a3c959]",
  },
  {
    id: 2,
    title: "Master Motion Graphics",
    instructor: "Robert K. Thormas",
    tags: ["#Accounting", "#Math"],
    progress: 45,
    progressTime: "35 min",
    bgColor: "bg-[#d4e4f7]",
    progressBarColor: "bg-[#7ab3e8]",
  },
];

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1">
        <span className="text-sm text-gray-800">9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <div className="w-[3px] h-[6px] bg-gray-800 rounded-sm" />
            <div className="w-[3px] h-[8px] bg-gray-800 rounded-sm" />
            <div className="w-[3px] h-[10px] bg-gray-800 rounded-sm" />
            <div className="w-[3px] h-[12px] bg-gray-800 rounded-sm" />
          </div>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M8 3.5C9.8 3.5 11.4 4.2 12.6 5.3L14 3.9C12.4 2.4 10.3 1.5 8 1.5C5.7 1.5 3.6 2.4 2 3.9L3.4 5.3C4.6 4.2 6.2 3.5 8 3.5Z" fill="#1D1D1F"/>
            <path d="M8 7C9 7 9.9 7.4 10.6 8L12 6.6C10.9 5.6 9.5 5 8 5C6.5 5 5.1 5.6 4 6.6L5.4 8C6.1 7.4 7 7 8 7Z" fill="#1D1D1F"/>
            <circle cx="8" cy="10" r="1.5" fill="#1D1D1F"/>
          </svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="#1D1D1F" strokeOpacity="0.35"/>
            <rect x="2" y="2" width="18" height="8" rx="1" fill="#1D1D1F"/>
            <path d="M23 4.5V8.5C23.8 8.2 24.5 7.2 24.5 6.5C24.5 5.8 23.8 4.8 23 4.5Z" fill="#1D1D1F" fillOpacity="0.4"/>
          </svg>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header with avatar and bell */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100">
            <ImageWithFallback
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Upcoming class card */}
        <div className="px-6 pt-3">
          <div className="bg-[#fef9e7] rounded-2xl p-4 flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-lg text-gray-900 mb-0.5" style={{ fontWeight: 700 }}>
                Upcoming Science Class Begins Soon
              </h3>
              <p className="text-xs text-gray-500 mb-3">Robert K. Thormas</p>
              <button className="bg-[#2d2d2d] text-white text-xs px-5 py-2 rounded-full" style={{ fontWeight: 600 }}>
                Join Now
              </button>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full border-2 border-[#2d2d2d] flex items-center justify-center">
                <span className="text-sm text-gray-900" style={{ fontWeight: 700 }}>2/10</span>
              </div>
              <p className="text-[10px] text-gray-500">Total Class</p>
              <p className="text-[10px] text-gray-500">Joined</p>
            </div>
          </div>
        </div>

        {/* Active Courses header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg text-gray-900" style={{ fontWeight: 700 }}>Active Courses</h2>
          <button
            onClick={() => onNavigate("timeline")}
            className="text-sm text-gray-500"
          >
            See more
          </button>
        </div>

        {/* Course cards */}
        <div className="px-6 space-y-4 pb-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`${course.bgColor} rounded-2xl p-4 relative overflow-hidden`}
              onClick={() => onNavigate("timeline")}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-white/60 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5 text-gray-700" />
                    </div>
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-600 bg-white/60 rounded-full px-2.5 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl text-gray-900 mb-0.5" style={{ fontWeight: 700 }}>
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-600">{course.instructor}</p>

                  {/* Progress */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="bg-white/70 rounded-full px-3 py-1 flex items-center gap-1.5">
                      <span className="text-xs text-gray-700" style={{ fontWeight: 600 }}>Progress</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-[10px] text-gray-500">{course.progressTime}</span>
                      </div>
                    </div>
                    <div className="flex-1 h-2 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${course.progressBarColor} rounded-full`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Robot thumbnail */}
                <div className="w-16 h-20 flex-shrink-0">
                  <ImageWithFallback
                    src={robotUrl}
                    alt="Course"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
