import { commandScore } from "@/lib/command-score";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useEffect, useState } from "react";
import { Link as CourseLink, Node } from "@/lib/types";
import { UWFlowRating } from "@/app/api/uwflow/route";
import UWFlowDonut from "./uwflow-donut";
import { X } from "lucide-react";
import UWFlowBar from "./uwflow-bar";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SearchBarProps {
  courses: Node[];
  links: CourseLink[];
  onCourseSelect: (course: Node | null) => void;
  selectedCourse: Node | null;
  onSearchChange: (search: string) => void;
  search: string;
}

type CourseInfo = {
  rating: UWFlowRating;
  prereqs: Node[];
  postreqs: Node[];
};

export default function SearchBar({
  courses,
  onCourseSelect,
  selectedCourse,
  search,
  onSearchChange,
  links,
}: SearchBarProps) {
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);

  const filter = (value: string, search: string) => {
    return search.length > 0 ? commandScore(value, search, []) : 0;
  };

  const fullName = (course: Node) => {
    return `${course.id} - ${course.name}`;
  };

  const handleCourseSelect = (course: Node) => {
    onSearchChange(`${course.id} - ${course.name}`);
    onCourseSelect(course);
  };

  const handleValueChange = (value: string) => {
    onSearchChange(value);
    onCourseSelect(null);
    setCourseInfo(null);
  };

  const handleClearSearch = () => {
    onSearchChange("");
    onCourseSelect(null);
  };

  useEffect(() => {
    const fetchUwFlowData = async () => {
      if (selectedCourse !== null) {
        const apiRes = await fetch(
          "/api/uwflow?" +
            new URLSearchParams({ courseCode: selectedCourse.id }).toString(),
          {
            method: "GET",
          }
        );

        const apiData = (await apiRes.json()) as UWFlowRating;
        // Needed because the force graph mutates links
        const fullLinks = links as unknown as { source: Node; target: Node }[];
        const prereqs = fullLinks
          .filter((link) => link.target.id === selectedCourse.id)
          .map(
            (link) => courses.find((course) => course.id === link.source.id)!
          );
        const postreqs = fullLinks
          .filter((link) => link.source.id === selectedCourse.id)
          .map(
            (link) => courses.find((course) => course.id === link.target.id)!
          );

        console.log(links);

        setCourseInfo({ rating: apiData, prereqs, postreqs });
      } else {
        setCourseInfo(null);
      }
    };

    fetchUwFlowData();
  }, [selectedCourse, courses, links]);

  return (
    <div className="absolute top-0 left-0 ml-5 mt-5 z-10 w-[calc(100vw-2.5rem)] sm:w-96 h-fit bg-background">
      <Command shouldFilter={false} className="h-fit">
        <div className="relative">
          <CommandInput
            value={search}
            onValueChange={handleValueChange}
            placeholder="Search for a course..."
            className={cn({ "mr-8": selectedCourse !== null })}
          />
          <button
            className={cn("absolute top-[calc(50%-0.75rem)] right-2 z-30", {
              hidden: selectedCourse === null,
            })}
            onClick={handleClearSearch}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <CommandList hidden={search.length === 0 || selectedCourse !== null}>
          <CommandEmpty>No results found.</CommandEmpty>
          {courses
            .toSorted(
              (a, b) =>
                filter(fullName(b), search) - filter(fullName(a), search)
            )
            .slice(0, 5)
            .filter((course) => filter(fullName(course), search) > 0)
            .map((course) => (
              <CommandItem
                key={course.id}
                onSelect={() => handleCourseSelect(course)}
                className="cursor-pointer"
              >
                {course.id} - {course.name}
              </CommandItem>
            ))}
        </CommandList>
      </Command>
      {courseInfo !== null && (
        <>
          <div className="flex justify-center gap-x-5 p-2">
            <UWFlowDonut value={courseInfo.rating.liked} title="liked" />
            <div className="flex flex-col justify-center gap-y-3 w-2/3">
              <UWFlowBar value={courseInfo.rating.easy} title="Easy" />
              <UWFlowBar value={courseInfo.rating.useful} title="Useful" />
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">
                  {courseInfo.rating.filled_count} ratings
                </span>
                {selectedCourse !== null && (
                  <Link
                    href={`https://uwflow.com/course/${selectedCourse!.id.toLowerCase()}`}
                    className="underline text-xs text-muted-foreground"
                    target="_blank"
                  >
                    UW Flow
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-y-2 flex-col p-2 text-xs">
            <div>
              <span className="font-bold">Comes after:</span>{" "}
              {courseInfo.prereqs
                .map<React.ReactNode>((prereq) => (
                  <a
                    key={prereq.id}
                    onClick={() => handleCourseSelect(prereq)}
                    className="hover:underline cursor-pointer"
                  >
                    {prereq.id}
                  </a>
                ))
                .reduce((prev, cur) => [prev, ", ", cur])}
            </div>
            <div>
              <span className="font-bold">Comes before:</span>{" "}
              {courseInfo.postreqs
                .map<React.ReactNode>((postreq) => (
                  <a
                    key={postreq.id}
                    onClick={() => handleCourseSelect(postreq)}
                    className="hover:underline cursor-pointer"
                  >
                    {postreq.id}
                  </a>
                ))
                .reduce((prev, cur) => [prev, ", ", cur])}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
