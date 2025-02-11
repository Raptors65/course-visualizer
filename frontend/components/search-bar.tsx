import { commandScore } from "@/lib/command-score";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useState } from "react";
import { Node } from "@/lib/types";

interface SearchBarProps {
  courses: Node[];
  onCourseSelect: (courseCode: string) => void;
}

export default function SearchBar({ courses, onCourseSelect }: SearchBarProps) {
  const [search, setSearch] = useState("");

  const filter = (value: string, search: string) => {
    return search.length > 0 ? commandScore(value, search, []) : 0;
  };

  const fullName = (course: Node) => {
    return `${course.id} ${course.name}`;
  };

  return (
    <Command
      className="absolute top-5 left-5 z-10 w-96 h-fit"
      shouldFilter={false}
    >
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder="Type a command or search..."
      />
      <CommandList hidden={search.length === 0}>
        <CommandEmpty>No results found.</CommandEmpty>
        {courses
          .toSorted(
            (a, b) => filter(fullName(b), search) - filter(fullName(a), search)
          )
          .slice(0, 5)
          .filter((course) => filter(fullName(course), search) > 0)
          .map((course) => (
            <CommandItem
              key={course.id}
              onSelect={() => onCourseSelect(course.id)}
            >
              {course.id} - {course.name}
            </CommandItem>
          ))}
      </CommandList>
    </Command>
  );
}
