import { commandScore } from "@/lib/command-score";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useEffect, useState } from "react";
import { Pie, PieChart, Label } from "recharts";
import { Node } from "@/lib/types";
import { UWFlowRating } from "@/app/api/uwflow/route";
import UWFlowDonut from "./uwflow-donut";

interface SearchBarProps {
  courses: Node[];
  onCourseSelect: (courseCode: string) => void;
}

export default function SearchBar({ courses, onCourseSelect }: SearchBarProps) {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Node | null>(null);
  const [courseRating, setCourseRating] = useState<UWFlowRating | null>(null);

  const filter = (value: string, search: string) => {
    return search.length > 0 ? commandScore(value, search, []) : 0;
  };

  const fullName = (course: Node) => {
    return `${course.id} - ${course.name}`;
  };

  const handleCourseSelect = (course: Node) => {
    setSearch(`${course.id} - ${course.name}`);
    setSelectedCourse(course);
    onCourseSelect(course.id);
  };

  const handleValueChange = (value: string) => {
    setSearch(value);
    setSelectedCourse(null);
    setCourseRating(null);
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
      }
    };

    fetchUwFlowData();
  }, [selectedCourse]);

  return (
    <div className="absolute top-5 left-5 z-10 w-96 h-fit bg-background">
      <Command shouldFilter={false}>
        <CommandInput
          value={search}
          onValueChange={handleValueChange}
          placeholder="Search for a course..."
        />
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
        <div className="flex justify-center">
          <UWFlowDonut value={courseRating.liked} title="Liked" />
          <UWFlowDonut value={courseRating.easy} title="Easy" />
          <UWFlowDonut value={courseRating.useful} title="Useful" />
        </div>
      )}
    </div>
  );
}
