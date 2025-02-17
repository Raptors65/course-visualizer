"""Exports course data from the University of Waterloo academic calendar to a JSON file."""

import json
from bs4 import BeautifulSoup
import requests

response = requests.get("https://uwaterloocm.kuali.co/api/v1/catalog/courses/657084224811c0001ce0fd94?q=")
courses_data = response.json()

courses = []
connections = []

for i, course in enumerate(courses_data):
    try:
        course_data = {
            "id": course["__catalogCourseId"],
            "name": course["title"]
        }

        courses.append(course_data)

        pid = course["pid"]

        detailed_res = requests.get(f"https://uwaterloocm.kuali.co/api/v1/catalog/course/657084224811c0001ce0fd94/{pid}")
        detailed_data = detailed_res.json()

        if "prerequisites" not in detailed_data:
            continue

        soup = BeautifulSoup(detailed_data["prerequisites"], "html.parser")

        for link in soup.select("a[href*=\"courses\"]"):
            prereq_code = link.text
            connections.append({
                "source": prereq_code,
                "destination": course["__catalogCourseId"]
            })
    except Exception as e:
        if isinstance(e, KeyboardInterrupt):
            raise e
        print(f"Failed on {i} with course data {course}")

full_data = {
    "nodes": courses,
    "links": connections
}

with open("course-data.json", mode="w", encoding="utf-8") as data_file:
    data_file.write(json.dumps(full_data))
