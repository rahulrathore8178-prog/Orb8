import React, { useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaBrain, FaCloud, FaCode, FaDatabase, FaRobot } from "react-icons/fa";
import { courseList } from "../data/courseCatalog.jsx";

const domains = ["All", "Coding", "AI", "ML", "Data", "Cloud", "DevOps", "Security"];

function domainIcon(domain) {
  if (domain === "AI") return <FaRobot className="text-cyan-300" />;
  if (domain === "ML") return <FaBrain className="text-cyan-300" />;
  if (domain === "Data") return <FaDatabase className="text-cyan-300" />;
  if (domain === "Cloud") return <FaCloud className="text-cyan-300" />;
  return <FaCode className="text-cyan-300" />;
}

export default function LearnPage() {
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "";
  const [query, setQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState("All");
  const [isEnrollingCourse, setIsEnrollingCourse] = useState("");
  const [enrollError, setEnrollError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleStartCourse = async (courseId) => {
    setEnrollError("");
    setIsEnrollingCourse(courseId);

    try {
      await axios.post(
        `${apiUrl}/api/learning/courses/${courseId}/enroll`,
        {},
        {
          withCredentials: true,
          headers: getAuthHeaders()
        }
      );
      navigate(`/language/${courseId}`);
    } catch (error) {
      setEnrollError(error.response?.data?.message || "Unable to start this course right now.");
    } finally {
      setIsEnrollingCourse("");
    }
  };

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return courseList.filter((course) => {
      const domainMatch = activeDomain === "All" || course.domain === activeDomain;
      const queryMatch =
        normalizedQuery.length === 0 ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.domain.toLowerCase().includes(normalizedQuery) ||
        course.summary.toLowerCase().includes(normalizedQuery);
      return domainMatch && queryMatch;
    });
  }, [query, activeDomain]);

  return (
    <div className="min-h-screen bg-[#0f1419] text-white font-sans p-3 sm:p-5 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-[#1a2332] border border-[#2a3a4a] rounded-2xl p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold">Explore Courses</h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Pick from coding, AI, ML, data, cloud, and more. Build your own learning path.
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by course or topic"
              className="w-full bg-[#141b24] border border-[#1f2a38] rounded-lg px-4 py-3 text-sm outline-none focus:border-cyan-500"
            />
            <div className="flex gap-2 flex-wrap">
              {domains.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setActiveDomain(domain)}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm border transition ${
                    activeDomain === domain
                      ? "bg-cyan-600/30 border-cyan-500/60 text-cyan-200"
                      : "bg-[#141b24] border-[#1f2a38] text-gray-300 hover:border-cyan-500/50"
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="bg-[#1a2332] border border-[#2a3a4a] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">All Learning Tracks</h2>
            <span className="text-xs text-gray-400">{filteredCourses.length} courses</span>
          </div>

          {enrollError ? (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {enrollError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <article key={course.id} className="bg-[#141b24] border border-[#1f2a38] rounded-xl p-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-cyan-200">
                    {domainIcon(course.domain)}
                    {course.domain}
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-full border border-cyan-600/40 bg-cyan-600/20 text-cyan-200">
                    {course.level}
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-3">{course.title}</h3>
                <p className="text-sm text-gray-400 mt-2 flex-1">{course.summary}</p>
                <button
                  type="button"
                  className="mt-4 w-full py-2.5 rounded-lg bg-linear-to-r from-cyan-400 to-emerald-400 text-gray-950 font-bold hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => handleStartCourse(course.id)}
                  disabled={isEnrollingCourse === course.id}
                >
                  {isEnrollingCourse === course.id ? "Enrolling..." : "Start Course"}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
