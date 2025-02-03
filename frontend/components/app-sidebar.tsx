"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Map } from "lucide-react";
import SchoolSwitcher from "./school-switcher";
import {
  VirtualizedCombobox,
  // VirtualizedCombobox,
} from "./virtualized-combobox";
import coursesData from "../data/courses-data.json";

const schools = [
  {
    name: "University of Waterloo",
    logo: Map,
    plan: "Waterloo, ON",
  },
  {
    name: "University of Toronto",
    logo: Map,
    plan: "Toronto, ON",
  },
];

const options = coursesData.nodes.map((node) => ({
  value: node.id,
  label: node.id,
}));

interface AppSidebarProps {
  focusedCourse: string;
  onCourseSelect: (course: string) => void;
}

export function AppSidebar({ focusedCourse, onCourseSelect }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader />
      <SidebarContent>
        <SidebarHeader>
          <SchoolSwitcher schools={schools} />
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Selected Course</SidebarGroupLabel>
          <VirtualizedCombobox
            options={options}
            value={focusedCourse}
            onSelect={onCourseSelect}
          />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
