import { commandScore } from "@/lib/command-score";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useEffect, useState } from "react";
import { Node } from "@/lib/types";
import { UWFlowRating } from "@/app/api/uwflow/route";
import UWFlowDonut from "./uwflow-donut";
import { X } from "lucide-react";
import UWFlowBar from "./uwflow-bar";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  courses: Node[];
  onCourseSelect: (course: Node | null) => void;
  selectedCourse: Node | null;
  onSearchChange: (search: string) => void;
  search: string;
}

export default function SearchBar({
  courses,
  onCourseSelect,
  selectedCourse,
  search,
  onSearchChange,
}: SearchBarProps) {
  const [courseRating, setCourseRating] = useState<UWFlowRating | null>(null);

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
    setCourseRating(null);
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

        setCourseRating(apiData);
      } else {
        setCourseRating(null);
      }
    };

    fetchUwFlowData();
  }, [selectedCourse]);

  return (
    <div className="absolute top-5 left-5 z-10 w-96 h-fit bg-background">
      <Command shouldFilter={false}>
        <div className="relative">
          <CommandInput
            value={search}
            onValueChange={handleValueChange}
            placeholder="Search for a course..."
            className={cn({ "mr-8": selectedCourse !== null })}
          />
          <button
            className={cn("absolute top-[calc(50%-0.75rem)] right-2", {
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
      {courseRating !== null && (
        <div className="flex justify-center gap-x-5 p-2">
          <UWFlowDonut value={courseRating.liked} title="liked" />
          <div className="flex flex-col justify-center gap-y-3">
            <UWFlowBar value={courseRating.easy} title="Easy" />
            <UWFlowBar value={courseRating.useful} title="Useful" />
            <span className="text-xs text-muted-foreground">
              {courseRating.filled_count} ratings
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
